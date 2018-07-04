import Api from '@/services/Api'

export default {
  fetchWpIdMap () {
    return Api.execute('get', '/wpidmap')
  }
}
