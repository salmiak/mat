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
  a { cursor: pointer; }
  .weekNav {
    @borderRadius: 4px;
    display: inline-block;
    border: 1px solid @colorSecondary;
    border-radius: @borderRadius;
    width: auto;
    font-size: 0;
    margin-bottom: 4px;
    a {
      font-size: 1rem;
      display: inline-block;
      padding: 6px 16px;
      line-height: 0.8em;
      border-left: 1px solid @colorSecondary;
      color: @colorSecondary;
      &:first-child {
        border-left: none;
        border-radius: @borderRadius - 1 0 0 @borderRadius - 1;
      }
      &:last-child {
        border-radius: 0 @borderRadius - 1 @borderRadius - 1 0;
      }
      &:hover {
        background-color: fade(@colorSecondary, 12%);
      }
    }
  }
</style>
