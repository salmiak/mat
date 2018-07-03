<template>
  <div id="app">
    <nav>
      <router-link to="/week">Meals</router-link> |
      <!-- <router-link to="/meals">Go to Meals</router-link> -->
      <router-link to="/recipes">Recipes</router-link>
      <button v-if='authenticated' v-on:click='logout' id='logout-button'> Logout </button>
      <button v-else v-on:click='login' id='login-button'> Login </button>
    </nav>
    <router-view/>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data () {
    return {
      authenticated: false
    }
  },
  created () {
    this.isAuthenticated()
  },
  watch: {
    // Everytime the route changes, check for auth status
    '$route': 'isAuthenticated'
  },
  methods: {
    async isAuthenticated () {
      this.authenticated = await this.$auth.isAuthenticated()
      axios.defaults.headers.common['Authorization'] = `Bearer ${await this.$auth.getAccessToken()}`
    },
    login () {
      this.$auth.loginRedirect('/week')
    },
    async logout () {
      await this.$auth.logout()
      await this.isAuthenticated()

      // Navigate back to home
      this.$router.push({ path: '/' })
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
