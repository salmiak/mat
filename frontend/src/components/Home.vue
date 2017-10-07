<template>
  <div id="home">
    <a @click="goToPrevWeek()"><icon name="arrow-left"></icon></a>
    <router-link to="/"><icon name="calendar-o"></icon></router-link>
    <a @click="goToNextWeek()"><icon name="arrow-right"></icon></a>
    <week v-bind:number="week"></week>
  </div>
</template>

<script>
import RecipeList from '@/components/RecipeList'
import Week from '@/components/Week'

// Calculate week of year: https://stackoverflow.com/questions/7765767/show-week-number-with-javascript
Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()) / 7);
}

export default {
  name: 'Home',
  components:{ RecipeList,Week },
  data() {
    let week = parseInt(this.$route.params.week) || (new Date()).getWeek()
    return {
      week: week,
      nextWeek: week + 1,
      prevWeek: week - 1
    }
  },
  watch: {
    '$route' (to, from) {
      let week = parseInt(this.$route.params.week) || (new Date()).getWeek()
      this.week = week
      this.nextWeek = this.week + 1,
      this.prevWeek = this.week - 1
    }
  },
  methods: {
    goToPrevWeek() { this.$router.push( '/week/'+(this.prevWeek) ) },
    goToNextWeek() { this.$router.push( '/week/'+(this.nextWeek) ) }
  }
}
</script>

<style lang="less">
a { cursor: pointer; }
</style>
