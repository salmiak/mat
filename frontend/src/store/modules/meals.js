import Vue from 'vue'
import VueResource from 'vue-resource'
import moment from 'moment'
import * as global from '../utils'

// initial state
const state = {
  all: [],
  loading: true
}

// getters
const getters = {
  allMeals: state => state.all,
  mealById: (state, getters) => (id) => {
    return state.all.find(meal => meal.id === id)
  },
  mealsByWeek: (state,getters) => (year, week) => {
    return state.all.filter(meal => {
      return moment(meal.fields.date).isoWeek() == week && moment(meal.fields.date).isoWeekYear() == year
    })
  },
  mealsLoading: (state) => state.loading
}

// actions
const actions = {
  requestAllMeals ({ commit }) {
    commit('clearMeals')
    commit('mealsLoading', {loading: true})
    var page = 1, requests = []
    var requestPage = function(page) {
      requests.push(1)  // Add one more element to requests array per request.
      Vue.http.get(global.apiUri+'/meal/?per_page=40&page='+page).then(response => {

        console.log(response.headers)

        if ( parseInt(response.headers.map['x-wp-totalpages'][0]) != page ) {
          page++
          requestPage(page)
        }

        response.body.forEach(function(meal){
          meal = global.wpProcess(meal);
          if(!meal.fields.date) {
            meal.fields.date = moment().isoWeekYear(2017).isoWeek(meal.fields.week)
            delete meal.fields.week
          }
          commit('pushMeal',{meal: meal})
        })
        requests.pop(1)  // Remove this request from requests array.
        commit('mealsLoading', { loading: requests.length > 0 })


      }, response => {
        this.$router.push('/login')
      })
    }
    requestPage(page)
  },
  updateMeal ({ commit,state }, { id, payload }) {
    if ( id ) {
      Vue.http.post(global.apiUri+'/meal/'+id, state.all.find(meal => meal.id == id)).then(response => console.log(response), response => {
        this.$router.push('/login')
      })
    } else if ( payload ) {
      Vue.http.post(global.apiUri+'/meal/', payload).then(response => {
        var meal = global.wpProcess(response.body);
        commit('unshiftMeal', {meal:meal})
      }, response => {
        this.$router.push('/login')
      })
    } else {
      console.error('You should not see this message...');
    }
  },
  deleteMeal ({commit, state}, {id}) {
    Vue.http.delete(global.apiUri+'/meal/'+id).then(response => {
      commit('deleteMeal', {id:id})
    }, response => {
      this.$router.push('/login')
    })
  }
}

// mutations
const mutations = {
  mealsLoading (state, payload) { state.loading = payload.loading },
  pushMeal (state, payload) { state.all.push(payload.meal) },
  unshiftMeal (state, payload) { state.all.unshift(payload.meal) },
  deleteMeal (state, payload) {
    for(var i = 0; i < state.all.length; i++) {
      var obj = state.all[i];

      if(obj.id == payload.id) {
        state.all.splice(i, 1);
        i--;
      }
    }
  },
  clearMeals (state) { state.all = [] }
}

export default {
  state,
  getters,
  actions,
  mutations
}
