<template>
  <div class="week">
    <header>
      <router-link class="weekNav" :to="{ name: 'Week', params: { week: prevWeek.week, year:prevWeek.year }}"><i class="fa fa-arrow-left"></i></router-link>
      <h1>
        <router-link v-if="!isCurrentWeek" to="/week">{{ $t("Week") }} {{week}}</router-link>
        <router-link v-if="isCurrentWeek" :to="'/week/'+year+'/'+(week+1)">{{ $t('This week') }}</router-link>
      </h1>
      <router-link class="weekNav" :to="{ name: 'Week', params: { week: nextWeek.week, year:nextWeek.year }}"><i class="fa fa-arrow-right"></i></router-link>
    </header>

    <new-meal :week="week" :year="year"></new-meal>

    <meal v-for="meal in mealsInCurrentWeek" :key="meal._id" :meal="meal"></meal>
  </div>
</template>

<i18n>
{
  "en": {
    "Week": "Week",
    "This week": "This week"
  },
  "se": {
    "Week": "Vecka",
    "This week": "Denna vecka"
  }
}
</i18n>

<script>
// import MealsService from '@/services/MealsService'
import orderBy from 'lodash/orderBy'
import moment from 'moment'
import Meal from './Meal'
import NewMeal from './NewMeal'

export default {
  name: 'week',
  metaInfo () {
    return {
      title: 'Planning Week ' + this.week
    }
  },
  components: { Meal, NewMeal },
  mounted () {
    this.loadMealsInWeek(this.currentWeek)
    this.loadMealsInWeek(this.prevWeek)
    this.loadMealsInWeek(this.nextWeek)
    this.$store.dispatch('recipes/loadRecipeList')
  },
  computed: {
    isCurrentWeek () {
      return (this.week === moment().isoWeek() && this.year === moment().isoWeekYear())
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
      return orderBy(this.$store.getters['meals/mealsInWeek'](this.currentWeek), 'made', 'asc')
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

<style lang="less" scoped>
@import "../assets/global.less";
header {
  a.weekNav {
    width: 3rem;
    line-height: 3rem;
    text-align: center;
  }
}
</style>
