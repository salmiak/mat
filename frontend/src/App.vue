<template>

  <div id="app">
    <div id="toolbar">
      <div id="nav">
        <router-link to="/week">Planering</router-link>
        <router-link to="/recipes">Recept</router-link>
      </div>
    </div>
    <router-view/>
  </div>

</template>

<script>
import Vue from 'vue'
import * as global from './store/utils'
export default {
  name: 'app',
  created() {
    let token = this.$cookies.get('mat_authToken')

    // If no token, break and go to Login
    if(!token)
      return this.$router.push('/login')

    // Set token as defautl header
    Vue.http.headers.common['Authorization'] = 'Bearer ' + token;

    // Validate token
    Vue.http.post(global.root+"wp-json/jwt-auth/v1/token/validate").then(response => {
      if(response.status == 200) {
        // Token is good
        this.$store.commit('loggIn')
        this.$store.dispatch('requestAllRecipes')
        this.$store.dispatch('requestAllMeals')
      } else {
        // Token is bad, go to Login
        this.$router.push('/login')
      }
    }, response => {
      this.$router.push('/login')
    })

  }
}
</script>

<style lang="less">
@import "./assets/global.less";

#toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: @hToolbar;
  background: @colorBackground;
  z-index: 900;
}

#nav {
  display: block;
  font-size: 0;
  overflow: hidden;
  a {
    font-size: @fusm;
    font-weight: 800;
    .capitals;
    display: inline-block;
    padding: 0 @bu*2;
    line-height: @hToolbar;
    border-left: 1px solid @colorBackground;
    color: @colorBackground;
    background: fade(@colorPrimary, 30%);
    width: 50%;
    &:first-child {
      border-left: none;
    }
    &.router-link-active {
      background-color: @colorSecondary;
    }
  }
}
</style>
