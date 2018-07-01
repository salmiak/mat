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
  background: #FFF;
  padding: 0 16px 16px;
  border: 1px solid #EEE;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  margin: 12px auto;
  text-align: left;
}
</style>
