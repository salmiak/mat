<template>
  <div class="meal">
    <div v-if="!editMode">
      <h2>{{meal.title}}</h2>
      <p>
        {{meal.comment}}
      </p>
      <ul>
        <li v-for="recipe in meal.recipes" :key="recipe">
          {{recipe}}
        </li>
      </ul>
      <button @click="editMode = true">Edit</button>
    </div>
    <div v-if="editMode">
      <input type="text" v-model="meal.title" />
      <textarea v-model="meal.comment"></textarea>
      <input type="text" v-model="meal.recipes" />
      <button @click="updateMeal()">Save</button>
    </div>
  </div>
</template>

<script>
import MealsService from '@/services/MealsService'

export default {
  name: 'meal',
  props: ['meal'],
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
