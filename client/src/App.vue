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
  metaInfo: {
    title: 'Hem',
    titleTemplate: '%s | Beckmans matsajt'
  },
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
@import (css) url('https://fonts.googleapis.com/css?family=IBM+Plex+Mono:700|IBM+Plex+Sans+Condensed:500,700|IBM+Plex+Sans:400,400i,500,700|IBM+Plex+Serif:300,300i');
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
  font-family: 'IBM Plex Serif', serif;
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
  font-family: 'IBM Plex Mono', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 2rem;
  > a {
    .capitals;
    width: 50%;
    display: block;
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
  .h3;
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
  padding: 5rem 0 5*@bu;
  min-height: 100vh;
}

header {
  position: fixed;
  top: 2rem;
  left: 0;
  right: 0;
  z-index: 900;
  background: @cMealBg;
  padding: 0;
  text-align: center;
  display: flex;
  justify-content: space-evenly;
  align-content: stretch;
  box-shadow: 0 0 1px rgba(0,0,0,0.2);
}

input, textarea {
  width: calc(100% + @bu);
  margin: 0 -@bu/2 @bu/2;
  padding: @bu/2 @bu/2;
  border: 1px solid fade(@cBackground, 40%);
  outline: none;
  font-size: 1rem;
  border-radius: @radius;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 500;
  line-height: 1.5em;
  color: @cText;
  display: block;
  &::placeholder {
    color: fade(@cPrimary, 30%);
  }
}

.text {
  &-center { text-align: center; }
  &-disabled { opacity: 0.66; }
}

.clear {
  &::after {
    clear: both;
    content: '';
    display: block;
    width: 100%;
    height: 0;
  }
}

.toolbar {
  .noselect;
  position: absolute;
  top: 0;
  right: @bu/2;
  .fal {
    font-size: @bu;
    padding: @bu @bu/2;
    cursor: pointer;
  }
}
</style>
