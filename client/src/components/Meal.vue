<template>
  <div class="meal" :class="{made: meal.made}">
    <div v-if="!editMode && !meal.made">
      <div class="toolbar">
        <i class="fal fa-pen" @click="editMode = true"></i>
        <i class="fal fa-trash-alt" @click="deleteMeal(meal._id)"></i>
      </div>
      <h2 @click="toggleMade"><i class="fal fa-square"></i> {{meal.title}}</h2>
      <p v-if="meal.comment">
        {{meal.comment}}
      </p>
      <recipe v-for="recipe in meal.recipes" :key="recipe" :id="recipe"></recipe>
      <span class="btn" @click="moveToPrevWeek"><i class="fal fa-arrow-left"></i> To prev. week</span>
      <span class="btn pull-right" @click="moveToNextWeek">To next week <i class="fal fa-arrow-right"></i></span>
    </div>
    <div v-if="!editMode && meal.made">
      <h2 @click="toggleMade"><i class="fal fa-check-square"></i> {{meal.title}}</h2>
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
  position: relative;
  background: @cMealBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  &.made {
    color: fade(@cText, 50%);
    padding-bottom: @bu/1.5;
    // text-decoration: line-through;
  }
  h2 {
    padding-right: calc(5rem);
    margin: 0 0 @bu/2;
    .noselect;
  }
  h2:last-child {
    margin-bottom: 0;
  }
  .toolbar {
    .noselect;
    position: absolute;
    top: 0;
    right: @bu/2;
    .fal {
      padding: @bu @bu/2;
      cursor: pointer;
    }
  }
}
</style>
