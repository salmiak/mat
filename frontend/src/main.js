// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'
import RecipeList from './components/RecipeList'

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(VueResource)

var apiUri = "//localhost:8888/mat/wp-json/wp/v2"

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
    recipes: []
  },
  mutations: {
    addRecipe: (state, payload) => state.recipes.push(payload.recipe)
  },
  actions: {
    loadRecipes ({ commit }) {
      var page = 1
      var requestPage = (page) => {
        Vue.http.get(apiUri+'/recipe/?page='+page).then(response => {

          if ( parseInt(response.headers.map['x-wp-totalpages'][0]) != page ) {
            page++
            requestPage(page)
          }

          response.body.forEach(function(recipe){
            recipe.title = recipe.title.rendered
            recipe.content = recipe.content.rendered
            commit('addRecipe',{recipe: recipe})
          })

        })
      }
      requestPage(page)
    }
  }
})

new Vue({
  el: '#app',
  store,
  components:{ RecipeList },
  // view
  template: `
    <div class="app">
      <h1>Lista</h1>
      <recipe-list></recipe-list>
    </div>
  `
})
