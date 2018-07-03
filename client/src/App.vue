<template>
  <div id="app">
    <nav>
      <router-link to="/week">Meals</router-link> |
      <!-- <router-link to="/meals">Go to Meals</router-link> -->
      <router-link to="/recipes">Recipes</router-link>
      <button v-if='activeUser' v-on:click='logout' id='logout-button'> Logout </button>
      <button v-else v-on:click='login' id='login-button'> Login </button>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      activeUser: null
    }
  },
  async created () {
    await this.refreshActiveUser()
  },
  watch: {
    // Everytime the route changes, check for auth status
    '$route': 'refreshActiveUser'
  },
  methods: {
    login () {
      this.$auth.loginRedirect()
    },
    async refreshActiveUser () {
      this.activeUser = await this.$auth.getUser()
    },
    async logout () {
      await this.$auth.logout()
      await this.refreshActiveUser()
      this.$router.push('/')
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
