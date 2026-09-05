import { defineStore } from 'pinia'
import { getISOWeek, getISOWeekYear, parseISO } from 'date-fns'
import { api } from '@/services/api'
import type { Meal, NewMeal, WeekRef } from '@/types'

function byWeek (meal: Meal, ref: WeekRef): boolean {
  const date = parseISO(meal.date)
  return getISOWeek(date) === ref.week && getISOWeekYear(date) === ref.year
}

export const useMealsStore = defineStore('meals', {
  state: () => ({
    list: [] as Meal[]
  }),

  getters: {
    mealsInWeek: (state) => (ref: WeekRef): Meal[] => {
      return state.list
        .filter((meal) => byWeek(meal, ref))
        .sort((a, b) => b.id - a.id)
    }
  },

  actions: {
    setMeal (meal: Meal) {
      const index = this.list.findIndex((m) => m.id === meal.id)
      if (index !== -1) {
        this.list.splice(index, 1)
      }
      this.list.unshift(meal)
    },

    async loadMealsInWeek (ref: WeekRef) {
      const { meals } = await api.get<{ meals: Meal[] }>(`/meals?week=${ref.week}&year=${ref.year}`)
      meals.forEach((meal) => this.setMeal(meal))
    },

    async addMeal (data: NewMeal): Promise<Meal> {
      const { meal } = await api.post<{ meal: Meal }>('/meals', {
        title: data.title,
        comment: data.comment,
        date: data.date,
        index: data.index ?? 0,
        made: data.made ?? false,
        recipeIds: data.recipeIds ?? []
      })
      this.setMeal(meal)
      return meal
    },

    async updateMeal (data: Meal): Promise<Meal> {
      const { meal } = await api.put<{ meal: Meal }>(`/meals/${data.id}`, {
        title: data.title,
        comment: data.comment,
        date: data.date,
        index: data.index,
        made: data.made,
        recipeIds: data.recipeIds
      })
      this.setMeal(meal)
      return meal
    },

    async deleteMeal (id: number) {
      await api.delete(`/meals/${id}`)
      this.list = this.list.filter((meal) => meal.id !== id)
    }
  }
})
