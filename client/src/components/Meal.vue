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

<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  background: @cMealBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  &.made {
    color: fade(@cText, 50%);
    text-decoration: line-through;
  }
}
</style>
