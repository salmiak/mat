import Api from '@/services/Api'

export default {
  fetchWpIdMap () {
    return Api().get('wpidmap')
  }
}
