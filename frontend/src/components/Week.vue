<template>
  <div>
    <h1>Vecka {{week}}</h1>
    <p>
      Lägg till måltid
    </p>
    <meal v-for="meal in meals" :key="meal.id" v-bind:mealId="meal.id"></meal>
  </div>
</template>

<script>
  import Meal from './Meal'
  export default {
    name: "Week",
    props: ['year','week'],
    components: { Meal },
    computed: {
      meals() {return this.$store.getters.mealsByWeek(this.year, this.week)}
    }
  }
</script>
