import { Router } from 'express'
import { asc, eq, sql } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { mealRecipes, mealVotes, recipes } from '../db/schema.js'
import type { ChangeBus } from '../events.js'

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

export function recipesRouter (db: Db, bus?: ChangeBus): Router {
  const router = Router()

  // GET /api/recipes — all recipes, ordered by title
  router.get('/', async (_req, res) => {
    const rows = await db.select().from(recipes).orderBy(asc(recipes.title))
    const scores = await loadScores(db)
    res.json({ recipes: rows.map((row) => serializeRecipe(row, scores.get(row.id) ?? 0)) })
  })

  // POST /api/recipes
  router.post('/', async (req, res) => {
    const [recipe] = await db.insert(recipes).values(recipeFields(req.body)).returning()
    const serialized = serializeRecipe(recipe)
    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serialized })
    res.status(201).json({ recipe: serialized })
  })

  // PUT /api/recipes/:id
  router.put('/:id', async (req, res) => {
    const [recipe] = await db.update(recipes)
      .set({ ...recipeFields(req.body), updatedAt: new Date() })
      .where(eq(recipes.id, Number(req.params.id)))
      .returning()
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' })
      return
    }
    const serialized = serializeRecipe(recipe, (await loadScores(db)).get(recipe.id) ?? 0)
    bus?.publish({ resource: 'recipes', action: 'saved', recipe: serialized })
    res.json({ recipe: serialized })
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
