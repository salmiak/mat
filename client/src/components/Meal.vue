<template>
  <div class="meal">
    <div v-if="!editMode">
      <h2>{{meal.title}}</h2>
      <p>
        {{meal.comment}}
      </p>
      <recipe v-for="recipe in meal.recipes" :key="recipe" :id="recipe"></recipe>
      <button @click="editMode = true">Edit</button>
    </div>
    <div v-if="editMode">
      <input type="text" v-model="meal.title" />
      <textarea v-model="meal.comment"></textarea>
      <!-- <input type="text" v-model="meal.recipes" /> 5b2e10051ee55c6720327bb6, 5b2e106826cf2567256dfc53-->
      <button @click="updateMeal()">Save</button>
    </div>
  </div>
</template>

<script>
import MealsService from '@/services/MealsService'
import Recipe from './Recipe'

export default {
  name: 'meal',
  props: ['meal'],
  components: {Recipe},
  data () {
    return {
      editMode: false
    }
  },
  methods: {
    async updateMeal () {
      await MealsService.updateMeal(this.meal)
      this.editMode = false
    }
  }
}
</script>

<style>
.meal {
  padding: 12px 0;
  border-bottom: 1px solid #DDD;
}
</style>
