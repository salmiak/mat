import { Router } from 'express'
import { asc, eq } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { recipes } from '../db/schema.js'

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

export function serializeRecipe (recipe: typeof recipes.$inferSelect) {
  return {
    id: recipe.id,
    title: recipe.title,
    comment: recipe.comment,
    url: recipe.url,
    imageUrl: recipe.imageId != null
      ? `/api/images/${recipe.imageId}`
      : (recipe.legacyImageUrl || null),
    // Downscaled version for lists; legacy external URLs have no thumb
    thumbUrl: recipe.imageId != null
      ? `/api/images/${recipe.imageId}?size=thumb`
      : (recipe.legacyImageUrl || null)
  }
}

export function recipesRouter (db: Db): Router {
  const router = Router()

  // GET /api/recipes — all recipes, ordered by title
  router.get('/', async (_req, res) => {
    const rows = await db.select().from(recipes).orderBy(asc(recipes.title))
    res.json({ recipes: rows.map(serializeRecipe) })
  })

  // POST /api/recipes
  router.post('/', async (req, res) => {
    const [recipe] = await db.insert(recipes).values(recipeFields(req.body)).returning()
    res.status(201).json({ recipe: serializeRecipe(recipe) })
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
    res.json({ recipe: serializeRecipe(recipe) })
  })

  // DELETE /api/recipes/:id
  router.delete('/:id', async (req, res) => {
    await db.delete(recipes).where(eq(recipes.id, Number(req.params.id)))
    res.json({ success: true })
  })

  return router
}
