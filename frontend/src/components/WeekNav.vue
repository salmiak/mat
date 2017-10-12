<template>
  <div class="weekNav">
    <a @click="goToPrevWeek()"><icon name="arrow-left"></icon></a>
    <router-link to="/"><icon name="calendar-o"></icon></router-link>
    <a @click="goToNextWeek()"><icon name="arrow-right"></icon></a>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'weekNav',
  data() {
    let week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
    let year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear()
    let nextWeek = moment().isoWeek(week).isoWeekYear(year).add(1,'w');
    let prevWeek = moment().isoWeek(week).isoWeekYear(year).subtract(1,'w');

    return {
      year: year,
      week: week,
      nextWeek:{
        week: nextWeek.isoWeek(),
        year: nextWeek.isoWeekYear()
      },
      prevWeek:{
        week: prevWeek.isoWeek(),
        year: prevWeek.isoWeekYear()
      }
    }
  },
  watch: {
    '$route' (to, from) {
      let week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
      let year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear()
      let nextWeek = moment().isoWeek(week).isoWeekYear(year).add(1,'w');
      let prevWeek = moment().isoWeek(week).isoWeekYear(year).subtract(1,'w');

      this.year =  year,
      this.week =  week,
      this.nextWeek = {
        week: nextWeek.isoWeek(),
        year: nextWeek.isoWeekYear()
      },
      this.prevWeek = {
        week: prevWeek.isoWeek(),
        year: prevWeek.isoWeekYear()
      }
    }
  },
  methods: {
    goToPrevWeek() { this.$router.push( '/week/'+this.prevWeek.year+'/'+this.prevWeek.week ) },
    goToNextWeek() { this.$router.push( '/week/'+this.nextWeek.year+'/'+this.nextWeek.week  ) }
  }
}
</script>

<style lang="less">
@import "../assets/global.less";

  .weekNav {
      display: inline-block;
      border: 1px solid @colorSecondary;
      border-radius: @bu/2;
      width: auto;
      font-size: 0;
      overflow: hidden;
      margin: @bu @bu*2;
      a {
        font-size: @fu;
        display: inline-block;
        padding: 0 @bu*2;
        line-height: @bu*4;
        border-left: 1px solid @colorSecondary;
        color: @colorSecondary;
        &:first-child {
          border-left: none;
        }
        &.router-link-active {
          background-color: @colorSecondary;
          color: @colorBackground;
        }
      }
  }
</style>
