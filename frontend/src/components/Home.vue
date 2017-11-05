<template>
  <div id="home">
    <div class="header">
      <h1 v-if="isThisWeek">Denna vecka</h1>
      <h1 v-else-if="isThisNextWeek">Nästa vecka</h1>
      <h1 v-else-if="isThisPrevWeek">Förra veckan</h1>
      <h1 v-else>Vecka {{week}}</h1>
      <week-nav></week-nav>
    </div>
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
    let year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear()
    let week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
    return {
      year: year,
      week: week,
      isThisWeek: moment().isoWeek() == week && moment().isoWeekYear() == year,
      isThisNextWeek: moment().add(1,'w').isoWeek() == week && moment().add(1,'w').isoWeekYear() == year,
      isThisPrevWeek: moment().subtract(1,'w').isoWeek() == week && moment().subtract(1,'w').isoWeekYear() == year
    }
  },
  watch: {
    '$route' (to, from) {
      this.year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear(),
      this.week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
      this.isThisWeek = moment().isoWeek() == this.week && moment().isoWeekYear() == this.year
      this.isThisNextWeek = moment().add(1,'w').isoWeek() == this.week && moment().add(1,'w').isoWeekYear() == this.year
      this.isThisPrevWeek = moment().subtract(1,'w').isoWeek() == this.week && moment().subtract(1,'w').isoWeekYear() == this.year
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";

#home {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  box-shadow: 0 0 0 1px @colorBorder;
  background: @colorBackground;
}
</style>
