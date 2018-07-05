import Api from '@/services/Api'

export default {
  fetchRecipesWpIdMap () {
    return Api.execute('get', '/recipes/wpidmap')
  },
  fetchMealsWpIdMap () {
    return Api.execute('get', '/meals/wpidmap')
  }
}
