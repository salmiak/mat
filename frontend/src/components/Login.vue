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
            if( this.$store.state.mobile ) {
              this.$router.push('week')
            } else {
              this.$router.push('/desktop')
            }
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
  padding: @hHeader+@bu*4 @bu*2 0;
  max-width: 400px;
  margin: 0 auto;
  background: @colorBackground;
  position: relative;
  border-radius: @bu;
  overflow: hidden;
  .header {
    position: absolute;
    top: 0;
    background: @colorSecondary;
    h1 { color: @colorBackground; }
  }
  form {
    margin: 0 0 @bu*2;
    .btn {
      margin-top: @bu;
      cursor: pointer;
    }
  }
  .errorMessage {
    background: fade(@colorSecondary, 10%);
    padding: @bu;
    border-radius: @bu;
  }
}
</style>
