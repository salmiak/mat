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

@height: @bu*3.5;

  .weekNav {
    top: @bu*1.25;
    right: @bu*2;
    height: @height;
    position: absolute;
    display: block;
    border: 1px solid @colorSecondary;
    border-radius: @bu/2;
    width: auto;
    font-size: 0;
    overflow: hidden;
    margin: 0;
    a {
      font-size: 14px;
      width: @bu*4.5;
      float: left;
      padding: 0 @bu*1.25;
      height: @height;
      border-left: 1px solid @colorSecondary;
      color: @colorSecondary;
      box-sizing: border-box;
      .centerContent;
      &:first-child {
        border-left: none;
      }
      > svg {
        top: -1px;
        position: relative;
      }
    }
  }
</style>
