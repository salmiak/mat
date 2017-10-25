<template>
  <div class="meal" v-bind:class="editMode?'meal-edit':''">
    <form v-if="editMode">
      <div class="closeIcon" @click="toggleEditMode()">
        <icon name="times"></icon>
      </div>

      <h2>
        Redigera måltid
      </h2>
      <input v-model="mealData.title" placeholder="Namn"/>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      <multiselect placeholder="Recept" v-model="selectedRecipes" trackBy="id" label="title" :options="recipes" :multiple="true"></multiselect>
      <p class="saveBtnContainer">
        <span class="btn" @click="toggleEditMode()">Stäng</span>
        <span class="btn btn-red" @click="deleteMeal()">Ta bort</span>
        <span class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
      </p>
    </form>

    <swipe-action-item
      v-if="!editMode"
      v-on:rightprimary="toggleMade"
      v-on:rightsecondary="toNextWeek"
      v-on:leftprimary="toggleEditMode"
      v-on:leftsecondary="moveToPrevWeek">

      <span slot="rightprimary">
        <span v-if="mealData.fields.made">
          <icon name="square-o"></icon> Ogjord
        </span>
        <span v-else>
          <icon name="check-square-o"></icon> Gjord
        </span>
      </span>
      <span slot="rightsecondary">
        <span v-if="mealData.fields.made">
          <icon name="copy"></icon> Kopiera
        </span>
        <span v-else>
          <icon name="arrow-right"></icon> Flytta
        </span>
      </span>
      <span slot="leftprimary"><icon name="edit"></icon> Redigera</span>
      <span slot="leftsecondary"><icon name="arrow-left"></icon> Flytta</span>

      <div class="mealContent">
        <h2 v-bind:class="mealData.fields.made?'made':''">
          {{mealData.title}}
          <span v-if="createdMeal" class="createdNotification">Ny måltid skapad!</span>
        </h2>
        <p v-html="mealData.fields.comment" v-if="mealData.fields.comment"></p>
        <div class="recipeList" v-if="verifiedRecipes.length">
          <recipe v-for="recipe in verifiedRecipes" :key="recipe" v-bind:recipeId="recipe" v-bind:hideCreateMeal="true" v-bind:hideEdit="true"></recipe>
        </div>
      </div>
    </swipe-action-item>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import moment from 'moment'
  import chroma from 'chroma-js'
  import Multiselect from 'vue-multiselect'
  import Recipe from './Recipe'
  import SwipeActionItem from './SwipeActionItem'

  export default {
    name: "Meal",
    components: { Recipe,Multiselect,SwipeActionItem },
    props: ['mealId'],
    data() {
      return {
        mealData: this.$store.getters.mealById(this.mealId),
        editMode: false,
        createdMeal: false
      }
    },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      }),
      selectedRecipes: {
        get() {
          return this.mealData.fields.recipes.map(id => this.$store.getters.recipeById(id))
        },
        set(newValue) {
          this.mealData.fields.recipes = newValue.map(recipe => recipe.id)
        }
      },
      verifiedRecipes() {
        return this.mealData.fields.recipes && this.mealData.fields.recipes.filter(id => this.$store.getters.verifyRecipe(id))
      }
    },
    methods: {
      toggleEditMode() {
        this.editMode = !this.editMode
      },
      toggleMade() {
        this.mealData.fields.made = !this.mealData.fields.made
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
      },
      saveMeal() {
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
        this.editMode = false
      },
      deleteMeal() {
        this.$store.dispatch('deleteMeal', {id: this.mealData.id})
      },
      moveToPrevWeek() {
        if(this.mealData.fields.date){
          this.mealData.fields.date = moment(this.mealData.fields.date).subtract(1, 'w')
        }
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
      },
      moveToNextWeek() {
        if(this.mealData.fields.date){
          this.mealData.fields.date = moment(this.mealData.fields.date).add(1, 'w')
        }
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
      },
      copyToCurrentNextWeek() {
        var mealClone = JSON.parse(JSON.stringify(this.mealData))
        delete mealClone.id
        delete mealClone.fields.made
        delete mealClone.date
        mealClone.fields.date = moment().isoWeekYear( this.$store.getters.currentYear ).isoWeek( this.$store.getters.currentWeek ).add(1, 'w')
        this.$store.dispatch('updateMeal',{payload: mealClone})
        this.createdMeal = true
        var _this = this
        setTimeout(() => _this.createdMeal = false, 4000)
      },
      toNextWeek() {
        if (this.mealData.fields.made) {
          this.copyToCurrentNextWeek()
        } else {
          this.moveToNextWeek()
        }
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  position: relative;
  overflow: hidden;

  &-edit {
    padding: @bu @bu*2;
  }
  .saveBtnContainer {
    padding: @bu 0;
    .btn-red {
      background: #F35;
    }
  }
  .mealContent {
    padding: @bu*1.5 @bu*2;
    min-height: @bu*9;
    position: relative;
    z-index: 100;
    background: @colorBackground;
    .border-bottom;
  }
}

h2.made {
  text-decoration: line-through;
}

.recipeList {
  margin: @bu 0 0;
}
</style>
