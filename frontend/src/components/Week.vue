<template>
  <div>
    <add-meal v-bind:year="year" v-bind:week="week"/>
    <meal v-for="meal in meals" :key="meal.id" v-bind:mealId="meal.id"></meal>
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
      meals() {return this.$store.getters.mealsByWeek(this.year, this.week)}
    }
  }
</script>
