<template>
  <div class="editMeal">
    <div>
      <input type="text" name="title" placeholder="TITLE" v-model="mealData.title">
    </div>
    <div>
      <textarea rows="15" cols="15" placeholder="COMMENT" v-model="mealData.comment"></textarea>
    </div>

    <div>
      <vue-fuse :placeholder="'Search recipe'" :list="recipeList" :keys="searchKeys" event-name="searchChanged" input-change-event-name="searchInputChanged" :defaultAll="false" :value="searchTerm"></vue-fuse>

      <ul v-if="recipeSearchResultsList.length">
         <li v-for="recipe in recipeSearchResultsList" :key="recipe._id" @click="selectRecipe(recipe._id)">
          {{recipe.title}} <span>Add</span>
        </li>
      </ul>
      <p v-if="!searchTerm && recipeSearchResultsList.length === 0">
        Type to search
      </p>
      <p v-if="searchTerm && recipeSearchResultsList.length === 0">
        No results
      </p>

      <h2>Selected recipes</h2>
      <ul v-if="selectedRecipes.length">
        <li v-for="recipe in selectedRecipes" :key="recipe._id">
          {{recipe.title}} <span @click="removeRecipe(recipe._id)">Remove</span>
        </li>
      </ul>
      <p v-if="selectedRecipes.length === 0">
        No recipe selected
      </p>

    </div>

    <div>
      <button class="app_meal_btn" @click="saveMeal">Save</button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'EditMeal',
  props: ['week', 'year', 'mealData'],
  data () {
    return {
      searchKeys: ['title', 'comment'],
      searchTerm: '',
      recipeSearchResults: undefined
    }
  },
  created () {
    this.$on('searchChanged', results => {
      this.recipeSearchResults = results
    })
    this.$on('searchInputChanged', string => {
      this.searchTerm = string
    })
  },
  computed: {
    recipeList () {
      var list = _.map(this.$store.getters['recipes/recipeList'], (recipe) => {
        return {
          _id: recipe._id,
          title: recipe.title,
          selected: (this.mealData.recipes.indexOf(recipe._id) !== -1)
        }
      })
      return list
    },
    recipeSearchResultsList () {
      return _.filter(this.recipeSearchResults, recipe => {
        return this.mealData.recipes.indexOf(recipe._id) === -1
      })
    },
    selectedRecipes () {
      return _.filter(this.recipeList, {selected: true})
    },
    date () {
      if (this.mealData.date) {
        return this.mealData.date
      } else if (this.week && this.year) {
        return moment().isoWeek(this.week).isoWeekYear(this.year).startOf('isoWeek').toDate()
      } else {
        return moment().startOf('isoWeek').toDate()
      }
    }
  },
  methods: {
    selectRecipe (id) {
      this.mealData.recipes.push(id)
    },
    removeRecipe (id) {
      this.mealData.recipes.splice(this.mealData.recipes.indexOf(id), 1)
    },
    saveMeal () {
      this.mealData.date = this.date
      this.$emit('save-meal', this.mealData)
    }
  }
}
</script>
<style type="text/css">
.editMeal input, .editMeal textarea {
  width: 90%;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
  margin: 0 0 4px;
}
.form div {
  margin: 20px;
}
.app_meal_btn {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  width: 90%;
  margin: 0 auto;
  display: block;
  border: none;
  cursor: pointer;
}
</style>
