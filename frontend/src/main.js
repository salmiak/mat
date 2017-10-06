// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import * as global from './store/utils'
import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(VueResource)
Vue.http.headers.common['Authorization'] = 'Basic ' + global.authToken;

// Register Font Awesome icon component globaly
Vue.component('icon', Icon)

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
