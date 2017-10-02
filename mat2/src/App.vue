<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-view></router-view>
    <recipe v-for="rec in recipes" :key="rec" v-bind:id="rec"></recipe>
  </div>
</template>

<script>
import {HTTP} from './http.js'
import Recipe from '@/components/Recipe'

export default {
  components: {
    recipe: Recipe
  },
  name: 'app',
  data: () => ({
    recipes: [],
    page: 1,
    perPage: 20
  }),
  methods: {
    getRecipes() {
      var _this = this;
      HTTP.get('recipe?per_page='+this.perPage+'&page='+this.page)
      .then(response => {
        if(response.status == 200)
          response.data.forEach(function(data){
            _this.recipes.push(data.id)
          })

        if(response.data.length == this.perPage) {
          this.page++;
          this.getRecipes()
        }
      })
      .catch(e => {
        this.errors.push(e)
      })
    }
  },
  created() {
    this.getRecipes();
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
