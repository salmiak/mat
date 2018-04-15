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
    var requestPage = (page) => {
      requests.push(1)  // Add one more element to requests array per request.
      Vue.http.get(global.apiUri+'/recipe/?per_page=100&page='+page).then(response => {

        var totalPages = response.headers.map['X-WP-TotalPages']?response.headers.map['X-WP-TotalPages'][0]:response.headers.map['x-wp-totalpages'][0]
        if ( parseInt(totalPages) != page ) {
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
    return new Promise((resolve, reject) => {
      if ( id ) {
        Vue.http.post(global.apiUri+'/recipe/'+id, state.all.find(recipe => recipe.id == id)).then(response => {
          console.log(response)
          resolve(global.wpProcess(response.body))
        }, response => {
          this.$router.push('/login')
        })
      } else if ( payload ) {
        Vue.http.post(global.apiUri+'/recipe/', payload).then(response => {
          let recipe = global.wpProcess(response.body);
          commit('unshiftRecipe', {recipe:recipe})
          resolve(recipe)
        }, response => {
          this.$router.push('/login')
        })
      } else {
        console.error('You should not see this message...');
      }
    })
  },
  deleteRecipe ({commit, state}, {id}) {
    Vue.http.delete(global.apiUri+'/recipe/'+id).then(response => {
      commit('deleteRecipe', {id:id})
    }, response => {
      this.$router.push('/login')
    })
  },
  voteRecipe ({commit, state}, payload) {
    commit('voteRecipe', payload)
    this.dispatch('updateRecipe', {id:payload.id})
    // let recipe = state.all.find(recipe => recipe.id == id)
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
  clearRecipes (state) { state.all = [] },
  voteRecipe (state, payload) {
    var recipe = state.all.find(recipe => recipe.id == payload.id)
    if (payload.up) {
      recipe.fields.upvotes = parseInt(recipe.fields.upvotes || 0)
      recipe.fields.upvotes += payload.up
    }
    if (payload.down) {
      recipe.fields.downvotes = parseInt(recipe.fields.downvotes || 0)
      recipe.fields.downvotes += payload.down
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
