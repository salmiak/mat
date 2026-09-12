import sharp from 'sharp'
import { and, eq, isNull } from 'drizzle-orm'
import type { Db } from './db/client.js'
import type { ChangeBus } from './events.js'
import { images, recipes } from './db/schema.js'
import { storeImage } from './routes/images.js'
import { serializeRecipe } from './routes/recipes.js'

const MAX_WIDTH = 1200

export type AiImageGenerator = (title: string, comment: string) => Promise<{ data: Buffer, contentType: string } | null>

// Generates a food photo with Gemini's image model (Google AI Studio API
// key). Returns null quietly on any failure — a recipe without an image
// is fine.
export const generateAiImage: AiImageGenerator = async (title, comment) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  const model = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'

  // Deliberately stylized so AI-generated images are recognizable at a
  // glance next to real photos of the family's cooking.
  const context = comment.replace(/\s+/g, ' ').slice(0, 300)
  const prompt =
    `Risograph print illustration of the home-cooked dish "${title}".` +
    (context ? ` The recipe: ${context}.` : '') +
    ' Visible halftone dot texture, slight color misregistration between layers,' +
    ' 2 spot colors only (e.g. teal and coral) plus paper white, grainy print texture,' +
    ' flat shapes with minimal shading. Wide landscape composition, 16:9 aspect ratio.' +
    ' No text, no logos, no people, no hands, no photorealism.'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Matches the 16:9 frame the cards display images in
        generationConfig: { imageConfig: { aspectRatio: '16:9' } }
      }),
      signal: AbortSignal.timeout(60_000)
    }
  )
  if (!res.ok) {
    console.warn(`Gemini image generation failed: ${res.status} ${(await res.text()).slice(0, 300)}`)
    return null
  }

  interface Part { inlineData?: { mimeType?: string, data?: string }, inline_data?: { mime_type?: string, data?: string } }
  const body = await res.json() as { candidates?: Array<{ content?: { parts?: Part[] } }> }
  const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data || p.inline_data?.data)
  const base64 = part?.inlineData?.data ?? part?.inline_data?.data
  if (!base64) return null

  const data = await sharp(Buffer.from(base64, 'base64'))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  return { data, contentType: 'image/webp' }
}

// Regenerate every AI-generated image with the current prompt/style.
// Runs sequentially (rate limits); an upload that lands mid-run wins,
// since the update is guarded on image_source still being 'ai'.
export async function regenerateAiImages (
  db: Db,
  bus: ChangeBus | undefined,
  generator: AiImageGenerator = generateAiImage
): Promise<{ total: number, regenerated: number }> {
  const targets = await db.select().from(recipes).where(eq(recipes.imageSource, 'ai'))
  let regenerated = 0
  for (const recipe of targets) {
    try {
      const generated = await generator(recipe.title, recipe.comment)
      if (!generated) continue
      const oldImageId = recipe.imageId
      const imageId = await storeImage(db, generated.data, generated.contentType, 'ai-image.webp')

      const [updated] = await db.update(recipes)
        .set({ imageId, updatedAt: new Date() })
        .where(and(eq(recipes.id, recipe.id), eq(recipes.imageSource, 'ai')))
        .returning()
      if (!updated) {
        await db.delete(images).where(eq(images.id, imageId))
        continue
      }
      if (oldImageId !== null) {
        await db.delete(images).where(eq(images.id, oldImageId))
      }
      bus?.publish({ resource: 'recipes', action: 'saved', recipe: serializeRecipe(updated) })
      regenerated++
    } catch (err) {
      console.warn(`AI image regeneration failed for recipe ${recipe.id}:`, (err as Error).message)
    }
  }
  return { total: targets.length, regenerated }
}

// Fire-and-forget AI-image fallback for a recipe with no image at all.
// Never touches uploads or og images, and a concurrent upload wins.
// Resolves to whether an image was attached.
export async function attachAiImage (
  db: Db,
  bus: ChangeBus | undefined,
  recipeId: number,
  generator: AiImageGenerator = generateAiImage
): Promise<boolean> {
  try {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, recipeId))
    if (!recipe || recipe.imageId !== null || recipe.legacyImageUrl) return false

    const generated = await generator(recipe.title, recipe.comment)
    if (!generated) return false
    const imageId = await storeImage(db, generated.data, generated.contentType, 'ai-image.webp')

    const [updated] = await db.update(recipes)
      .set({ imageId, imageSource: 'ai', updatedAt: new Date() })
      .where(and(eq(recipes.id, recipeId), isNull(recipes.imageId)))
      .returning()
    if (!updated) {
      await db.delete(images).where(eq(images.id, imageId))
      return false
    }

    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serializeRecipe(updated) })
    return true
  } catch (err) {
    console.warn(`AI image generation failed for recipe ${recipeId}:`, (err as Error).message)
    return false
  }
}
