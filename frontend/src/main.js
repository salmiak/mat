// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import Counter from './components/Counter'
import CountControll from './components/CountCrtl'

Vue.config.productionTip = false
Vue.use(Vuex)

//var apiUri = "//localhost:8888/mat"

/*
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
*/

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment: state => state.count++,
    decrement: state => state.count--
  }
})

new Vue({
  el: '#app',
  store,
  components:{ Counter, CountControll },
  // view
  template: `
    <div class="app">
      <counter></counter>
      <count-controll></count-controll>
    </div>
  `
})
