import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { NewRecipe, Recipe } from '@/types'

const CACHE_MINUTES = 5

function normalizeUrl (url: string): string {
  return url.trim().replace(/\/+$/, '')
}

export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    list: [] as Recipe[],
    syncTimestamp: undefined as number | undefined
  }),

  getters: {
    recipeById: (state) => (id: number): Recipe | undefined => {
      return state.list.find((recipe) => recipe.id === id)
    },
    recipeByUrl: (state) => (url: string): Recipe | undefined => {
      const wanted = normalizeUrl(url)
      if (!wanted) return undefined
      return state.list.find((recipe) => normalizeUrl(recipe.url) === wanted)
    }
  },

  actions: {
    setRecipe (recipe: Recipe) {
      const index = this.list.findIndex((r) => r.id === recipe.id)
      if (index !== -1) {
        this.list.splice(index, 1)
      }
      this.list.unshift(recipe)
    },

    async loadRecipeList (force = false) {
      const ageMinutes = this.syncTimestamp ? (Date.now() - this.syncTimestamp) / 60000 : Infinity
      if (!force && ageMinutes < CACHE_MINUTES) {
        return
      }
      const { recipes } = await api.get<{ recipes: Recipe[] }>('/recipes')
      this.list = recipes
      this.syncTimestamp = Date.now()
    },

    async addRecipe (data: NewRecipe): Promise<Recipe> {
      const { recipe } = await api.post<{ recipe: Recipe }>('/recipes', {
        title: data.title,
        comment: data.comment,
        url: data.url,
        imageUrl: data.imageUrl
      })
      this.setRecipe(recipe)
      return recipe
    },

    async updateRecipe (data: Recipe): Promise<Recipe> {
      const { recipe } = await api.put<{ recipe: Recipe }>(`/recipes/${data.id}`, {
        title: data.title,
        comment: data.comment,
        url: data.url,
        imageUrl: data.imageUrl
      })
      this.setRecipe(recipe)
      return recipe
    },

    removeRecipe (id: number) {
      this.list = this.list.filter((recipe) => recipe.id !== id)
    },

    async deleteRecipe (id: number) {
      await api.delete(`/recipes/${id}`)
      this.removeRecipe(id)
    }
  }
})
