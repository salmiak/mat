<template>
  <div class="meals">
    <h1>Meals</h1>
    <div v-if="meals.length > 0" class="table-wrap">
      <div>
        <router-link v-bind:to="{ name: 'NewMeal' }" class="">Add Meal</router-link>
      </div>
      <table>
        <tr>
          <td>Made</td>
          <td>Date</td>
          <td>Title</td>
          <td width="550">Comment</td>
          <td width="100" align="center">Action</td>
        </tr>
        <tr v-for="meal in meals" :key="meal._id" :class="{made:meal.made}">
          <td><input type="checkbox" disabled v-model="meal.made" /></td>
          <td>{{ meal.date }}</td>
          <td>{{ meal.title }}</td>
          <td>{{ meal.comment }}</td>
          <td align="center">
            <router-link v-bind:to="{ name: 'EditMeal', params: { id: meal._id } }">Edit</router-link> |
            <a href="#" @click="deleteMeal(meal._id)">Delete</a>
          </td>
        </tr>
      </table>
    </div>
    <div v-else>
      There are no meals.. Lets add one now <br /><br />
      <router-link v-bind:to="{ name: 'NewMeal' }" class="add_meal_link">Add Meal</router-link>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'meals',
  computed: {
    ...mapState('meals', {
      meals: 'list'
    })
  },
  mounted () {
    this.$store.dispatch('meals/loadMealList')
  },
  methods: {
    ...mapActions('meals', {
      deleteMeal: 'deleteMeal'
    })
  }
}
</script>
<style type="text/css">

</style>
