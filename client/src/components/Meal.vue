<template>
  <div class="meal">

    <swipe-action-item
      v-if="!editMode"
      :rightActions="2"
      :leftActions="2"
      @rightprimary="toggleMade"
      @rightsecondary="toNextWeek"
      @leftprimary="toggleEditMode"
      @leftsecondary="moveToPrevWeek">

      <span slot="rightprimary">
        <span v-if="meal.made">
          <i class="fal fa-square"></i> {{$t('Not made')}}
        </span>
        <span v-else>
          <i class="fal fa-check-square"></i> {{$t('Made')}}
        </span>
      </span>
      <span slot="rightsecondary">
        <span v-if="meal.made">
          <i class="fal fa-copy"></i> {{$t('Copy')}}
        </span>
        <span v-else>
          <i class="fal fa-arrow-right"></i> {{$t('Move')}}
        </span>
      </span>
      <span slot="leftprimary">
        <i class="fal fa-edit"></i> {{$t('Edit')}}
      </span>
      <span slot="leftsecondary">
        <i class="fal fa-arrow-left"></i> {{$t('Move')}}
      </span>

      <div class="mealContent">
        <div v-if="!meal.made">
          <h2><i class="fal fa-square"></i> {{meal.title}}</h2>

          <expander class="comment" v-if="meal.comment && meal.comment.length > 70">
            <vue-markdown>{{meal.comment}}</vue-markdown>
          </expander>
          <vue-markdown v-if="meal.comment && meal.comment.length <= 70" class="comment">{{meal.comment}}</vue-markdown>

          <recipe-content v-for="recipe in meal.recipes" :key="recipe" :id="recipe"></recipe-content>
        </div>

        <div v-if="meal.made">
          <h2>
            <i class="fal fa-check-square"></i>
            <span class="text-disabled">{{meal.title}}</span>
          </h2>
        </div>
      </div>
    </swipe-action-item>

    <div v-if="editMode" class="mealContent">
      <div class="toolbar">
        <sure-button @clicked="deleteMeal(meal._id)" type="i" class="fal fa-trash-alt"></sure-button>
      </div>
      <h2>{{$t('Edit meal')}}</h2>
      <edit-meal :mealData="meal" @save-meal="updateMeal" @cancel-edit="editMode = false"></edit-meal>
    </div>

  </div>
</template>

<i18n>
  {
    "en": {
      "Not made": "Not made",
      "Made": "Made",
      "Copy": "Copy",
      "Edit": "Edit",
      "Move": "Move",
      "toPrevWeek": "To prev. week",
      "toNextWeek": "To next week",
      "Edit meal": "Edit meal"
    },
    "se": {
      "Not made": "Ogjord",
      "Made": "Gjord",
      "Copy": "Kopiera",
      "Edit": "Redigera",
      "Move": "Flytta",
      "toPrevWeek": "Till förra veckan",
      "toNextWeek": "Till nästa vecka",
      "Edit meal": "Redigera måltid"
    }
  }
</i18n>

<script>
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep'
import {mapActions} from 'vuex'
import VueMarkdown from 'vue-markdown'
import RecipeContent from './RecipeContent'
import EditMeal from './EditMeal'
import SureButton from './SureButton'
import Expander from './Expander'
import SwipeActionItem from './SwipeActionItem'

export default {
  name: 'meal',
  props: ['meal'],
  components: {RecipeContent, EditMeal, SureButton, VueMarkdown, Expander, SwipeActionItem},
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
    toggleEditMode () {
      this.editMode = !this.editMode
    },
    moveToPrevWeek () {
      this.meal.date = moment(this.meal.date).add(-1, 'w').toDate()
      this.updateMeal(this.meal)
    },
    moveToNextWeek () {
      this.meal.date = moment(this.meal.date).add(1, 'w').toDate()
      this.updateMeal(this.meal)
    },
    copyToNextWeek () {
      var newMeal = cloneDeep(this.meal)
      newMeal.date = moment().add(1, 'w').startOf('isoWeek').toDate()
      newMeal.made = false
      this.$store.dispatch('meals/addMeal', newMeal)
    },
    toNextWeek () {
      if (this.meal.made) {
        // Copy to next week
        this.copyToNextWeek()
      } else {
        this.moveToNextWeek()
      }
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
  width: 95%;
  max-width: @bu * 25;
  overflow: hidden;
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
.mealContent {
  background: @cMealBg;
  padding: @bu;
  border-radius: @radius;
}
</style>
