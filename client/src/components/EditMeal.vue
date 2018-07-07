<template>
  <div class="editMeal">
    <div>
      <input type="text" name="title" placeholder="Title" v-model="mealData.title">
    </div>
    <div>
      <textarea placeholder="Comment" v-model="mealData.comment" @focus="expandTextarea = true" @blur="expandTextarea = (mealData.comment.length !== 0)" :class="{collapsed: !expandTextarea}"></textarea>
    </div>
    <div>
      <vue-fuse :placeholder="'Search recipe'" :list="recipeList" :keys="searchKeys" event-name="searchChanged" input-change-event-name="searchInputChanged" :defaultAll="false" :value="searchTerm"></vue-fuse>

      <ul v-if="recipeSearchResultsList.length">
         <li v-for="recipe in recipeSearchResultsList.slice(sliceStart,sliceEnd+1)" :key="recipe._id" @click="selectRecipe(recipe._id)">
           <div class="btn btn-sm pull-right">Add</div>
          {{recipe.title}}
        </li>
        <li v-if="sliceEnd < recipeSearchResultsList.length" class="text-center">
          <span class="btn btn-sm" @click="resultPage++">Show more</span>
        </li>
      </ul>
      <p v-if="searchTerm && recipeSearchResultsList.length === 0">
        No results
      </p>

      <h3>Selected recipes</h3>
      <ul v-if="selectedRecipes.length">
        <li v-for="recipe in selectedRecipes" :key="recipe._id">
          <span class="btn btn-sm pull-right" @click="removeRecipe(recipe._id)">Remove</span>
          {{recipe.title}}
        </li>
      </ul>
      <p v-if="selectedRecipes.length === 0" class="text-disabled">
        Search to add recipes to this meal.
      </p>
    </div>

    <div class="clear">
      <button class="btn-primary pull-right" @click="saveMeal">Save</button>
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
      recipeSearchResults: [],
      resultPage: 0,
      resultsPerPage: 5,
      expandTextarea: false
    }
  },
  created () {
    this.$on('searchChanged', results => {
      this.recipeSearchResults = results
    })
    this.$on('searchInputChanged', string => {
      this.searchTerm = string
      this.resultPage = 0
    })
  },
  computed: {
    sliceStart () { return this.resultPage * this.resultsPerPage },
    sliceEnd () { return (this.resultPage + 1) * this.resultsPerPage },
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
      return this.recipeSearchResults.filter(recipe => {
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
<style lang="less" scoped>
@import "../assets/global.less";
.editMeal {
  padding: @bu/2 0 0;
  h3 {
    margin: @bu 0 @bu/2;
  }
  p {
    margin: 0 0 @bu/2;
  }
  textarea{
    height: 8rem;
    transition: height .3s;
    &.collapsed {
      height: calc(2.5em + 2px);
    }
  }
  ul {
    margin: 0 -@bu/2 @bu/2;
  }
  li {
    padding: @bu/2 @bu/2;
    border-radius: @radius;
    clear: both;
    &:first-child {
      padding-top: 0;
    }
    &:nth-child(2n) {
      background: lighten(@cMealBg, 3%);
    }
  }
}
</style>
