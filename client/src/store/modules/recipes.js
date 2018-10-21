import find from 'lodash/find'
import reject from 'lodash/reject'
import _ from 'lodash'
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
  list (state) {
    /*
    state.list.forEach((r) => {
      r.score = 123
    })
    */
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
        wpId: data.wpId
      }).then(response => {
        commit('setRecipe', { recipe: response.recipe })
        resolve()
      }, err => {
        console.log(err)
      })
    })
  },

  voteRecipe ({commit, state}, data) {
    var recipe = find(state.list, {_id: data.id})
    if (!recipe) {
      return console.error('something went wrong - recipe not found :(')
    }
    recipe.votes = recipe.votes || '[]'
    var votes = JSON.parse(recipe.votes)

    if (votes.length === undefined) {
      // Votes is an object, transform to a collection
      var newVotes = []
      _.forIn(votes, (value, key) => {
        newVotes.push({
          mealId: key,
          value: value,
          date: moment()
        })
      })
      votes = newVotes
    }

    votes = _(votes)
      .reject({ 'mealId': data.mealId })
      .value()

    if (data.value !== 0) {
      votes.push({
        mealId: data.mealId,
        value: data.value,
        date: moment()
      })
    }

    recipe.votes = JSON.stringify(votes)

    recipe.score = _.sum(_(votes)
      .sortBy((vote) => { return moment(vote.date).valueOf() })
      .reverse()
      .take(3)
      .map('value')
      .value())

    return new Promise((resolve, reject) => {
      RecipesService.updateRecipe({
        _id: recipe._id,
        score: recipe.score,
        votes: recipe.votes
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
