<template>
  <div id="login">
    <div class="header">
      <h1>Logga in</h1>
    </div>
    <div class="loadingCover" v-if="loading">
      <div>Loggar in...</div>
    </div>
    <form v-on:submit.prevent="doLogin()">
      Användare <input type="text" v-model="user" /><br/>
      Lösenord <input type="password" v-model="password" />
      <label for="storePwd"><input id="storePwd" type="checkbox" v-model="storePwd"> Kom ih&aring;g mig</label><br>
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
        user: this.$cookies.isKey('mat_usr')?this.$cookies.get('mat_usr'):'',
        password: this.$cookies.isKey('mat_pwd')?this.$cookies.get('mat_pwd'):'',
        storePwd: true,
        errorMessage: false,
        loading: false
      }
    },
    created(){
      if(!this.$store.state.loggedin && this.$cookies.isKey('mat_usr') && this.$cookies.isKey('mat_pwd')){
        this.doLogin()
      }
    },
    methods: {
      doLogin(){
        this.loading = true
        delete Vue.http.headers.common['Authorization']
        this.errorMessage = false
        Vue.http.post(global.root + "wp-json/jwt-auth/v1/token",{
          username: this.user,
          password: this.password
        }).then (response => {
          if (response.status == 200) {
            let expire = moment().add(10, 'y').toDate();
            let token = response.body.token
            this.$cookies.set('mat_authToken', token, expire)
            if (this.storePwd) {
              this.$cookies.set('mat_pwd', this.password, expire)
              this.$cookies.set('mat_usr', this.user, expire)
            }

            Vue.http.headers.common['Authorization'] = 'Bearer ' + token;
            this.$store.commit('loggIn')

            // Reset all content
            this.$store.dispatch('requestAllRecipes')
            this.$store.dispatch('requestAllMeals')

            // Go to home screen
            this.$router.push('/')
            this.loading = false
          }
        }, response => {
          this.errorMessage = response.body.message
          this.loading = false
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
  width: 95%;
  margin: 0 auto;
  background: @colorBackground;
  position: relative;
  border-radius: @bu;
  overflow: hidden;
  .header {
    position: absolute;
    top: 0;
    z-index:300;
    background: @colorSecondary;
    h1 { color: @colorBackground; }
  }
  .loadingCover {
    position: absolute;
    top:@hHeader;
    bottom:0;
    left:0;
    right:0;
    z-index: 100;
    background: fade(#FFF, 95%);
    font-size: @fuxl;
    color: @tc3;
    display: flex;
    justify-content:center;
    align-items:center;
  }
  form {
    z-index:0;
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
label {
  display: block;
  line-height: 5*@bu;
}
</style>
