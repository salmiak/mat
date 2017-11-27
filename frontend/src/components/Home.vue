<template lang="html">
  <div>Checking device. You should not see this meesage for long.</div>
</template>

<script>
export default {
  name:'Home',
  created(){
    console.log('checking device');
      if( !this.$store.state.mobile && this.$route.name != "Desktop" ) {
        this.$router.push('/d')
      } else {
        this.$router.push('/m/week')
      }
  }
}
</script>

<style lang="css">
</style>
