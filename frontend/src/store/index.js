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
  getters: {
    currentWeek(){
      return moment().isoWeek()
    },
    currentYear(){
      return moment().isoWeekYear()
    }
  }
})
