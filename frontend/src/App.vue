<template>
  <!--
    <div id="app">
      <img src="./assets/logo.png">
      <router-view></router-view>
    </div>
  -->
  <div id="app">
    <h1>Recept</h1>
    <recipe-list></recipe-list>
  </div>
</template>

<script>
import RecipeList from './components/RecipeList'
export default {
  name: 'app',
  components:{ RecipeList }
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
