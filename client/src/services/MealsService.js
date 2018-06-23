import Api from '@/services/Api'

export default {
  fetchMeals () {
    return Api().get('meals')
  },

  addMeal (params) {
    return Api().post('meals', params)
  },

  updateMeal (params) {
    return Api().put('meals/' + params.id, params)
  },

  /*
  getMeal (params) {
    return Api().get('meal/' + params.id)
  },
  */

  deleteMeal (id) {
    return Api().delete('meals/' + id)
  }
}
