<template>
  <div>
    <p>
      Welcome {{userName}}
    </p>
    <h1>Week {{week}} in {{year}}</h1>

    <router-link :to="{ name: 'Week', params: { week: prevWeek.week, year:prevWeek.year }}">Prev week</router-link> |
    <router-link to="/week">Today</router-link> |
    <router-link :to="{ name: 'Week', params: { week: nextWeek.week, year:nextWeek.year }}">Next week</router-link>

    <new-meal :week="week" :year="year"></new-meal>

    <meal v-for="meal in mealsInCurrentWeek" :key="meal.id" :meal="meal"></meal>
  </div>
</template>

<script>
import moment from 'moment'
import auth from '../auth'
import Meal from './Meal'
import NewMeal from './NewMeal'

export default {
  name: 'week',
  components: { Meal, NewMeal },
  mounted () {
    this.loadMealsInWeek(this.currentWeek)
    this.loadMealsInWeek(this.prevWeek)
    this.loadMealsInWeek(this.nextWeek)
  },
  computed: {
    userName () {
      return auth.getName()
    },
    week () {
      return parseInt(this.$route.params.week) || moment().isoWeek()
    },
    year () {
      return parseInt(this.$route.params.year) || moment().isoWeekYear()
    },
    currentWeek () {
      return {
        week: this.week,
        year: this.year
      }
    },
    nextWeek () {
      var m = moment().isoWeekYear(this.year).isoWeek(this.week).startOf('isoWeek').add(1, 'w')
      return {
        week: m.isoWeek(),
        year: m.isoWeekYear()
      }
    },
    prevWeek () {
      var m = moment().isoWeekYear(this.year).isoWeek(this.week).startOf('isoWeek').add(-1, 'w')
      return {
        week: m.isoWeek(),
        year: m.isoWeekYear()
      }
    },
    mealsInCurrentWeek () {
      return this.$store.getters['meals/mealsInWeek'](this.currentWeek)
    }
  },
  watch: {
    week () {
      this.loadMealsInWeek(this.currentWeek)
      this.loadMealsInWeek(this.prevWeek)
      this.loadMealsInWeek(this.nextWeek)
    }
  },
  methods: {
    loadMealsInWeek (query) {
      this.$store.dispatch('meals/loadMealsInWeek', query)
    }
  }
}
</script>
