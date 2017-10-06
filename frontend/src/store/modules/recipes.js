import Vue from 'vue'
import VueResource from 'vue-resource'
import * as global from '../const'

// initial state
const state = {
  all: []
}

// getters
const getters = {
  allRecipes: state => state.all,
  recipeById: (state, getters) => (id) => {
    // Make sure to only look for existing recipes
    if (getters.verifyRecipe(id)) {
      return state.all.find(recipe => recipe.id == id)
    } else {
      return false
    }
  },
  // Check if recipe id exists
  verifyRecipe: state => (id) => {
    return state.all.map(recipe => recipe.id).indexOf(id) != -1
  }
}

// actions
const actions = {
  requestAllRecipes ({ commit }) {
    var page = 1
    var requestPage = (page) => {
      Vue.http.get(global.apiUri+'/recipe/?page='+page).then(response => {

        if ( parseInt(response.headers.map['x-wp-totalpages'][0]) != page ) {
          page++
          requestPage(page)
        }

        response.body.forEach(function(recipe){
          recipe.title = recipe.title.rendered
          recipe.content = recipe.content.rendered
          commit('addRecipe',{recipe: recipe})
        })

      })
    }
    requestPage(page)
  }
}

// mutations
const mutations = {
  addRecipe (state, payload) { state.all.push(payload.recipe) }
}

export default {
  state,
  getters,
  actions,
  mutations
}
