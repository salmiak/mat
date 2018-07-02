<template>
  <div id="app">
    <nav>
      <router-link to="/week">Meals</router-link> |
      <!-- <router-link to="/meals">Go to Meals</router-link> -->
      <router-link to="/recipes">Recipes</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    this.$store.dispatch('recipes/loadRecipeList')
  }
}
</script>

<style>
body {
  background: #FAFEFE;
  padding-bottom: 30px;
}
a {
  color: blue;
  text-decoration: none;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
