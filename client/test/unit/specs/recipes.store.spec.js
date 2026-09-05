import { describe, it, expect, vi, beforeEach } from 'vitest'
import moment from 'moment'

vi.mock('@/services/RecipesService', () => ({
  default: {
    fetchRecipes: vi.fn(),
    addRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn()
  }
}))

import RecipesService from '@/services/RecipesService'
import recipesModule from '@/store/modules/recipes'

const { getters, mutations, actions } = recipesModule

beforeEach(() => {
  vi.clearAllMocks()
})

describe('recipes getters', () => {
  it('recipeById finds a recipe', () => {
    const state = { list: [{ _id: 'r1', title: 'Pannkakor' }, { _id: 'r2' }] }
    expect(getters.recipeById(state)('r1').title).toBe('Pannkakor')
    expect(getters.recipeById(state)('missing')).toBeUndefined()
  })
})

describe('recipes mutations', () => {
  it('setRecipeList replaces the list and stamps the sync time', () => {
    const state = { list: [], syncTimestamp: undefined }
    mutations.setRecipeList(state, { list: [{ _id: 'r1' }] })
    expect(state.list).toEqual([{ _id: 'r1' }])
    expect(state.syncTimestamp).toBeDefined()
  })

  it('setRecipe replaces an existing recipe instead of duplicating it', () => {
    const state = { list: [{ _id: 'r1', title: 'Gammal' }] }
    mutations.setRecipe(state, { recipe: { _id: 'r1', title: 'Ny' } })
    expect(state.list).toHaveLength(1)
    expect(state.list[0].title).toBe('Ny')
  })
})

describe('recipes actions', () => {
  it('loadRecipeList fetches when there is no cached sync', async () => {
    RecipesService.fetchRecipes.mockResolvedValue({ recipes: [{ _id: 'r1' }] })
    const commit = vi.fn()

    actions.loadRecipeList({ commit, state: { list: [], syncTimestamp: undefined } })
    await vi.waitFor(() => expect(commit).toHaveBeenCalled())

    expect(commit).toHaveBeenCalledWith('setRecipeList', { list: [{ _id: 'r1' }] })
  })

  it('loadRecipeList skips fetching when synced within the last 5 minutes', () => {
    const commit = vi.fn()

    actions.loadRecipeList({ commit, state: { list: [], syncTimestamp: moment().subtract(2, 'minutes') } })

    expect(RecipesService.fetchRecipes).not.toHaveBeenCalled()
    expect(commit).not.toHaveBeenCalled()
  })

  it('loadRecipeList fetches again when the cache is older than 5 minutes', async () => {
    RecipesService.fetchRecipes.mockResolvedValue({ recipes: [] })
    const commit = vi.fn()

    actions.loadRecipeList({ commit, state: { list: [], syncTimestamp: moment().subtract(6, 'minutes') } })
    await vi.waitFor(() => expect(RecipesService.fetchRecipes).toHaveBeenCalled())
  })

  it('addRecipe resolves with the created recipe', async () => {
    const recipe = { _id: 'r9', title: 'Ny' }
    RecipesService.addRecipe.mockResolvedValue({ recipe })
    const commit = vi.fn()

    const result = await actions.addRecipe({ commit, state: { list: [] } }, { title: 'Ny' })

    expect(result).toEqual(recipe)
    expect(commit).toHaveBeenCalledWith('setRecipe', { recipe })
  })

  it('deleteRecipe removes the recipe from the list on success', async () => {
    RecipesService.deleteRecipe.mockResolvedValue({ success: true })
    const commit = vi.fn()
    const state = { list: [{ _id: 'r1' }, { _id: 'r2' }] }

    actions.deleteRecipe({ commit, state }, 'r2')
    await vi.waitFor(() => expect(commit).toHaveBeenCalled())

    expect(commit).toHaveBeenCalledWith('setRecipeList', { list: [{ _id: 'r1' }] })
  })
})
