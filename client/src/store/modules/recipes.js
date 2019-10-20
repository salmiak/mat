import find from 'lodash/find'
import reject from 'lodash/reject'
import findIndex from 'lodash/findIndex'
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
    return find(state.list, {_id: id})
  }
}

// actions
const actions = {

  loadRecipeList ({commit, state}) {
    var diff = moment().diff(state.syncTimestamp, 'minutes')
    if (state.syncTimestamp && diff < 5) {
      return console.log('Recipes Cached not updated')
    }

    RecipesService.fetchRecipes().then((response) => {
      if (response.recipes) {
        commit('setRecipeList', { list: response.recipes })
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
        fileUrl: data.fileUrl,
        wpId: data.wpId
      }).then((response) => {
        commit('setRecipe', { recipe: response.recipe })
        resolve(response.recipe)
      }, (err) => {
        console.log(err)
      })
    })
  },

  updateRecipe ({commit, state}, data) {
    return new Promise((resolve, reject) => {
      RecipesService.updateRecipe({
        _id: data._id,
        title: data.title,
        comment: data.comment,
        url: data.url,
        fileUrl: data.fileUrl,
        wpId: data.wpId
      }).then(response => {
        commit('setRecipe', { recipe: response.recipe })
        resolve()
      }, err => {
        console.log(err)
      })
    })
  },

  deleteRecipe ({commit, state}, id) {
    RecipesService.deleteRecipe(id).then((response) => {
      commit('setRecipeList', { list: reject(state.list, {_id: id}) })
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
  },
  setRecipe (state, {recipe}) {
    var index = findIndex(state.list, {_id: recipe._id})
    if (index !== -1) {
      state.list.splice(index, 1)
    }
    state.list.unshift(recipe)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
