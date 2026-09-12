import { Router, type Response } from 'express'
import { asc, eq, ne, sql } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { images, mealRecipes, mealVotes, recipes } from '../db/schema.js'
import { storeImage } from './images.js'
import type { ChangeBus } from '../events.js'
import { attachOgImage, fetchOgImage, type OgImageFetcher } from '../ogImage.js'
import { attachAiImage, regenerateAiImages, type AiImageGenerator } from '../aiImage.js'

interface RecipePayload {
  title?: string
  comment?: string
  url?: string
  imageUrl?: string | null
}

// The API exposes a single imageUrl field. Internally an uploaded image is a
// row in the images table (/api/images/:id) while un-migrated recipes still
// carry their old absolute URL in legacy_image_url.
function recipeFields (body: RecipePayload) {
  const imageUrl = body.imageUrl || null
  const match = imageUrl && /^\/api\/images\/(\d+)$/.exec(imageUrl)
  return {
    title: body.title ?? '',
    comment: body.comment ?? '',
    url: body.url ?? '',
    imageId: match ? Number(match[1]) : null,
    legacyImageUrl: match ? null : imageUrl
  }
}

function normalizeUrl (url: string): string {
  return url.trim().replace(/\/+$/, '')
}

// A recipe's score is the sum of thumb votes on the meals it belongs to
async function loadScores (db: Db): Promise<Map<number, number>> {
  const rows = await db.select({
    recipeId: mealRecipes.recipeId,
    score: sql<number>`sum(${mealVotes.value})`
  }).from(mealRecipes)
    .innerJoin(mealVotes, eq(mealVotes.mealId, mealRecipes.mealId))
    .groupBy(mealRecipes.recipeId)
  return new Map(rows.map((row) => [row.recipeId, Number(row.score)]))
}

export function serializeRecipe (recipe: typeof recipes.$inferSelect, score = 0) {
  return {
    id: recipe.id,
    title: recipe.title,
    comment: recipe.comment,
    url: recipe.url,
    score,
    // 'upload' | 'og' | 'ai' | null — lets the client treat AI/og images
    // as decoration rather than linking to the full-size file
    imageSource: recipe.imageSource,
    imageUrl: recipe.imageId != null
      ? `/api/images/${recipe.imageId}`
      : (recipe.legacyImageUrl || null),
    // Downscaled version for lists; legacy external URLs have no thumb
    thumbUrl: recipe.imageId != null
      ? `/api/images/${recipe.imageId}?size=thumb`
      : (recipe.legacyImageUrl || null)
  }
}

export function recipesRouter (
  db: Db,
  bus?: ChangeBus,
  ogFetcher?: OgImageFetcher | null,
  aiGenerator?: AiImageGenerator | null
): Router {
  const router = Router()

  // Fire-and-forget image pipeline for recipes without a chosen image:
  // the linked page's og:image first, an AI-generated photo as fallback
  function scheduleImage (recipeId: number) {
    void (async () => {
      const attached = ogFetcher === null ? false : await attachOgImage(db, bus, recipeId, ogFetcher)
      if (!attached && aiGenerator !== null) {
        await attachAiImage(db, bus, recipeId, aiGenerator)
      }
    })()
  }

  // POST /api/recipes/regenerate-ai-images — re-render every AI-generated
  // image with the current prompt/style. Responds immediately; the work
  // runs in the background and publishes bus events per updated recipe.
  router.post('/regenerate-ai-images', async (_req, res) => {
    if (aiGenerator === null || aiGenerator === undefined) {
      res.status(503).json({ error: 'AI image generation is not configured' })
      return
    }
    const targets = await db.select({ id: recipes.id }).from(recipes).where(eq(recipes.imageSource, 'ai'))
    res.status(202).json({ queued: targets.length })
    void regenerateAiImages(db, bus, aiGenerator)
      .then(({ total, regenerated }) => console.log(`AI image regeneration done: ${regenerated}/${total}`))
  })

  // Replace a recipe's image with a freshly generated/fetched one, on the
  // user's explicit request from the editor. Deletes the replaced image row.
  async function replaceImage (
    recipeId: number,
    generated: { data: Buffer, contentType: string },
    source: 'ai' | 'og',
    res: Response
  ) {
    const imageId = await storeImage(db, generated.data, generated.contentType, `${source}-image`)
    const [current] = await db.select({ imageId: recipes.imageId }).from(recipes).where(eq(recipes.id, recipeId))
    const [updated] = await db.update(recipes)
      .set({ imageId, imageSource: source, legacyImageUrl: null, updatedAt: new Date() })
      .where(eq(recipes.id, recipeId))
      .returning()
    if (!updated) {
      await db.delete(images).where(eq(images.id, imageId))
      res.status(404).json({ error: 'Recipe not found' })
      return
    }
    if (current?.imageId != null) {
      await db.delete(images).where(eq(images.id, current.imageId))
    }
    const serialized = serializeRecipe(updated, (await loadScores(db)).get(recipeId) ?? 0)
    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serialized })
    res.json({ recipe: serialized })
  }

  // POST /api/recipes/:id/generate-ai-image — force a new AI image,
  // replacing whatever image the recipe has. Optional {title, comment}
  // overrides let the editor use its unsaved draft values.
  router.post('/:id/generate-ai-image', async (req, res) => {
    if (aiGenerator == null) {
      res.status(503).json({ error: 'AI image generation is not configured' })
      return
    }
    const id = Number(req.params.id)
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id))
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' })
      return
    }
    const title = typeof req.body?.title === 'string' && req.body.title.trim() ? req.body.title : recipe.title
    const comment = typeof req.body?.comment === 'string' ? req.body.comment : recipe.comment
    const generated = await aiGenerator(title, comment)
    if (!generated) {
      res.status(422).json({ error: 'Image generation failed' })
      return
    }
    await replaceImage(id, generated, 'ai', res)
  })

  // POST /api/recipes/:id/fetch-og-image — re-fetch the linked page's
  // og:image and replace the current image. Optional {url} override lets
  // the editor use its unsaved draft url.
  router.post('/:id/fetch-og-image', async (req, res) => {
    const fetcher = ogFetcher === null ? null : (ogFetcher ?? fetchOgImage)
    if (fetcher === null) {
      res.status(503).json({ error: 'og image fetching is not configured' })
      return
    }
    const id = Number(req.params.id)
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id))
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' })
      return
    }
    const url = typeof req.body?.url === 'string' && req.body.url.trim() ? req.body.url.trim() : recipe.url
    if (!url) {
      res.status(400).json({ error: 'The recipe has no url' })
      return
    }
    const fetched = await fetcher(url)
    if (!fetched) {
      res.status(422).json({ error: 'No og image found on the page' })
      return
    }
    await replaceImage(id, fetched, 'og', res)
  })

  // GET /api/recipes — all recipes, ordered by title
  router.get('/', async (_req, res) => {
    const rows = await db.select().from(recipes).orderBy(asc(recipes.title))
    const scores = await loadScores(db)
    res.json({ recipes: rows.map((row) => serializeRecipe(row, scores.get(row.id) ?? 0)) })
  })

  // POST /api/recipes — reuses an existing recipe when the url matches,
  // so no client can create link duplicates
  router.post('/', async (req, res) => {
    const fields = recipeFields(req.body)
    if (fields.url) {
      const wanted = normalizeUrl(fields.url)
      const rows = await db.select().from(recipes).where(ne(recipes.url, ''))
      const existing = rows.find((r) => normalizeUrl(r.url) === wanted)
      if (existing) {
        res.json({ recipe: serializeRecipe(existing, (await loadScores(db)).get(existing.id) ?? 0) })
        return
      }
    }
    const [recipe] = await db.insert(recipes).values({
      ...fields,
      imageSource: fields.imageId !== null || fields.legacyImageUrl ? 'upload' : null
    }).returning()
    const serialized = serializeRecipe(recipe)
    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serialized })
    res.status(201).json({ recipe: serialized })
    if (recipe.imageId === null && !recipe.legacyImageUrl) {
      scheduleImage(recipe.id)
    }
  })

  // PUT /api/recipes/:id
  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const [current] = await db.select().from(recipes).where(eq(recipes.id, id))
    if (!current) {
      res.status(404).json({ error: 'Recipe not found' })
      return
    }
    const fields = recipeFields(req.body)
    // An unchanged image keeps its source (clients echo imageUrl back on
    // edits); a new one was chosen by a person; none clears the source.
    const imageSource =
      fields.imageId === current.imageId && fields.legacyImageUrl === current.legacyImageUrl
        ? current.imageSource
        : fields.imageId !== null || fields.legacyImageUrl ? 'upload' : null
    const [recipe] = await db.update(recipes)
      .set({ ...fields, imageSource, updatedAt: new Date() })
      .where(eq(recipes.id, id))
      .returning()
    const serialized = serializeRecipe(recipe, (await loadScores(db)).get(recipe.id) ?? 0)
    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serialized })
    res.json({ recipe: serialized })
    const urlChanged = recipe.url !== current.url
    if (recipe.imageSource !== 'upload' && !recipe.legacyImageUrl &&
        (recipe.imageId === null || (recipe.url !== '' && urlChanged))) {
      scheduleImage(recipe.id)
    }
  })

  // DELETE /api/recipes/:id
  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    await db.delete(recipes).where(eq(recipes.id, id))
    bus?.publish({ resource: 'recipes', action: 'deleted', id })
    res.json({ success: true })
  })

  return router
}
