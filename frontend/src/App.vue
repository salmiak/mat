<template>

  <div id="app">
    <div id="nav">
      <router-link to="/">Planering</router-link>
      <router-link to="/recipes">Recept</router-link>
    </div>
    <router-view/>
  </div>

</template>

<script>
export default {
  name: 'app',
  created() {
    this.$store.dispatch('requestAllRecipes')
    this.$store.dispatch('requestAllMeals')
  }
}
</script>

<style lang="less">
@import url('https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i');
@import "./assets/global.less";

#app {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: @colorPrimary;
  width: 95%;
  max-width: 400px;
  margin: 60px auto;
}

#nav {
  display: inline-block;
  border: 1px solid @colorPrimary;
  border-radius: 8px;
  width: auto;
  font-size: 0;
  margin-bottom: 10px;
  a {
    font-size: 1rem;
    display: inline-block;
    padding: 0 12px;
    line-height: 2em;
    border-left: 1px solid @colorPrimary;
    color: fade(@colorPrimary, 54%);
    &:first-child {
      border-left: none;
      padding-left: 14px;
      border-radius: 7px 0 0 7px;
    }
    &:last-child {
      padding-right: 14px;
      border-radius: 0 7px 7px 0;
    }
    &:hover {
        background-color: fade(@colorPrimary, 12%);
    }
    &.router-link-exact-active {
      background-color: @colorPrimary;
      color: #FFF;
    }
  }
}

h1 {
  font-weight: 900;
  color: @colorSecondary;
  font-size: 3em;
  line-height: 1em;
  margin: .5em 0 .3em;
}
a {
  color: @colorSecondary;
  text-decoration: none;
}
</style>
