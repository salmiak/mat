import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { ChangeBus, type ChangeEvent } from '../src/events.js'
import { createTestDb } from './helpers.js'

function createAppWithBus () {
  const db = createTestDb()
  const bus = new ChangeBus()
  const events: ChangeEvent[] = []
  bus.subscribe((event) => events.push(event))
  const app = createApp(db, { logging: false, clientDist: '/nonexistent', bus })
  return { app, events }
}

describe('change events', () => {
  it('publishes meal saved/deleted', async () => {
    const { app, events } = createAppWithBus()
    const created = await request(app).post('/api/meals')
      .send({ title: 'Tacos', date: '2026-09-11' })
    expect(events).toEqual([
      { resource: 'meals', action: 'saved', meal: created.body.meal }
    ])

    const id = created.body.meal.id
    const updated = await request(app).put(`/api/meals/${id}`)
      .send({ title: 'Tacos!', date: '2026-09-11' })
    expect(events[1]).toEqual({ resource: 'meals', action: 'saved', meal: updated.body.meal })

    await request(app).delete(`/api/meals/${id}`)
    expect(events[2]).toEqual({ resource: 'meals', action: 'deleted', id })
  })

  it('publishes vote tallies on vote create/switch/undo', async () => {
    const { app, events } = createAppWithBus()
    const meal = (await request(app).post('/api/meals').send({ title: 'x', date: '2026-09-11' })).body.meal

    const vote = (await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })).body.vote
    expect(events[1]).toEqual({ resource: 'meals', action: 'voted', id: meal.id, upvotes: 1, downvotes: 0 })

    await request(app).put(`/api/votes/${vote.id}`).send({ value: -1 })
    expect(events[2]).toEqual({ resource: 'meals', action: 'voted', id: meal.id, upvotes: 0, downvotes: 1 })

    await request(app).delete(`/api/votes/${vote.id}`)
    expect(events[3]).toEqual({ resource: 'meals', action: 'voted', id: meal.id, upvotes: 0, downvotes: 0 })
  })

  it('publishes recipe saved/deleted', async () => {
    const { app, events } = createAppWithBus()
    const created = await request(app).post('/api/recipes').send({ title: 'Pasta' })
    expect(events[0]).toEqual({ resource: 'recipes', action: 'saved', recipe: created.body.recipe })

    const id = created.body.recipe.id
    const updated = await request(app).put(`/api/recipes/${id}`).send({ title: 'Pasta!' })
    expect(events[1]).toEqual({ resource: 'recipes', action: 'saved', recipe: { ...updated.body.recipe, score: 0 } })

    await request(app).delete(`/api/recipes/${id}`)
    expect(events[2]).toEqual({ resource: 'recipes', action: 'deleted', id })
  })

  it('streams events over /api/events as SSE', async () => {
    const db = createTestDb()
    const bus = new ChangeBus()
    const app = createApp(db, { logging: false, clientDist: '/nonexistent', bus })

    const chunks: string[] = []
    const req = request(app).get('/api/events')
      .buffer(false)
      .parse((res, callback) => {
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk.toString())
          if (chunks.join('').includes('"deleted"')) {
            res.destroy()
            callback(null, null)
          }
        })
      })
    const pending = req.then((res) => res)
    // Give the subscription a beat to attach, then publish
    await new Promise((r) => setTimeout(r, 50))
    bus.publish({ resource: 'meals', action: 'deleted', id: 7 })
    await pending

    const body = chunks.join('')
    expect(body).toContain('retry: 3000')
    expect(body).toContain('data: {"resource":"meals","action":"deleted","id":7}')
  })
})
