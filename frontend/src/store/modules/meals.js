import Vue from 'vue'
import VueResource from 'vue-resource'
import moment from 'moment'
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
  mealsByWeek: (state,getters) => (year, week) => {
    return state.all.filter(meal => {
      var mom;
      if (meal.fields.date) {
        mom = moment(meal.fields.date)
      } else {
        // Legacy - v1 of site only saved week (because I'm shortminded)
        mom = moment().isoWeekYear(2017).isoWeek(meal.fields.week)
      }
      return mom.isoWeek() == week && mom.isoWeekYear() == year
    })
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
          commit('pushMeal',{meal: meal})
        })

      })
    }
    requestPage(page)
  },
  updateMeal ({ commit,state }, { id, payload }) {
    if ( id ) {
      Vue.http.post(global.apiUri+'/meal/'+id, state.all.find(meal => meal.id == id)).then(response => console.log(response))
    } else if ( payload ) {
      Vue.http.post(global.apiUri+'/meal/', payload).then(response => {
        let meal = global.wpProcess(response.body);
        commit('unshiftMeal', {meal:meal})
      })
    } else {
      console.error('You should not see this message...');
    }
  }
}

// mutations
const mutations = {
  pushMeal (state, payload) { state.all.push(payload.meal) },
  unshiftMeal (state, payload) { state.all.unshift(payload.meal) }
}

export default {
  state,
  getters,
  actions,
  mutations
}
