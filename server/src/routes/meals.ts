import { Router } from 'express'
import { and, asc, desc, eq, gte, inArray, lt } from 'drizzle-orm'
import { addWeeks, formatISO, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns'
import type { Db } from '../db/client.js'
import { mealRecipes, meals } from '../db/schema.js'

interface MealPayload {
  title?: string
  comment?: string
  date?: string
  index?: number
  made?: boolean
  recipeIds?: number[]
}

function mealFields (body: MealPayload) {
  return {
    title: body.title ?? '',
    comment: body.comment ?? '',
    date: body.date ?? formatISO(new Date(), { representation: 'date' }),
    index: body.index ?? 0,
    made: body.made ?? false
  }
}

function recipeIdsFromBody (body: MealPayload): number[] {
  if (!Array.isArray(body.recipeIds)) return []
  return body.recipeIds.filter((id) => Number.isInteger(id))
}

async function loadRecipeIds (db: Db, mealIds: number[]): Promise<Map<number, number[]>> {
  const map = new Map<number, number[]>()
  if (mealIds.length === 0) return map
  const links = await db.select().from(mealRecipes)
    .where(inArray(mealRecipes.mealId, mealIds))
    .orderBy(asc(mealRecipes.position))
  for (const link of links) {
    const list = map.get(link.mealId) ?? []
    list.push(link.recipeId)
    map.set(link.mealId, list)
  }
  return map
}

async function replaceRecipeLinks (db: Db, mealId: number, recipeIds: number[]) {
  await db.delete(mealRecipes).where(eq(mealRecipes.mealId, mealId))
  if (recipeIds.length > 0) {
    await db.insert(mealRecipes).values(
      recipeIds.map((recipeId, position) => ({ mealId, recipeId, position }))
    )
  }
}

function serialize (meal: typeof meals.$inferSelect, recipeIds: number[]) {
  return {
    id: meal.id,
    title: meal.title,
    comment: meal.comment,
    // Always a plain YYYY-MM-DD string, whatever the driver hands back
    date: (meal.date as unknown) instanceof Date
      ? formatISO(meal.date as unknown as Date, { representation: 'date' })
      : String(meal.date).slice(0, 10),
    index: meal.index,
    made: meal.made,
    recipeIds
  }
}

export function mealsRouter (db: Db): Router {
  const router = Router()

  // GET /api/meals?week=&year= — all meals, or the ones in an ISO week
  router.get('/', async (req, res) => {
    const week = Number(req.query.week)
    const year = Number(req.query.year)

    let where
    if (req.query.week && req.query.year && Number.isInteger(week) && Number.isInteger(year)) {
      const start = startOfISOWeek(setISOWeek(setISOWeekYear(new Date(), year), week))
      const end = addWeeks(start, 1)
      where = and(
        gte(meals.date, formatISO(start, { representation: 'date' })),
        lt(meals.date, formatISO(end, { representation: 'date' }))
      )
    }

    const rows = await db.select().from(meals).where(where)
      .orderBy(desc(meals.date), asc(meals.index), desc(meals.id))
    const recipeIdMap = await loadRecipeIds(db, rows.map((m) => m.id))

    res.json({ meals: rows.map((m) => serialize(m, recipeIdMap.get(m.id) ?? [])) })
  })

  // POST /api/meals
  router.post('/', async (req, res) => {
    const recipeIds = recipeIdsFromBody(req.body)
    const [meal] = await db.insert(meals).values(mealFields(req.body)).returning()
    await replaceRecipeLinks(db, meal.id, recipeIds)
    res.status(201).json({ meal: serialize(meal, recipeIds) })
  })

  // PUT /api/meals/:id
  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id)
    const recipeIds = recipeIdsFromBody(req.body)
    const [meal] = await db.update(meals)
      .set({ ...mealFields(req.body), updatedAt: new Date() })
      .where(eq(meals.id, id))
      .returning()
    if (!meal) {
      res.status(404).json({ error: 'Meal not found' })
      return
    }
    await replaceRecipeLinks(db, id, recipeIds)
    res.json({ meal: serialize(meal, recipeIds) })
  })

  // DELETE /api/meals/:id
  router.delete('/:id', async (req, res) => {
    await db.delete(meals).where(eq(meals.id, Number(req.params.id)))
    res.json({ success: true })
  })

  return router
}
