<template>
  <div>
    <h1>Week {{number}}</h1>
    <p>
      Add meal
    </p>
    <div v-for="meal in meals" @key="meal.id">{{meal.id}}</div>
  </div>
</template>

<script>
  export default {
    name: "Week",
    props: ['number'],
    data() {
      return {
        meals: [{id: 0}]
      }
    }
  }
</script>
