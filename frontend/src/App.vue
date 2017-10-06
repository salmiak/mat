<template>
  <!--
    <div id="app">
      <img src="./assets/logo.png">
      <router-view></router-view>
    </div>
  -->
  <div id="app">
    <button @click="goToPrevWeek()">Förra veckan</button>
    <button @click="goToThisWeek()">Idag</button>
    <button @click="goToNextWeek()">Nästa vecka</button>
    <week v-bind:number="showWeek"></week>
    <!--<h1>Recept</h1>
    <recipe-list></recipe-list>-->
  </div>
</template>

<script>
import RecipeList from './components/RecipeList'
import Week from './components/Week'

// Calculate week of year: https://stackoverflow.com/questions/7765767/show-week-number-with-javascript
Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

export default {
  name: 'app',
  components:{ RecipeList,Week },
  data() {
    return {
      currentWeek: (new Date()).getWeek(),
      weekOffset: 0
    }
  },
  created() {
    this.$store.dispatch('requestAllRecipes')
    this.$store.dispatch('requestAllMeals')
  },
  computed: {
    showWeek() { return this.currentWeek + this.weekOffset }
  },
  methods: {
    goToNextWeek() { this.weekOffset++ },
    goToPrevWeek() { this.weekOffset-- },
    goToThisWeek() { this.weekOffset = 0 },
    /* DEBUG */ goToSpecificWeek(nbr) { this.weekOffset = nbr - this.currentWeek}
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
