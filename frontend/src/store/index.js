import Vue from 'vue'
import Vuex from 'vuex'
import recipes from './modules/recipes'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    recipes
  }
})
