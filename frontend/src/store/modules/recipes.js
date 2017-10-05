import Vue from 'vue'
import VueResource from 'vue-resource'

var apiUri = "//localhost:8888/mat/wp-json/wp/v2"

// initial state
const state = {
  all: []
}

// getters
const getters = {
  allRecipes: state => state.all,
  recipeById: (state, getters) => (id) => {
    return state.all.find(recipe => recipe.id === id)
  }
}

// actions
const actions = {
  getAllRecipes ({ commit }) {
    var page = 1
    var requestPage = (page) => {
      Vue.http.get(apiUri+'/recipe/?page='+page).then(response => {

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
