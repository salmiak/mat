<template>
  <div id="app">
    <nav>
      <router-link v-if="loggedIn" to="/logout">Log out</router-link>
      <router-link v-if="!loggedIn" to="/login">Log in</router-link> |
      <router-link to="/week">Meals</router-link> |
      <!-- <router-link to="/meals">Go to Meals</router-link> -->
      <router-link to="/recipes">Recipes</router-link>
    </nav>
    <template v-if="$route.matched.length">
      <router-view></router-view>
    </template>
    <template v-else>
      <p>You are logged {{ loggedIn ? 'in' : 'out' }}</p>
    </template>
  </div>
</template>

<script>
import auth from './auth'
export default {
  name: 'App',
  data () {
    return {
      loggedIn: auth.loggedIn()
    }
  },
  created () {
    this.$store.dispatch('recipes/loadRecipeList')
    auth.onChange = loggedIn => {
      this.loggedIn = loggedIn
    }
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
