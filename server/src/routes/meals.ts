import { Router } from 'express'
import { and, asc, desc, eq, gte, inArray, lt } from 'drizzle-orm'
import { addWeeks, formatISO, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns'
import type { Db } from '../db/client.js'
import { mealRecipes, meals, mealVotes } from '../db/schema.js'
import { loadVoteTallies, type VoteTally } from './votes.js'

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

export function serializeMeal (meal: typeof meals.$inferSelect, recipeIds: number[], tally: VoteTally = { upvotes: 0, downvotes: 0 }) {
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
    recipeIds,
    upvotes: tally.upvotes,
    downvotes: tally.downvotes
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
    const mealIds = rows.map((m) => m.id)
    const recipeIdMap = await loadRecipeIds(db, mealIds)
    const tallies = await loadVoteTallies(db, mealIds)

    res.json({ meals: rows.map((m) => serializeMeal(m, recipeIdMap.get(m.id) ?? [], tallies.get(m.id))) })
  })

  // POST /api/meals
  router.post('/', async (req, res) => {
    const recipeIds = recipeIdsFromBody(req.body)
    const [meal] = await db.insert(meals).values(mealFields(req.body)).returning()
    await replaceRecipeLinks(db, meal.id, recipeIds)
    res.status(201).json({ meal: serializeMeal(meal, recipeIds) })
  })

  // POST /api/meals/:id/votes — thumbs up (+1) or down (-1)
  router.post('/:id/votes', async (req, res) => {
    const mealId = Number(req.params.id)
    const value = req.body.value === 1 ? 1 : req.body.value === -1 ? -1 : null
    if (value === null) {
      res.status(400).json({ error: 'value must be 1 or -1' })
      return
    }
    const [meal] = await db.select().from(meals).where(eq(meals.id, mealId))
    if (!meal) {
      res.status(404).json({ error: 'Meal not found' })
      return
    }
    const [vote] = await db.insert(mealVotes).values({ mealId, value }).returning()
    const tallies = await loadVoteTallies(db, [mealId])
    res.status(201).json({
      vote: { id: vote.id, mealId, value },
      ...tallies.get(mealId) ?? { upvotes: 0, downvotes: 0 }
    })
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
    res.json({ meal: serializeMeal(meal, recipeIds, (await loadVoteTallies(db, [id])).get(id)) })
  })

  // DELETE /api/meals/:id
  router.delete('/:id', async (req, res) => {
    await db.delete(meals).where(eq(meals.id, Number(req.params.id)))
    res.json({ success: true })
  })

  return router
}
