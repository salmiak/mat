<template>
  <div>
      <add-meal v-bind:year="year" v-bind:week="week"/>
      <meal v-for="meal in nonMadeMeals" :key="meal.id" v-bind:mealId="meal.id"></meal>
      <meal v-for="meal in madeMeals" :key="meal.id" v-bind:mealId="meal.id"></meal>

      <div v-for="i in [1,2,3]" class="loadingPlaceholder" v-if="!madeMeals.length && !nonMadeMeals.length && isLoading"></div>

      <div v-if="!madeMeals.length && !nonMadeMeals.length && !isLoading" class="emptyListMessage">
        Inga planerade måltider
      </div>
  </div>
</template>

<script>
  import Meal from './Meal'
  import AddMeal from './AddMeal'
  export default {
    name: "Week",
    props: ['year','week'],
    components: { Meal,AddMeal },
    computed: {
      isLoading(){ return this.$store.getters.isLoading
      },
      madeMeals() { return this.$store.getters.mealsByWeek(this.year, this.week).filter(r => r.fields.made) },
      nonMadeMeals() { return this.$store.getters.mealsByWeek(this.year, this.week).filter(r => !r.fields.made) }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.emptyListMessage {
  padding: 12*@bu 0;
  text-align: center;
  .capitals;
  background-color: fade(@colorBody, 60%);
  color: @colorBody;
}
.loadingPlaceholder {
  height: @bu*13;
  background: @colorBackground;
  position: relative;
  .border-bottom;
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: @bu*2;
    left: @bu*2;
    width: 34%;
    height: @bu*2;
    background: @colorBorder;
  }
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: @bu*6;
    left: @bu*2;
    right: @bu*5;
    height: @bu*1.5;
    background: @colorBorder;
    box-shadow: 0 @bu*3 0 0 @colorBorder;
  }
}
</style>
