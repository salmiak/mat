<template>
  <div id="app">
    <nav>
      <router-link to="/week">Go to week</router-link>
      <router-link to="/meals">Go to Meals</router-link>
      <router-link to="/recipes">Go to Recipes</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
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
