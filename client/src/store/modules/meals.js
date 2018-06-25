import _ from 'lodash'
import MealsService from '@/services/MealsService'

// initial state
const state = {
  list: []
}

// getters
const getters = {
  mealList (state) {
    return state.list
  }
}

// actions
const actions = {

  loadMealList ({commit}) {
    MealsService.fetchMeals().then((response) => {
      commit('setMealList', { list: response.data.meals })
    }, (err) => {
      console.log(err)
    })
  },

  addMeal ({commit, state}, data) {
    return new Promise((resolve, reject) => {
      MealsService.addMeal({
        title: data.title,
        comment: data.comment,
        date: data.date
      }).then((response) => {
        commit('addMeal', { meal: response.data.meal })
        resolve()
      }, (err) => {
        console.log(err)
      })
    })
  },

  deleteMeal ({commit, state}, id) {
    MealsService.deleteMeal(id).then((response) => {
      commit('setMealList', { list: _.reject(state.list, {_id: id}) })
    }, (err) => {
      console.log(err)
    })
  }
}

// mutations
const mutations = {
  setMealList (state, {list}) {
    state.list = list
  },
  addMeal (state, {meal}) {
    state.list.push(meal)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
