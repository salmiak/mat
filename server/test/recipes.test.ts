import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers.js'

let app: Express

beforeEach(() => {
  app = createTestApp().app
})

describe('POST /api/recipes', () => {
  it('creates a recipe', async () => {
    const res = await request(app).post('/api/recipes').send({
      title: 'Korvstroganoff',
      comment: 'Snabb vardagsrätt',
      url: 'https://example.com/recept',
      junk: 'nope'
    })

    expect(res.status).toBe(201)
    expect(res.body.recipe).toMatchObject({
      title: 'Korvstroganoff',
      comment: 'Snabb vardagsrätt',
      url: 'https://example.com/recept',
      imageUrl: null
    })
    expect(res.body.recipe.junk).toBeUndefined()
  })

  it('reuses an existing recipe when the url matches (trailing slash ignored)', async () => {
    const first = await request(app).post('/api/recipes')
      .send({ title: 'Pannkakor', url: 'https://example.com/pannkakor/' })
    expect(first.status).toBe(201)

    const dup = await request(app).post('/api/recipes')
      .send({ title: 'Pannkakor igen', url: 'https://example.com/pannkakor' })
    expect(dup.status).toBe(200)
    expect(dup.body.recipe.id).toBe(first.body.recipe.id)
    expect(dup.body.recipe.title).toBe('Pannkakor')

    const list = await request(app).get('/api/recipes')
    expect(list.body.recipes).toHaveLength(1)
  })

  it('accepts an uploaded image url and a legacy external url', async () => {
    const upload = await request(app).post('/api/images')
      .set('Content-Type', 'image/png').send(Buffer.from([1, 2, 3]))
    const withUpload = await request(app).post('/api/recipes')
      .send({ title: 'A', imageUrl: upload.body.url })
    expect(withUpload.body.recipe.imageUrl).toBe(upload.body.url)

    const withLegacy = await request(app).post('/api/recipes')
      .send({ title: 'B', imageUrl: 'https://old-cdn.example.com/x.jpg' })
    expect(withLegacy.body.recipe.imageUrl).toBe('https://old-cdn.example.com/x.jpg')
  })
})

describe('GET /api/recipes', () => {
  it('returns recipes ordered by title', async () => {
    await request(app).post('/api/recipes').send({ title: 'Zucchinipasta' })
    await request(app).post('/api/recipes').send({ title: 'Blodpudding' })

    const res = await request(app).get('/api/recipes')

    expect(res.body.recipes.map((r: { title: string }) => r.title))
      .toEqual(['Blodpudding', 'Zucchinipasta'])
  })
})

describe('PUT /api/recipes/:id', () => {
  it('updates the recipe', async () => {
    const created = await request(app).post('/api/recipes').send({ title: 'Före' })

    const res = await request(app).put(`/api/recipes/${created.body.recipe.id}`)
      .send({ title: 'Efter', url: 'https://x.se' })

    expect(res.status).toBe(200)
    expect(res.body.recipe).toMatchObject({ title: 'Efter', url: 'https://x.se' })
  })

  it('clears the image when imageUrl is removed', async () => {
    const created = await request(app).post('/api/recipes')
      .send({ title: 'Med bild', imageUrl: 'https://old.example.com/x.jpg' })

    const res = await request(app).put(`/api/recipes/${created.body.recipe.id}`)
      .send({ title: 'Med bild', imageUrl: null })

    expect(res.body.recipe.imageUrl).toBeNull()
  })

  it('404s on a missing recipe', async () => {
    const res = await request(app).put('/api/recipes/999').send({ title: 'x' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/recipes/:id', () => {
  it('deletes the recipe and its meal links', async () => {
    const recipe = (await request(app).post('/api/recipes').send({ title: 'Bort' })).body.recipe
    const meal = (await request(app).post('/api/meals')
      .send({ title: 'Måltid', date: '2026-09-01', recipeIds: [recipe.id] })).body.meal

    await request(app).delete(`/api/recipes/${recipe.id}`)

    const meals = await request(app).get('/api/meals')
    const kept = meals.body.meals.find((m: { id: number }) => m.id === meal.id)
    expect(kept.recipeIds).toEqual([])
  })
})
