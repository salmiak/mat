<template>
  <div>
    <div v-if="isLoading" class="loading">
      <p><icon name="refresh" scale="1" spin></icon></p>
      <p>Laddar</p>
    </div>
    <div v-else>
      <add-meal v-bind:year="year" v-bind:week="week"/>
      <meal v-for="meal in nonMadeMeals" :key="meal.id" v-bind:mealId="meal.id"></meal>
      <meal v-for="meal in madeMeals" :key="meal.id" v-bind:mealId="meal.id"></meal>
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
      isLoading(){ return this.$store.getters.isLoading },
      madeMeals() { return this.$store.getters.mealsByWeek(this.year, this.week).filter(r => r.fields.made) },
      nonMadeMeals() { return this.$store.getters.mealsByWeek(this.year, this.week).filter(r => !r.fields.made) }
    }
  }
</script>
