import _ from 'lodash'
import RecipesService from '@/services/RecipesService'

// initial state
const state = {
  list: []
}

// getters
const getters = {
  recipeList (state) {
    return state.list
  },
  recipeById: (state) => (id) => {
    return _.find(state.list, {_id: id})
  }
}

// actions
const actions = {

  loadRecipeList ({commit}) {
    RecipesService.fetchRecipes().then((response) => {
      commit('setRecipeList', { list: response.data.recipes })
    }, (err) => {
      console.log(err)
    })
  },

  addRecipe ({commit, state}, data) {
    return new Promise((resolve, reject) => {
      RecipesService.addRecipe({
        title: data.title,
        comment: data.comment,
        url: data.url
      }).then((response) => {
        resolve()
      }, (err) => {
        console.log(err)
      })
    })
  },

  deleteRecipe ({commit, state}, id) {
    RecipesService.deleteRecipe(id).then((response) => {
      commit('setRecipeList', { list: _.reject(state.list, {_id: id}) })
    }, (err) => {
      console.log(err)
    })
  }
}

// mutations
const mutations = {
  setRecipeList (state, {list}) {
    state.list = list
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
