<template>
  <!--
    <div id="app">
      <img src="./assets/logo.png">
      <router-view></router-view>
    </div>
  -->
  <div id="app">
    <week v-bind:number="23"></week>
    <h1>Recept</h1>
    <recipe-list></recipe-list>
  </div>
</template>

<script>
import RecipeList from './components/RecipeList'
import Week from './components/Week'
export default {
  name: 'app',
  components:{ RecipeList,Week }
}
</script>

<style lang="less">
@import url('https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i');

@colorPrimary: #457;
@colorSecondary: #F35;

#app {
  font-family: 'Nunito', Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: 20px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: @colorPrimary;
  width: 95%;
  max-width: 400px;
  margin: 60px auto;
}
h1 {
  font-weight: 900;
  color: @colorSecondary;
  font-size: 3em;
  line-height: 1em;
  margin: 1em 0 .3em;
}
</style>
