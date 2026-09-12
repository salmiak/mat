import { Router } from 'express'
import { asc, eq, ne, sql } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { mealRecipes, mealVotes, recipes } from '../db/schema.js'
import type { ChangeBus } from '../events.js'
import { attachOgImage, type OgImageFetcher } from '../ogImage.js'
import { attachAiImage, type AiImageGenerator } from '../aiImage.js'

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
