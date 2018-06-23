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
import MealsService from '@/services/MealsService'
export default {
  name: 'meals',
  data () {
    return {
      meals: []
    }
  },
  mounted () {
    this.getMeals()
  },
  methods: {
    async getMeals () {
      const response = await MealsService.fetchMeals()
      this.meals = response.data.meals
    },
    async deleteMeal (id) {
      await MealsService.deleteMeal(id)
      this.getMeals()
    }
  }
}
</script>
<style type="text/css">
.table-wrap {
  width: 90%;
  margin: 0 auto;
  text-align: center;
}
table th, table tr {
  text-align: left;
}
table thead {
  background: #f2f2f2;
}
table tr td {
  padding: 10px;
}
table tr:nth-child(odd) {
  background: #f2f2f2;
}
table tr:nth-child(1) {
  background: #4d7ef7;
  color: #fff;
}
table tr.made {
  text-decoration: line-through;
}
a {
  color: #4d7ef7;
  text-decoration: none;
}
a.add_meal_link {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}
</style>
