import { defineStore } from 'pinia'
import { getISOWeek, getISOWeekYear, parseISO } from 'date-fns'
import { api } from '@/services/api'
import type { Meal, NewMeal, VoteValue, WeekRef } from '@/types'

// This browser's own votes, so a vote can be undone or switched.
// Moves to the user account when auth lands.
const VOTES_KEY = 'mat.votes'

interface OwnVote { id: number, value: VoteValue }

function readOwnVotes (): Record<number, OwnVote> {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeOwnVotes (votes: Record<number, OwnVote>) {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
  } catch { /* private browsing etc. */ }
}

interface VoteResponse { vote?: { id: number }, upvotes: number, downvotes: number }

function byWeek (meal: Meal, ref: WeekRef): boolean {
  const date = parseISO(meal.date)
  return getISOWeek(date) === ref.week && getISOWeekYear(date) === ref.year
}

export const useMealsStore = defineStore('meals', {
  state: () => ({
    list: [] as Meal[],
    ownVotes: readOwnVotes()
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
    },

    ownVote (mealId: number): VoteValue | undefined {
      return this.ownVotes[mealId]?.value
    },

    // Tapping a thumb: sets the vote, tapping the same thumb again undoes
    // it, tapping the other thumb switches it.
    async voteMeal (mealId: number, value: VoteValue) {
      const existing = this.ownVotes[mealId]
      let response: VoteResponse
      try {
        if (existing && existing.value === value) {
          response = await api.delete<VoteResponse>(`/votes/${existing.id}`)
          delete this.ownVotes[mealId]
        } else if (existing) {
          response = await api.put<VoteResponse>(`/votes/${existing.id}`, { value })
          this.ownVotes[mealId] = { id: existing.id, value }
        } else {
          response = await api.post<VoteResponse>(`/meals/${mealId}/votes`, { value })
          this.ownVotes[mealId] = { id: response.vote!.id, value }
        }
      } catch (err) {
        if (!existing) throw err
        // The remembered vote no longer exists on the server — start over
        delete this.ownVotes[mealId]
        response = await api.post<VoteResponse>(`/meals/${mealId}/votes`, { value })
        this.ownVotes[mealId] = { id: response.vote!.id, value }
      }
      writeOwnVotes(this.ownVotes)

      const meal = this.list.find((m) => m.id === mealId)
      if (meal) {
        meal.upvotes = response.upvotes
        meal.downvotes = response.downvotes
      }
    }
  }
})
