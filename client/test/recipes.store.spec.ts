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
import { useRecipesStore } from '@/stores/recipes'
import type { Recipe } from '@/types'

function recipe (overrides: Partial<Recipe>): Recipe {
  return {
    id: 1,
    title: 'Recept',
    comment: '',
    url: '',
    imageUrl: null,
    ...overrides
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('recipeById', () => {
  it('finds a recipe by id', () => {
    const store = useRecipesStore()
    store.list = [recipe({ id: 1, title: 'Pannkakor' }), recipe({ id: 2 })]
    expect(store.recipeById(1)?.title).toBe('Pannkakor')
    expect(store.recipeById(99)).toBeUndefined()
  })
})

describe('loadRecipeList', () => {
  it('fetches when there is no cached sync', async () => {
    const store = useRecipesStore()
    vi.mocked(api.get).mockResolvedValue({ recipes: [recipe({ id: 1 })] })

    await store.loadRecipeList()

    expect(api.get).toHaveBeenCalledWith('/recipes')
    expect(store.list).toHaveLength(1)
    expect(store.syncTimestamp).toBeDefined()
  })

  it('skips fetching when synced within the last 5 minutes', async () => {
    const store = useRecipesStore()
    store.syncTimestamp = Date.now() - 2 * 60000

    await store.loadRecipeList()

    expect(api.get).not.toHaveBeenCalled()
  })

  it('fetches again when the cache is stale', async () => {
    const store = useRecipesStore()
    store.syncTimestamp = Date.now() - 6 * 60000
    vi.mocked(api.get).mockResolvedValue({ recipes: [] })

    await store.loadRecipeList()

    expect(api.get).toHaveBeenCalled()
  })

  it('always fetches when forced', async () => {
    const store = useRecipesStore()
    store.syncTimestamp = Date.now()
    vi.mocked(api.get).mockResolvedValue({ recipes: [] })

    await store.loadRecipeList(true)

    expect(api.get).toHaveBeenCalled()
  })
})

describe('mutating actions', () => {
  it('addRecipe resolves with the created recipe', async () => {
    const store = useRecipesStore()
    const created = recipe({ id: 9, title: 'Ny' })
    vi.mocked(api.post).mockResolvedValue({ recipe: created })

    const result = await store.addRecipe({ title: 'Ny', comment: '', url: '', imageUrl: null })

    expect(result).toEqual(created)
    expect(store.list[0]).toEqual(created)
  })

  it('setRecipe replaces an existing recipe', () => {
    const store = useRecipesStore()
    store.list = [recipe({ id: 1, title: 'Gammal' })]
    store.setRecipe(recipe({ id: 1, title: 'Ny' }))
    expect(store.list).toHaveLength(1)
    expect(store.list[0].title).toBe('Ny')
  })

  it('deleteRecipe removes the recipe from the list', async () => {
    const store = useRecipesStore()
    store.list = [recipe({ id: 1 }), recipe({ id: 2 })]
    vi.mocked(api.delete).mockResolvedValue({ success: true })

    await store.deleteRecipe(2)

    expect(store.list.map((r) => r.id)).toEqual([1])
  })
})
