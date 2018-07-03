import Api from '@/services/Api'

export default {
  fetchRecipes () {
    return Api.execute('get', '/recipes')
  },

  addRecipe (params) {
    return Api.execute('post', '/recipes', params)
  },

  updateRecipe (params) {
    return Api.execute('put', '/recipes/' + params._id, params)
  },

  /*
  getRecipe (params) {
    return Api.execute('get('recipe/' + params.id)
  },
  */

  deleteRecipe (id) {
    return Api.execute('delete', '/recipes/' + id)
  }
}
