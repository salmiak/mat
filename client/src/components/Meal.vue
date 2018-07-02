<template>
  <div class="meal" :class="{made: meal.made}">
    <div v-if="!editMode && !meal.made">
      <h2>{{meal.title}}</h2>
      <p>
        {{meal.comment}}
      </p>
      <recipe v-for="recipe in meal.recipes" :key="recipe" :id="recipe"></recipe>
      <button @click="editMode = true">Edit</button>
      <button @click="deleteMeal(meal._id)">Delete</button>
      <button @click="moveToPrevWeek">Move to previous week</button>
      <button @click="moveToNextWeek">Move to next week</button>
      <button @click="toggleMade">Mark as made</button>
    </div>
    <div v-if="!editMode && meal.made">
      <h2>{{meal.title}}</h2>
      <button @click="toggleMade">Mark as not made</button>
    </div>
    <edit-meal v-if="editMode" :mealData="meal" @save-meal="updateMeal"></edit-meal>
  </div>
</template>

<script>
import moment from 'moment'
import {mapActions} from 'vuex'
import MealsService from '@/services/MealsService'
import Recipe from './Recipe'
import EditMeal from './EditMeal'

export default {
  name: 'meal',
  props: ['meal'],
  components: {Recipe, EditMeal},
  data () {
    return {
      editMode: false
    }
  },
  methods: {
    ...mapActions('meals', {
      deleteMeal: 'deleteMeal'
    }),
    async updateMeal (meal) {
      await MealsService.updateMeal(meal)
      this.editMode = false
    },
    moveToPrevWeek () {
      this.meal.date = moment(this.meal.date).add(-1, 'w').toDate()
      this.updateMeal(this.meal)
    },
    moveToNextWeek () {
      this.meal.date = moment(this.meal.date).add(1, 'w').toDate()
      this.updateMeal(this.meal)
    },
    toggleMade () {
      this.meal.made = !this.meal.made
      this.updateMeal(this.meal)
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
.meal.made {
  color: #9AA;
  text-decoration: line-through;
}
</style>
