import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import request from 'supertest'
import moment from 'moment'
import { loadApp, fakeFind } from './helpers.js'

let app, Meal

beforeAll(async () => {
  app = await loadApp()
  Meal = (await import('mongoose')).default.model('Meal')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /meals', () => {
  it('returns all meals ordered by date desc, index asc', async () => {
    const docs = [
      { _id: 'a', title: 'Old', date: '2026-01-01', index: 0 },
      { _id: 'b', title: 'New second', date: '2026-02-01', index: 1 },
      { _id: 'c', title: 'New first', date: '2026-02-01', index: 0 }
    ]
    Meal.find = fakeFind(docs)

    const res = await request(app).get('/meals')

    expect(res.status).toBe(200)
    expect(res.body.meals.map(m => m._id)).toEqual(['c', 'b', 'a'])
    expect(Meal.find.mock.calls[0][0]).toEqual({})
  })

  it('filters by ISO week when week and year are given', async () => {
    Meal.find = fakeFind([])

    const res = await request(app).get('/meals').query({ week: 10, year: 2026 })

    expect(res.status).toBe(200)
    const query = Meal.find.mock.calls[0][0]
    const start = moment(query.date.$gte)
    const end = moment(query.date.$lte)
    expect(start.isoWeek()).toBe(10)
    expect(start.isoWeekday()).toBe(1) // Monday
    expect(end.diff(start, 'days')).toBe(7)
  })
})

describe('POST /meals', () => {
  it('creates a meal from the whitelisted payload fields', async () => {
    const save = vi.spyOn(Meal.prototype, 'save')
      .mockImplementation(function (cb) { setImmediate(() => cb(null, this)) })

    const res = await request(app).post('/meals').send({
      title: 'Tacos',
      comment: 'Fredag',
      date: '2026-09-04',
      recipes: ['r1'],
      index: 2,
      wpId: 7,
      made: true, // not part of the create payload
      hacker: 'field' // unknown fields must be dropped
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(save).toHaveBeenCalled()
    expect(res.body.meal.title).toBe('Tacos')
    expect(res.body.meal.recipes).toEqual(['r1'])
    expect(res.body.meal.index).toBe(2)
    expect(res.body.meal.hacker).toBeUndefined()
  })
})

describe('PUT /meals/:id', () => {
  it('updates the meal fields and returns the meal', async () => {
    const existing = {
      title: 'Old', comment: '', date: null, recipes: [], index: 0, made: false, wpId: null,
      save (cb) { setImmediate(() => cb(null)) }
    }
    Meal.findById = vi.fn((id, fields, cb) => setImmediate(() => cb(null, existing)))

    const res = await request(app).put('/meals/abc123').send({
      title: 'Ny titel', comment: 'ändrad', date: '2026-09-05',
      recipes: ['r9'], index: 1, made: true, wpId: 3
    })

    expect(res.status).toBe(200)
    expect(Meal.findById.mock.calls[0][0]).toBe('abc123')
    expect(res.body.meal.title).toBe('Ny titel')
    expect(res.body.meal.made).toBe(true)
    expect(res.body.meal.recipes).toEqual(['r9'])
  })
})

describe('DELETE /meals/:id', () => {
  it('removes the meal by id', async () => {
    Meal.remove = vi.fn((query, cb) => setImmediate(() => cb(null)))

    const res = await request(app).delete('/meals/abc123')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Meal.remove.mock.calls[0][0]).toEqual({ _id: 'abc123' })
  })
})
