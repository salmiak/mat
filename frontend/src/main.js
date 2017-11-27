// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import VueCookies from 'vue-cookies'
import VueTouch  from 'vue-touch'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import * as global from './store/utils'
import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueResource)
Vue.use(VueCookies)
Vue.use(VueTouch, {name: 'v-touch'})

// Register Font Awesome icon component globaly
Vue.component('icon', Icon)

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  created() {
    let token = this.$cookies.get('mat_authToken')

    // If no token, break and go to Login
    if(!token)
      return this.$router.push('/login')

    // Set token as defautl header
    Vue.http.headers.common['Authorization'] = 'Bearer ' + token;

    // Validate token
    Vue.http.post(global.root+"wp-json/jwt-auth/v1/token/validate").then(response => {
      if(response.status == 200) {
        // Token is good
        this.$store.commit('loggIn')
        this.$store.dispatch('requestAllRecipes')
        this.$store.dispatch('requestAllMeals')
      } else {
        // Token is bad, go to Login
        this.$router.push('/login')
      }
    }, response => {
      this.$router.push('/login')
    })

  }
})

// test
