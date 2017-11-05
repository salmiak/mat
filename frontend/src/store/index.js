import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'
import recipes from './modules/recipes'
import meals from './modules/meals'

import MobileDetect from 'mobile-detect'
var md = new MobileDetect(window.navigator.userAgent);

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    recipes,
    meals
  },
  state:{
    loggedin: false,
    mobile: md.mobile()
  },
  getters: {
    currentWeek(){
      return moment().isoWeek()
    },
    currentYear(){
      return moment().isoWeekYear()
    },
    isLoggedIn: state => state.loggedin,
    isLoading: (state, payload, root) => root.recipes.loading || root.meals.loading
  },
  mutations: {
    loggIn: state => state.loggedin = true
  }
})
