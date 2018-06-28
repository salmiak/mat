import _ from 'lodash'
import moment from 'moment'
import MealsService from '@/services/MealsService'

// initial state
const state = {
  list: []
}

// getters
const getters = {
  mealList (state) {
    return state.list
  },
  mealsInWeek: (state) => (query) => {
    return _.filter(state.list, (meal) => {
      var m = moment(meal.date)
      return (m.isoWeek() === query.week && m.isoWeekYear() === query.year)
    })
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

  loadMealsInWeek ({commit}, query) {
    MealsService.fetchMealsInWeek(query).then((response) => {
      response.data.meals.forEach((meal) => {
        commit('addMeal', { meal: meal })
      })
    }, (err) => {
      console.log(err)
    })
  },

  addMeal ({commit, state}, data) {
    return new Promise((resolve, reject) => {
      MealsService.addMeal({
        title: data.title,
        comment: data.comment,
        recipes: data.recipes,
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
    var index = _.findIndex(state.list, {_id: meal._id})
    if (index !== -1) {
      state.list.splice(index, 1)
    }
    state.list.unshift(meal)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
