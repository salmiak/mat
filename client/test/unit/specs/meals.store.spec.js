import { describe, it, expect, vi, beforeEach } from 'vitest'
import moment from 'moment'

vi.mock('@/services/MealsService', () => ({
  default: {
    fetchMeals: vi.fn(),
    fetchMealsInWeek: vi.fn(),
    addMeal: vi.fn(),
    updateMeal: vi.fn(),
    deleteMeal: vi.fn()
  }
}))

import MealsService from '@/services/MealsService'
import mealsModule from '@/store/modules/meals'

const { getters, mutations, actions } = mealsModule

function freshState () {
  return { list: [] }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('meals mutations', () => {
  it('setMealList replaces the list', () => {
    const state = freshState()
    mutations.setMealList(state, { list: [{ _id: 'a' }] })
    expect(state.list).toEqual([{ _id: 'a' }])
  })

  it('setMeal adds a new meal first in the list', () => {
    const state = { list: [{ _id: 'a' }] }
    mutations.setMeal(state, { meal: { _id: 'b' } })
    expect(state.list.map(m => m._id)).toEqual(['b', 'a'])
  })

  it('setMeal replaces an existing meal instead of duplicating it', () => {
    const state = { list: [{ _id: 'a', title: 'Gammal' }, { _id: 'b' }] }
    mutations.setMeal(state, { meal: { _id: 'a', title: 'Ny' } })
    expect(state.list).toHaveLength(2)
    expect(state.list[0]).toEqual({ _id: 'a', title: 'Ny' })
  })
})

describe('meals getters', () => {
  it('mealsInWeek filters by ISO week and year', () => {
    const inWeek = { _id: '2', date: moment('2026-03-02').toISOString() } // week 10, 2026
    const otherWeek = { _id: '1', date: moment('2026-03-09').toISOString() }
    const otherYear = { _id: '3', date: moment('2025-03-03').toISOString() }
    const state = { list: [inWeek, otherWeek, otherYear] }

    const result = getters.mealsInWeek(state)({ week: 10, year: 2026 })

    expect(result).toEqual([inWeek])
  })

  it('mealsInWeek orders by _id descending', () => {
    const state = {
      list: [
        { _id: 'a', date: moment('2026-03-02').toISOString() },
        { _id: 'c', date: moment('2026-03-03').toISOString() },
        { _id: 'b', date: moment('2026-03-04').toISOString() }
      ]
    }

    const result = getters.mealsInWeek(state)({ week: 10, year: 2026 })

    expect(result.map(m => m._id)).toEqual(['c', 'b', 'a'])
  })
})

describe('meals actions', () => {
  it('loadMealList fetches meals and commits the list', async () => {
    MealsService.fetchMeals.mockResolvedValue({ meals: [{ _id: 'a' }] })
    const commit = vi.fn()

    actions.loadMealList({ commit })
    await vi.waitFor(() => expect(commit).toHaveBeenCalled())

    expect(commit).toHaveBeenCalledWith('setMealList', { list: [{ _id: 'a' }] })
  })

  it('addMeal sends only the whitelisted fields and commits the result', async () => {
    const meal = { _id: 'new1', title: 'Tacos' }
    MealsService.addMeal.mockResolvedValue({ meal })
    const commit = vi.fn()

    await actions.addMeal({ commit, state: freshState() }, {
      title: 'Tacos', comment: '', recipes: [], made: false, date: '2026-09-04', wpId: 1,
      junk: 'should not be sent'
    })

    expect(MealsService.addMeal).toHaveBeenCalledWith({
      title: 'Tacos', comment: '', recipes: [], made: false, date: '2026-09-04', wpId: 1
    })
    expect(commit).toHaveBeenCalledWith('setMeal', { meal })
  })

  it('deleteMeal removes the meal from the list on success', async () => {
    MealsService.deleteMeal.mockResolvedValue({ success: true })
    const commit = vi.fn()
    const state = { list: [{ _id: 'a' }, { _id: 'b' }] }

    actions.deleteMeal({ commit, state }, 'a')
    await vi.waitFor(() => expect(commit).toHaveBeenCalled())

    expect(commit).toHaveBeenCalledWith('setMealList', { list: [{ _id: 'b' }] })
  })
})
