<template>
  <div>
    <h1>Week {{week}} in {{year}}</h1>

    <router-link :to="{ name: 'Week', params: { week: prevWeek.week, year:prevWeek.year }}">Prev week</router-link>
    <router-link to="/week">Today</router-link>
    <router-link :to="{ name: 'Week', params: { week: nextWeek.week, year:nextWeek.year }}">Next week</router-link>

    <new-meal :week="week" :year="year"></new-meal>

    <meal v-for="meal in meals" :key="meal.id" :meal="meal"></meal>
  </div>
</template>

<script>
import MealsService from '@/services/MealsService'
import moment from 'moment'
import Meal from './Meal'
import NewMeal from './NewMeal'

export default {
  name: 'week',
  components: { Meal, NewMeal },
  data () {
    return {
      meals: []
    }
  },
  mounted () {
    this.getMealsInWeek()
  },
  computed: {
    week () {
      return this.$route.params.week || moment().isoWeek()
    },
    year () {
      return this.$route.params.year || moment().isoWeekYear()
    },
    nextWeek () {
      var m = moment().isoWeekYear(this.year).isoWeek(this.week).startOf('isoWeek').add(1, 'w')
      return {
        m: m,
        week: m.isoWeek(),
        year: m.isoWeekYear()
      }
    },
    prevWeek () {
      var m = moment().isoWeekYear(this.year).isoWeek(this.week).startOf('isoWeek').add(-1, 'w')
      return {
        m: m,
        week: m.isoWeek(),
        year: m.isoWeekYear()
      }
    }
  },
  watch: {
    week () {
      this.getMealsInWeek()
    }
  },
  methods: {
    async getMealsInWeek () {
      this.query = {
        week: this.week,
        year: this.year
      }
      const response = await MealsService.fetchMealsInWeek(this.query)
      this.meals = response.data.meals
    }
  }
}
</script>
