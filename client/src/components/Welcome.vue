<template>
  <div class="welcome">
    <h1>{{$t('Welcome')}}</h1>
    <button v-on:click="$auth.loginRedirect('/week')" id='login-button'> {{$t('Login')}} </button>
  </div>
</template>

<i18n>
  {
    "en": {
      "Welcome": "Welcome",
      "Login": "Login"
    },
    "se": {
      "Welcome": "Välkommen",
      "Login": "Logga in"
    }
  }
</i18n>

<script>

export default {
  name: 'welcome',
  async mounted () {
    if (await this.$auth.isAuthenticated()) {
      this.$router.push('/week')
    }
  }
}
</script>

<style scoped>
.welcome {
  text-align: center;
}
</style>
