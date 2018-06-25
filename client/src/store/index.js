import Vue from 'vue'
import Vuex from 'vuex'

import meals from './modules/meals'
import recipes from './modules/recipes'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    meals,
    recipes
  },
  state: {
  },
  actions: {
  },
  mutations: {
  },
  getters: {
  }
})
export default store
