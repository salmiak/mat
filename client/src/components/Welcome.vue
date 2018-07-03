<template>
  <div>
    <h1>Welcome</h1>
    <button v-on:click="$auth.loginRedirect('/week')" id='login-button'> Login </button>
  </div>
</template>

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
