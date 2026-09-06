import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers.js'

let app: Express

beforeEach(() => {
  app = createTestApp().app
})

async function createMealWithRecipe (title = 'Måltid') {
  const recipe = (await request(app).post('/api/recipes').send({ title: title + '-recept' })).body.recipe
  const meal = (await request(app).post('/api/meals')
    .send({ title, date: '2026-09-01', recipeIds: [recipe.id] })).body.meal
  return { meal, recipe }
}

describe('POST /api/meals/:id/votes', () => {
  it('registers a thumb up and returns the tallies', async () => {
    const { meal } = await createMealWithRecipe()

    const res = await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })

    expect(res.status).toBe(201)
    expect(res.body.vote).toMatchObject({ mealId: meal.id, value: 1 })
    expect(res.body).toMatchObject({ upvotes: 1, downvotes: 0 })
  })

  it('rejects other values', async () => {
    const { meal } = await createMealWithRecipe()
    const res = await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 5 })
    expect(res.status).toBe(400)
  })

  it('404s on a missing meal', async () => {
    const res = await request(app).post('/api/meals/999/votes').send({ value: 1 })
    expect(res.status).toBe(404)
  })
})

describe('vote effects', () => {
  it('meals report their tallies', async () => {
    const { meal } = await createMealWithRecipe()
    await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })
    await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })
    await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: -1 })

    const res = await request(app).get('/api/meals')
    const found = res.body.meals.find((m: { id: number }) => m.id === meal.id)
    expect(found).toMatchObject({ upvotes: 2, downvotes: 1 })
  })

  it('recipe score is the sum of votes on its meals', async () => {
    const { meal, recipe } = await createMealWithRecipe('Tacos')
    // Same recipe in a second meal
    const meal2 = (await request(app).post('/api/meals')
      .send({ title: 'Tacos igen', date: '2026-09-08', recipeIds: [recipe.id] })).body.meal

    await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })
    await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })
    await request(app).post(`/api/meals/${meal2.id}/votes`).send({ value: -1 })

    const res = await request(app).get('/api/recipes')
    const found = res.body.recipes.find((r: { id: number }) => r.id === recipe.id)
    expect(found.score).toBe(1)

    const unvoted = (await request(app).post('/api/recipes').send({ title: 'Orörd' })).body.recipe
    const res2 = await request(app).get('/api/recipes')
    expect(res2.body.recipes.find((r: { id: number }) => r.id === unvoted.id).score).toBe(0)
  })
})

describe('PUT and DELETE /api/votes/:id', () => {
  it('switches a vote between up and down', async () => {
    const { meal } = await createMealWithRecipe()
    const vote = (await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })).body.vote

    const res = await request(app).put(`/api/votes/${vote.id}`).send({ value: -1 })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ upvotes: 0, downvotes: 1 })
  })

  it('deleting a vote updates the tallies', async () => {
    const { meal } = await createMealWithRecipe()
    const vote = (await request(app).post(`/api/meals/${meal.id}/votes`).send({ value: 1 })).body.vote

    const res = await request(app).delete(`/api/votes/${vote.id}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ upvotes: 0, downvotes: 0 })
  })

  it('404s on a missing vote', async () => {
    expect((await request(app).put('/api/votes/999').send({ value: 1 })).status).toBe(404)
    expect((await request(app).delete('/api/votes/999')).status).toBe(404)
  })
})
