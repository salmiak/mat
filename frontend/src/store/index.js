import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import recipes from './modules/recipes'
import meals from './modules/meals'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    recipes,
    meals
  },
  state:{
    loggedin: false
  },
  getters: {
    currentWeek(){
      return moment().isoWeek()
    },
    currentYear(){
      return moment().isoWeekYear()
    },
    isLoggedIn: state => {
      return state.loggedin
    }
  },
  mutations: {
    loggIn: state => state.loggedin = true
  }
})
