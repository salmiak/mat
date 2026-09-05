import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers.js'

let app: Express

beforeEach(() => {
  app = createTestApp().app
})

async function createRecipe (title = 'Recept') {
  const res = await request(app).post('/api/recipes').send({ title })
  return res.body.recipe
}

describe('POST /api/meals', () => {
  it('creates a meal with recipe links', async () => {
    const recipe = await createRecipe('Tacos originalet')

    const res = await request(app).post('/api/meals').send({
      title: 'Tacos',
      comment: 'Fredag!',
      date: '2026-09-04',
      index: 1,
      recipeIds: [recipe.id]
    })

    expect(res.status).toBe(201)
    expect(res.body.meal).toMatchObject({
      title: 'Tacos',
      comment: 'Fredag!',
      date: '2026-09-04',
      index: 1,
      made: false,
      recipeIds: [recipe.id]
    })
  })

  it('ignores junk fields and non-integer recipe ids', async () => {
    const res = await request(app).post('/api/meals').send({
      title: 'Soppa',
      date: '2026-09-01',
      recipeIds: ['DROP TABLE', 1.5],
      hacker: 'field'
    })

    expect(res.status).toBe(201)
    expect(res.body.meal.recipeIds).toEqual([])
    expect(res.body.meal.hacker).toBeUndefined()
  })
})

describe('GET /api/meals', () => {
  it('returns meals ordered by date desc, index asc', async () => {
    await request(app).post('/api/meals').send({ title: 'Gammal', date: '2026-01-01' })
    await request(app).post('/api/meals').send({ title: 'Ny andra', date: '2026-02-01', index: 1 })
    await request(app).post('/api/meals').send({ title: 'Ny första', date: '2026-02-01', index: 0 })

    const res = await request(app).get('/api/meals')

    expect(res.status).toBe(200)
    expect(res.body.meals.map((m: { title: string }) => m.title))
      .toEqual(['Ny första', 'Ny andra', 'Gammal'])
  })

  it('filters on ISO week', async () => {
    // 2026-03-02 is a Monday in ISO week 10
    await request(app).post('/api/meals').send({ title: 'I veckan', date: '2026-03-02' })
    await request(app).post('/api/meals').send({ title: 'Söndag samma vecka', date: '2026-03-08' })
    await request(app).post('/api/meals').send({ title: 'Veckan efter', date: '2026-03-09' })
    await request(app).post('/api/meals').send({ title: 'Året innan', date: '2025-03-03' })

    const res = await request(app).get('/api/meals').query({ week: 10, year: 2026 })

    expect(res.body.meals.map((m: { title: string }) => m.title).sort())
      .toEqual(['I veckan', 'Söndag samma vecka'])
  })
})

describe('PUT /api/meals/:id', () => {
  it('updates fields and replaces recipe links', async () => {
    const r1 = await createRecipe('Ett')
    const r2 = await createRecipe('Två')
    const created = await request(app).post('/api/meals')
      .send({ title: 'Före', date: '2026-09-01', recipeIds: [r1.id] })

    const res = await request(app).put(`/api/meals/${created.body.meal.id}`).send({
      title: 'Efter', comment: 'ändrad', date: '2026-09-02', made: true, recipeIds: [r2.id]
    })

    expect(res.status).toBe(200)
    expect(res.body.meal).toMatchObject({
      title: 'Efter', made: true, date: '2026-09-02', recipeIds: [r2.id]
    })
  })

  it('404s on a missing meal', async () => {
    const res = await request(app).put('/api/meals/999').send({ title: 'x', date: '2026-01-01' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/meals/:id', () => {
  it('deletes the meal', async () => {
    const created = await request(app).post('/api/meals').send({ title: 'Bort', date: '2026-09-01' })

    const del = await request(app).delete(`/api/meals/${created.body.meal.id}`)
    expect(del.body.success).toBe(true)

    const res = await request(app).get('/api/meals')
    expect(res.body.meals).toHaveLength(0)
  })
})
