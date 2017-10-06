import Vue from 'vue'
import VueResource from 'vue-resource'
import * as global from '../utils'

// initial state
const state = {
  all: []
}

// getters
const getters = {
  allMeals: state => state.all,
  mealById: (state, getters) => (id) => {
    return state.all.find(meal => meal.id === id)
  },
  mealsByWeek: (state,getters) => (week) => {
    return state.all.filter(meal => meal.fields.week == week)
  }
}

// actions
const actions = {
  requestAllMeals ({ commit }) {
    var page = 1
    var requestPage = (page) => {
      Vue.http.get(global.apiUri+'/meal/?page='+page).then(response => {

        if ( parseInt(response.headers.map['x-wp-totalpages'][0]) != page ) {
          page++
          requestPage(page)
        }

        response.body.forEach(function(meal){
          meal = global.wpProcess(meal);
          commit('addMeal',{meal: meal})
        })

      })
    }
    requestPage(page)
  },
  updateMeal ({ commit,state }, { id }) {
    Vue.http.post(global.apiUri+'/meal/'+id, state.all.find(meal => meal.id == id)).then(response => console.log(response))
  }
}

// mutations
const mutations = {
  addMeal (state, payload) { state.all.push(payload.meal) }
}

export default {
  state,
  getters,
  actions,
  mutations
}
