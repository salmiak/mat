import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { applyChangeEvent } from '@/services/liveUpdates'
import { useMealsStore } from '@/stores/meals'
import { useRecipesStore } from '@/stores/recipes'
import type { Meal, Recipe } from '@/types'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }
}))

function meal (overrides: Partial<Meal> = {}): Meal {
  return {
    id: 1,
    title: 'Tacos',
    comment: '',
    date: '2026-09-11',
    index: 0,
    made: false,
    recipeIds: [],
    upvotes: 0,
    downvotes: 0,
    ...overrides
  }
}

function recipe (overrides: Partial<Recipe> = {}): Recipe {
  return { id: 1, title: 'Pasta', comment: '', url: '', imageUrl: null, ...overrides }
}

describe('applyChangeEvent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds and updates meals', () => {
    const store = useMealsStore()
    applyChangeEvent({ resource: 'meals', action: 'saved', meal: meal() })
    expect(store.list).toHaveLength(1)
    applyChangeEvent({ resource: 'meals', action: 'saved', meal: meal({ title: 'Tacos!' }) })
    expect(store.list).toHaveLength(1)
    expect(store.list[0].title).toBe('Tacos!')
  })

  it('removes deleted meals', () => {
    const store = useMealsStore()
    store.setMeal(meal())
    applyChangeEvent({ resource: 'meals', action: 'deleted', id: 1 })
    expect(store.list).toHaveLength(0)
  })

  it('applies vote tallies', () => {
    const store = useMealsStore()
    store.setMeal(meal())
    applyChangeEvent({ resource: 'meals', action: 'voted', id: 1, upvotes: 2, downvotes: 1 })
    expect(store.list[0].upvotes).toBe(2)
    expect(store.list[0].downvotes).toBe(1)
  })

  it('adds, updates and removes recipes', () => {
    const store = useRecipesStore()
    applyChangeEvent({ resource: 'recipes', action: 'saved', recipe: recipe() })
    expect(store.list).toHaveLength(1)
    applyChangeEvent({ resource: 'recipes', action: 'saved', recipe: recipe({ title: 'Pasta!' }) })
    expect(store.list[0].title).toBe('Pasta!')
    applyChangeEvent({ resource: 'recipes', action: 'deleted', id: 1 })
    expect(store.list).toHaveLength(0)
  })
})
