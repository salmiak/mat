<template>
  <div id="login">
    <div class="header">
      <h1>Logga in</h1>
    </div>
    <form v-on:submit.prevent="doLogin()">
      Användare <input type="text" v-model="user" /><br/>
      Lösenord <input type="password" v-model="password" />
      <input type="submit" class="btn btn-primary" value="Logga in" />
    </form>
    <p class="errorMessage" v-if="errorMessage" v-html="errorMessage"></p>
  </div>
</template>

<script>
  import Vue from 'vue'
  import moment from 'moment'
  import * as global from '../store/utils'
  export default {
    name: "Login",
    data(){
      return {
        user: '',
        password: '',
        errorMessage: false
      }
    },
    methods: {
      doLogin(){
        delete Vue.http.headers.common['Authorization']
        this.errorMessage = false
        Vue.http.post(global.root + "wp-json/jwt-auth/v1/token",{
          username: this.user,
          password: this.password
        }).then (response => {
          if (response.status == 200) {
            let token = response.body.token
            this.$cookies.set('mat_authToken', token)
            Vue.http.headers.common['Authorization'] = 'Bearer ' + token;
            this.$store.commit('loggIn')

            // Reset all content
            this.$store.dispatch('requestAllRecipes')
            this.$store.dispatch('requestAllMeals')

            // Go to home screen
            this.$router.push('week')
          }
        }, response => {
          this.errorMessage = response.body.message
        });
        return false;
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
#login {
  padding: @bu*4 @bu*2;
  max-width: 400px;
  margin: 0 auto;
  form {
    margin: 0 0 @bu*2;
  }
  .errorMessage {
    background: fade(@colorSecondary, 10%);
    padding: @bu;
    border-radius: @bu;
  }
}
</style>
