import Api from '@/services/Api'

export default {
  fetchMeals () {
    return Api.execute('get', '/meals')
  },

  fetchMealsInWeek (params) {
    return Api.execute('get', '/meals', null, params)
  },

  addMeal (params) {
    return Api.execute('post', '/meals', params)
  },

  updateMeal (params) {
    return Api.execute('put', '/meals/' + params._id, params)
  },

  /*
  getMeal (params) {
    return Api.execute('get', '/meal/' + params.id)
  },
  */

  deleteMeal (id) {
    return Api.execute('delete', '/meals/' + id)
  }
}
