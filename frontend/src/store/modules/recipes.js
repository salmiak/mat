import Vue from 'vue'
import VueResource from 'vue-resource'
import * as global from '../utils'

// initial state
const state = {
  all: [],
  loading: true
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
  },
  recipesLoading: (state) => state.loading
}

// actions
const actions = {
  requestAllRecipes ({ commit }) {
    commit('clearRecipes')
    commit('recipesLoading', {loading: true})
    var page = 1, requests = []
    var requestPage = function(page) {
      requests.push(1)  // Add one more element to requests array per request.
      console.log(requests)
      Vue.http.get(global.apiUri+'/recipe/?per_page=40&page='+page).then(response => {

        if ( parseInt(response.headers.map['x-wp-totalpages'][0]) != page ) {
          page++
          requestPage(page)
        }

        response.body.forEach(function(recipe){
          recipe = global.wpProcess(recipe);
          commit('pushRecipe',{recipe: recipe})
        })
        requests.pop(1)  // Remove this request from requests array.
        commit('recipesLoading', { loading: requests.length > 0 })

      }, response => {
        this.$router.push('/login')
      })
    }
    requestPage(page)
  },
  updateRecipe ({ commit,state }, { id, payload }) {
    if ( id ) {
      Vue.http.post(global.apiUri+'/recipe/'+id, state.all.find(recipe => recipe.id == id)).then(response => console.log(response), response => {
        this.$router.push('/login')
      })
    } else if ( payload ) {
      Vue.http.post(global.apiUri+'/recipe/', payload).then(response => {
        var recipe = global.wpProcess(response.body);
        commit('unshiftRecipe', {recipe:recipe})
      }, response => {
        this.$router.push('/login')
      })
    } else {
      console.error('You should not see this message...');
    }
  },
  deleteRecipe ({commit, state}, {id}) {
    Vue.http.delete(global.apiUri+'/recipe/'+id).then(response => {
      commit('deleteRecipe', {id:id})
    }, response => {
      this.$router.push('/login')
    })
  }
}

// mutations
const mutations = {
  recipesLoading (state, payload) { state.loading = payload.loading },
  pushRecipe (state, payload) { state.all.push(payload.recipe) },
  unshiftRecipe (state, payload) { state.all.unshift(payload.recipe) },
  deleteRecipe (state, payload) {
    for(var i = 0; i < state.all.length; i++) {
      var obj = state.all[i];

      if(obj.id == payload.id) {
        state.all.splice(i, 1);
        i--;
      }
    }
  },
  clearRecipes (state) { state.all = [] }
}

export default {
  state,
  getters,
  actions,
  mutations
}
