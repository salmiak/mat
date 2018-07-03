import _ from 'lodash'
import moment from 'moment'
import RecipesService from '@/services/RecipesService'

// initial state
const state = {
  list: [],
  syncTimestamp: undefined
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

  loadRecipeList ({commit, state}) {
    var diff = moment().diff(state.syncTimestamp, 'minutes')
    console.log(diff)
    if (state.syncTimestamp && diff < 5) {
      return console.log('Recipes Cached not updated')
    }
    RecipesService.fetchRecipes().then((response) => {
      if (response.data.recipes) {
        commit('setRecipeList', { list: response.data.recipes })
      }
    }, (err) => {
      console.log(err)
    })
  },

  addRecipe ({commit, state}, data) {
    return new Promise((resolve, reject) => {
      RecipesService.addRecipe({
        title: data.title,
        comment: data.comment,
        url: data.url,
        wpId: data.wpId
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
    state.syncTimestamp = moment()
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
