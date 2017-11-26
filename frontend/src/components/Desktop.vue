<template>
  <div id="Desktop">
    <div class="weekWrapper">
      <div class="weekContainer" v-for="thisWeek in weeksToShow">
        <h2 v-if="thisWeek.label">{{thisWeek.label}}</h2>
        <h2 v-else>Vecka {{thisWeek.week}}</h2>
        <week v-bind:year="thisWeek.year" v-bind:week="thisWeek.week" />
      </div>
    </div>
  </div>
</template>

<script>
import Week from '@/components/Week'
import moment from 'moment'

export default {
  name: 'Desktop',
  components: { Week },
  computed: {
    weeksToShow() {
      var o = []
      for ( var i = -1; i<10 ; i++ ) {
        o.push({
          week:moment().subtract(i, 'w').isoWeek(),
          year: moment().subtract(i, 'w').isoWeekYear(),
          label: i==0?'Denna vecka':i==-1?'Nasta vecka':undefined
        })
      }
      return o
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";

.weekWrapper {
  position: fixed;
  top: @bu*2;
  bottom: 0;
  left: 0;
  right:0;
  overflow: auto;
  .display(flex);
  padding: 0 @bu;

  .weekContainer {
    border-radius: @bu @bu 0 0;
    width: 430px;
    .flex-shrink(0);
    margin: 0 @bu;
    max-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background: fade(@colorBackground, 85%);

    h2 {
      padding: @bu @bu*2;
      background: @colorSecondary;
      color: @colorBackground;
      margin: 0;
    }
  }
}
</style>
