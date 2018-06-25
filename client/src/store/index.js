import Vue from 'vue'
import Vuex from 'vuex'

import recipes from './modules/recipes'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
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
