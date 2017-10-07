<template>
  <div id="home">
    <week-nav></week-nav>
    <week v-bind:year="year" v-bind:week="week"></week>
  </div>
</template>

<script>
import Week from '@/components/Week'
import WeekNav from '@/components/WeekNav'
import moment from 'moment'

export default {
  name: 'Home',
  components:{ WeekNav,Week },
  data() {
    return {
      year: this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear(),
      week: this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
    }
  },
  watch: {
    '$route' (to, from) {
      this.year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear(),
      this.week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
    }
  }
}
</script>

<style lang="less">
a { cursor: pointer; }
</style>
