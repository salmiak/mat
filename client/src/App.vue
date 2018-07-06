<template>
  <div id="app">
    <div class="top">
      <router-link to="/week">Planning</router-link>
      <router-link to="/recipes">Recipes</router-link>
    </div>
    <router-view/>
    <footer>
      <span v-if='activeUser' v-on:click='logout' id='logout-button'>Logout </span>
      <span v-else v-on:click='login' id='login-button'> Login </span>
    </footer>
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
* { box-sizing: border-box; }
@import "./assets/global.less";

html {
  font-size: 16px;
  background: @cHeading;
  @media only screen and (min-device-width : 300px) and (max-device-width : 370px) {
    font-size: 14px;
  }
  @media only screen and (max-device-width : 319px) {
    font-size: 12px;
  }
}

body {
  background: @cBackground;
  font-family: 'Josefin Sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 1rem;
  line-height: 1.5em;
  font-weight: 300;
  color: @cText;
}

a, .a {
  color: @cPrimary;
  text-decoration: none;
  cursor: pointer;
}

.top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  height: 2rem;
  display: flex;
  justify-content: space-between;
  align-content: stretch;
  background: @cBackground;
  > a {
    .capitals;
    font-size: 0.75rem;
    font-weight: 700;
    width: 50%;
    display: block;
    line-height: 2rem;
    flex-grow: 1;
    padding: 0 @bu/1.5;
    margin-left: 2px;
    background: fade(lighten(@cSecondary, 10%), 34%);
    &:first-child {
      margin-left: 0;
    }
    &.router-link-active {
      color: darken(@cSecondary, 20%);
      background: @cSecondary;
    }
  }
}

footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: @cHeading;
  text-align: center;
  color: @cBackground;
  .capitals;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: @bu;
  line-height: @bu*4;
}
#app {
  position: relative;
  padding: 2rem 0 5*@bu;
  min-height: 100vh;
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
