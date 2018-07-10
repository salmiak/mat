<template>
  <div class="meal">
    <div v-if="!editMode && !meal.made">
      <div class="toolbar">
        <i class="fal fa-pen" @click="editMode = true"></i>
        <sure-button @clicked="deleteMeal(meal._id)" type="i" class="fal fa-trash-alt"></sure-button>
      </div>
      <h2 @click="toggleMade"><i class="fal fa-square"></i> {{meal.title}}</h2>
      <div class="comment" v-if="meal.comment">
        <vue-markdown>{{meal.comment}}</vue-markdown>
      </div>
      <recipe v-for="recipe in meal.recipes" :key="recipe" :id="recipe"></recipe>
      <span class="btn" @click="moveToPrevWeek"><i class="fal fa-arrow-left"></i> {{ $t('toPrevWeek') }}</span>
      <span class="btn pull-right" @click="moveToNextWeek">{{ $t('toNextWeek') }} <i class="fal fa-arrow-right"></i></span>
    </div>
    <div v-if="!editMode && meal.made">
      <h2 @click="toggleMade"><i class="fal fa-check-square"></i> <span class="text-disabled">{{meal.title}}</span></h2>
    </div>
    <edit-meal v-if="editMode" :mealData="meal" @save-meal="updateMeal" @cancel-edit="editMode = false"></edit-meal>
  </div>
</template>

<i18n>
  {
    "en": {
      "toPrevWeek": "To prev. week",
      "toNextWeek": "To next week"
    },
    "se": {
      "toPrevWeek": "Till förra veckan",
      "toNextWeek": "Till nästa vecka"
    }
  }
</i18n>

<script>
import moment from 'moment'
import {mapActions} from 'vuex'
import VueMarkdown from 'vue-markdown'
import Recipe from './Recipe'
import EditMeal from './EditMeal'
import SureButton from './SureButton'

export default {
  name: 'meal',
  props: ['meal'],
  components: {Recipe, EditMeal, SureButton, VueMarkdown},
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
      await this.$store.dispatch('meals/updateMeal', meal)
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
  h2 {
    padding-right: calc(5rem);
    margin: 0 0 @bu/2;
    .noselect;
    .fal {
      color:@cText;
    }
  }
  h2:last-child {
    margin-bottom: 0;
  }
}
</style>
