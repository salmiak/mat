import { Router } from 'express'
import { eq, inArray, sql } from 'drizzle-orm'
import type { Db } from '../db/client.js'
import { mealVotes } from '../db/schema.js'
import type { ChangeBus } from '../events.js'

export interface VoteTally {
  upvotes: number
  downvotes: number
}

export async function loadVoteTallies (db: Db, mealIds: number[]): Promise<Map<number, VoteTally>> {
  const map = new Map<number, VoteTally>()
  if (mealIds.length === 0) return map
  const rows = await db.select({
    mealId: mealVotes.mealId,
    upvotes: sql<number>`sum(case when ${mealVotes.value} > 0 then 1 else 0 end)`,
    downvotes: sql<number>`sum(case when ${mealVotes.value} < 0 then 1 else 0 end)`
  }).from(mealVotes)
    .where(inArray(mealVotes.mealId, mealIds))
    .groupBy(mealVotes.mealId)
  for (const row of rows) {
    map.set(row.mealId, { upvotes: Number(row.upvotes), downvotes: Number(row.downvotes) })
  }
  return map
}

async function tallyFor (db: Db, mealId: number): Promise<VoteTally> {
  return (await loadVoteTallies(db, [mealId])).get(mealId) ?? { upvotes: 0, downvotes: 0 }
}

export function votesRouter (db: Db, bus?: ChangeBus): Router {
  const router = Router()

  // PUT /api/votes/:id — switch an existing vote between up and down
  router.put('/:id', async (req, res) => {
    const value = req.body.value === 1 ? 1 : req.body.value === -1 ? -1 : null
    if (value === null) {
      res.status(400).json({ error: 'value must be 1 or -1' })
      return
    }
    const [vote] = await db.update(mealVotes)
      .set({ value })
      .where(eq(mealVotes.id, Number(req.params.id)))
      .returning()
    if (!vote) {
      res.status(404).json({ error: 'Vote not found' })
      return
    }
    const tally = await tallyFor(db, vote.mealId)
    bus?.publish({ resource: 'meals', action: 'voted', id: vote.mealId, ...tally })
    res.json({ vote: { id: vote.id, mealId: vote.mealId, value: vote.value }, ...tally })
  })

  // DELETE /api/votes/:id — undo a vote
  router.delete('/:id', async (req, res) => {
    const [vote] = await db.delete(mealVotes)
      .where(eq(mealVotes.id, Number(req.params.id)))
      .returning()
    if (!vote) {
      res.status(404).json({ error: 'Vote not found' })
      return
    }
    const tally = await tallyFor(db, vote.mealId)
    bus?.publish({ resource: 'meals', action: 'voted', id: vote.mealId, ...tally })
    res.json({ success: true, ...tally })
  })

  return router
}
