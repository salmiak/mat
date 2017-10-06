<template>
  <div>
    <h1>Vecka {{number}}</h1>
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
    props: ['number'],
    components: { Meal },
    computed: {
      meals() {return this.$store.getters.mealsByWeek(this.number)}
    }
  }
</script>
