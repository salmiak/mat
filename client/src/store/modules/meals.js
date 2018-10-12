import orderBy from 'lodash/orderBy'
import reject from 'lodash/reject'
import findIndex from 'lodash/findIndex'
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
    return orderBy(state.list.filter(meal => {
      var m = moment(meal.date)
      return (m.isoWeek() === query.week && m.isoWeekYear() === query.year)
    }), ['_id'], ['desc'])
  }
}

// actions
const actions = {

  loadMealList ({commit}) {
    MealsService.fetchMeals().then((response) => {
      commit('setMealList', { list: response.meals })
    }, (err) => {
      console.log(err)
    })
  },

  loadMealsInWeek ({commit}, query) {
    MealsService.fetchMealsInWeek(query).then((response) => {
      response.meals.forEach((meal) => {
        commit('setMeal', { meal: meal })
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
        made: data.made,
        date: data.date,
        wpId: data.wpId
      }).then((response) => {
        commit('setMeal', { meal: response.meal })
        resolve()
      }, (err) => {
        console.log(err)
      })
    })
  },

  updateMeal ({commit, state}, data) {
    return new Promise((resolve, reject) => {
      MealsService.updateMeal({
        _id: data._id,
        title: data.title,
        comment: data.comment,
        recipes: data.recipes,
        made: data.made,
        date: data.date,
        vote: data.vote,
        wpId: data.wpId
      }).then(response => {
        commit('setMeal', { meal: response.meal })
        resolve()
      }, err => {
        console.log(err)
      })
    })
  },

  deleteMeal ({commit, state}, id) {
    MealsService.deleteMeal(id).then((response) => {
      commit('setMealList', { list: reject(state.list, {_id: id}) })
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
  setMeal (state, {meal}) {
    var index = findIndex(state.list, {_id: meal._id})
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
