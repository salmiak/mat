<template>
  <div id="app">
    <nav>
      <router-link to="/week">Meals</router-link> |
      <!-- <router-link to="/meals">Go to Meals</router-link> -->
      <router-link to="/recipes">Recipes</router-link> |
      <span class="a" v-if='activeUser' v-on:click='logout' id='logout-button'>Logout </span>
      <span v-else class="a" v-on:click='login' id='login-button'> Login </span>
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

<style lang="less">
@import (css) url('https://fonts.googleapis.com/css?family=Josefin+Sans:400,400i,700,700i');
@import '../node_modules/reset-css/less/reset';
@import "./assets/global.less";

body {
  background: @cBackground;

  font-family: 'Josefin Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: @rem;
  line-height: 1.5em;
  font-weight: 300;

  color: @cText;
}
a, .a {
  color: @cPrimary;
  text-decoration: none;
  cursor: pointer;
}
nav {
  text-align: center;
}
#app {
  margin: 60px 0;
}

input, textarea {
  width: 90%;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
  margin: 0 0 4px;
}
</style>
