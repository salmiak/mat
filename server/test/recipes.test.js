import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import request from 'supertest'
import { loadApp, fakeFind } from './helpers.js'

let app, Recipe

beforeAll(async () => {
  app = await loadApp()
  Recipe = (await import('mongoose')).default.model('Recipe')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /recipes', () => {
  it('returns all recipes', async () => {
    const docs = [
      { _id: 'r1', title: 'Pannkakor', url: 'https://example.com' },
      { _id: 'r2', title: 'Tacos', fileUrl: '/uploads/tacos.jpg' }
    ]
    Recipe.find = fakeFind(docs)

    const res = await request(app).get('/recipes')

    expect(res.status).toBe(200)
    expect(res.body.recipes).toHaveLength(2)
    expect(res.body.recipes[0].title).toBe('Pannkakor')
  })
})

describe('POST /recipes', () => {
  it('creates a recipe from the whitelisted payload fields', async () => {
    vi.spyOn(Recipe.prototype, 'save')
      .mockImplementation(function (cb) { setImmediate(() => cb(null)) })

    const res = await request(app).post('/recipes').send({
      title: 'Korvstroganoff',
      comment: 'Snabb vardagsrätt',
      url: 'https://example.com/recept',
      fileUrl: '/uploads/korv.jpg',
      wpId: 12,
      evil: 'nope'
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.recipe.title).toBe('Korvstroganoff')
    expect(res.body.recipe.fileUrl).toBe('/uploads/korv.jpg')
    expect(res.body.recipe.evil).toBeUndefined()
  })
})

describe('PUT /recipes/:id', () => {
  it('updates the recipe fields and returns the recipe', async () => {
    const existing = {
      title: 'Old', comment: '', url: '', fileUrl: '',
      save (cb) { setImmediate(() => cb(null)) }
    }
    Recipe.findById = vi.fn((id, fields, cb) => setImmediate(() => cb(null, existing)))

    const res = await request(app).put('/recipes/r55').send({
      title: 'Uppdaterad', comment: 'ny', url: 'https://x.se', fileUrl: '/uploads/a.png'
    })

    expect(res.status).toBe(200)
    expect(Recipe.findById.mock.calls[0][0]).toBe('r55')
    expect(res.body.recipe.title).toBe('Uppdaterad')
    expect(res.body.recipe.url).toBe('https://x.se')
  })
})

describe('DELETE /recipes/:id', () => {
  it('removes the recipe by id', async () => {
    Recipe.remove = vi.fn((query, cb) => setImmediate(() => cb(null)))

    const res = await request(app).delete('/recipes/r55')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Recipe.remove.mock.calls[0][0]).toEqual({ _id: 'r55' })
  })
})
