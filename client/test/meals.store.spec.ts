import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    uploadImage: vi.fn()
  }
}))

import { api } from '@/services/api'
import { useMealsStore } from '@/stores/meals'
import type { Meal } from '@/types'

function meal (overrides: Partial<Meal>): Meal {
  return {
    id: 1,
    title: 'Måltid',
    comment: '',
    date: '2026-03-02',
    index: 0,
    made: false,
    recipeIds: [],
    upvotes: 0,
    downvotes: 0,
    ...overrides
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('setMeal', () => {
  it('adds a new meal first in the list', () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1 })]
    store.setMeal(meal({ id: 2 }))
    expect(store.list.map((m) => m.id)).toEqual([2, 1])
  })

  it('replaces an existing meal instead of duplicating it', () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1, title: 'Gammal' }), meal({ id: 2 })]
    store.setMeal(meal({ id: 1, title: 'Ny' }))
    expect(store.list).toHaveLength(2)
    expect(store.list[0].title).toBe('Ny')
  })
})

describe('mealsInWeek', () => {
  it('filters by ISO week and year', () => {
    const store = useMealsStore()
    const inWeek = meal({ id: 2, date: '2026-03-02' }) // ISO week 10, 2026
    store.list = [
      inWeek,
      meal({ id: 1, date: '2026-03-09' }),
      meal({ id: 3, date: '2025-03-03' })
    ]

    expect(store.mealsInWeek({ week: 10, year: 2026 })).toEqual([inWeek])
  })

  it('orders by id descending', () => {
    const store = useMealsStore()
    store.list = [
      meal({ id: 1, date: '2026-03-02' }),
      meal({ id: 3, date: '2026-03-03' }),
      meal({ id: 2, date: '2026-03-04' })
    ]

    expect(store.mealsInWeek({ week: 10, year: 2026 }).map((m) => m.id)).toEqual([3, 2, 1])
  })
})

describe('actions', () => {
  it('loadMealsInWeek merges fetched meals into the list', async () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1, title: 'Fanns redan' })]
    vi.mocked(api.get).mockResolvedValue({ meals: [meal({ id: 1, title: 'Uppdaterad' }), meal({ id: 2 })] })

    await store.loadMealsInWeek({ week: 10, year: 2026 })

    expect(api.get).toHaveBeenCalledWith('/meals?week=10&year=2026')
    expect(store.list).toHaveLength(2)
    expect(store.list.find((m) => m.id === 1)?.title).toBe('Uppdaterad')
  })

  it('addMeal posts whitelisted fields and stores the result', async () => {
    const store = useMealsStore()
    const created = meal({ id: 9, title: 'Tacos' })
    vi.mocked(api.post).mockResolvedValue({ meal: created })

    await store.addMeal({ ...meal({ title: 'Tacos' }), id: undefined })

    expect(api.post).toHaveBeenCalledWith('/meals', {
      title: 'Tacos', comment: '', date: '2026-03-02', index: 0, made: false, recipeIds: []
    })
    expect(store.list[0]).toEqual(created)
  })

  it('deleteMeal removes the meal from the list', async () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1 }), meal({ id: 2 })]
    vi.mocked(api.delete).mockResolvedValue({ success: true })

    await store.deleteMeal(1)

    expect(store.list.map((m) => m.id)).toEqual([2])
  })
})

describe('voteMeal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('posts a new vote and updates the tallies', async () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1 })]
    vi.mocked(api.post).mockResolvedValue({ vote: { id: 7 }, upvotes: 1, downvotes: 0 })

    await store.voteMeal(1, 1)

    expect(api.post).toHaveBeenCalledWith('/meals/1/votes', { value: 1 })
    expect(store.list[0]).toMatchObject({ upvotes: 1, downvotes: 0 })
    expect(store.ownVote(1)).toBe(1)
  })

  it('tapping the same thumb again removes the vote', async () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1, upvotes: 1 })]
    store.ownVotes[1] = { id: 7, value: 1 }
    vi.mocked(api.delete).mockResolvedValue({ upvotes: 0, downvotes: 0 })

    await store.voteMeal(1, 1)

    expect(api.delete).toHaveBeenCalledWith('/votes/7')
    expect(store.ownVote(1)).toBeUndefined()
    expect(store.list[0].upvotes).toBe(0)
  })

  it('tapping the other thumb switches the vote', async () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1, upvotes: 1 })]
    store.ownVotes[1] = { id: 7, value: 1 }
    vi.mocked(api.put).mockResolvedValue({ vote: { id: 7 }, upvotes: 0, downvotes: 1 })

    await store.voteMeal(1, -1)

    expect(api.put).toHaveBeenCalledWith('/votes/7', { value: -1 })
    expect(store.ownVote(1)).toBe(-1)
    expect(store.list[0]).toMatchObject({ upvotes: 0, downvotes: 1 })
  })

  it('recovers by posting anew when the remembered vote is gone', async () => {
    const store = useMealsStore()
    store.list = [meal({ id: 1 })]
    store.ownVotes[1] = { id: 99, value: 1 }
    vi.mocked(api.put).mockRejectedValue(new Error('404'))
    vi.mocked(api.post).mockResolvedValue({ vote: { id: 8 }, upvotes: 1, downvotes: 0 })

    await store.voteMeal(1, -1)

    expect(api.post).toHaveBeenCalledWith('/meals/1/votes', { value: -1 })
    expect(store.ownVote(1)).toBe(-1)
  })
})
