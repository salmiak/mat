<template>
  <div class="weekNav">
    <a @click="goToPrevWeek()"><icon name="arrow-left"></icon></a>
    <a v-if="isCurrentWeek" @click="goToCurrentNextWeek()"><icon name="calendar" ></icon></a>
    <a v-else @click="goToCurrentWeek()"><icon name="calendar-o" ></icon></a>
    <a @click="goToNextWeek()"><icon name="arrow-right"></icon></a>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'weekNav',
  data: function() {
    var week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
    var year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear()
    var nextWeek = moment().isoWeek(week).isoWeekYear(year).add(1,'w');
    var prevWeek = moment().isoWeek(week).isoWeekYear(year).subtract(1,'w');

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
      var week = this.$route.params.week ? parseInt(this.$route.params.week) : moment().isoWeek()
      var year = this.$route.params.year ? parseInt(this.$route.params.year) :  moment().isoWeekYear()
      var nextWeek = moment().isoWeek(week).isoWeekYear(year).add(1,'w');
      var prevWeek = moment().isoWeek(week).isoWeekYear(year).subtract(1,'w');

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
  computed: {
    isCurrentWeek: function() {
      return this.year == this.$store.getters.currentYear && this.week == this.$store.getters.currentWeek;
    }
  },
  methods: {
    goToPrevWeek: function() { this.$router.push( '/week/'+this.prevWeek.year+'/'+this.prevWeek.week ) },
    goToNextWeek: function() { this.$router.push( '/week/'+this.nextWeek.year+'/'+this.nextWeek.week  ) },
    goToCurrentWeek: function() { this.$router.push('/') },
    goToCurrentNextWeek: function() {
      var year = moment().add(1,'w').isoWeekYear()
      var week = moment().add(1,'w').isoWeek()
      this.$router.push( '/week/'+year+'/'+week  ) }
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
