<template>
  <div class="editMeal">
    <div>
      <input type="text" name="title" :placeholder="$t('Title')" v-model="meal.title">
    </div>
    <div>
      <textarea :placeholder="$t('Comment')" v-model="meal.comment" @focus="expandTextarea = true" @blur="expandTextarea = (meal.comment.length !== 0)" :class="{collapsed: !expandTextarea}"></textarea>
    </div>
    <div>
      <input type="search" v-model="recipeSearchTerm" :placeholder="$t('Type to search')" />

      <ul v-if="recipeResultsNotSelected.length">
         <li v-for="recipe in recipeResultsNotSelected.slice(sliceStart,sliceEnd+1)" :key="recipe._id" @click="selectRecipe(recipe._id)">
           <div class="btn btn-sm pull-right">{{$t('Add')}}</div>
          {{recipe.title}}
        </li>
        <li v-if="sliceEnd < recipeResultsNotSelected.length" class="text-center">
          <span class="btn btn-sm" @click="resultPage++">{{$t('Show more')}}</span>
        </li>
      </ul>
      <p v-if="recipeSearchTerm && recipeResultsNotSelected.length === 0">
        {{$t('No results')}}
      </p>

      <h3>{{$t('Selected recipes')}}</h3>
      <ul v-if="selectedRecipes.length">
        <li v-for="recipe in selectedRecipes" :key="recipe._id">
          <span class="btn btn-sm pull-right" @click="removeRecipe(recipe._id)">{{$t('Remove')}}</span>
          {{recipe.title}}
        </li>
      </ul>
      <p v-if="selectedRecipes.length === 0" class="text-disabled">
        {{$t('searchEmptyMsg')}}
      </p>
    </div>

    <div class="clear">
      <button @click="cancelEdit">{{$t('Cancel')}}</button>
      <button class="btn-primary pull-right" @click="saveMeal">{{$t('Save')}}</button>
    </div>
  </div>
</template>

<i18n>
  {
    "en": {
      "Show more": "Show more",
      "No results": "No results",
      "Selected recipes": "Selected recipes",
      "searchEmptyMsg": "Search to add recipes to this meal.",
      "Add": "Add",
      "Remove": "Remove"
    },
    "se": {
      "Show more": "Visa fler",
      "No results": "Inga träffar",
      "Selected recipes": "Valda recept",
      "searchEmptyMsg": "Sök recept att lägga till denna måltid",
      "Add": "Lägg till",
      "Remove": "Ta bort"
    }
  }
</i18n>

<script>
import _ from 'lodash'
import moment from 'moment'

var emptyData = {
  title: '',
  comment: '',
  recipes: []
}

export default {
  name: 'EditMeal',
  props: {
    week: {
      type: Number
    },
    year: {
      type: Number
    },
    mealData: {
      default () {
        return _.cloneDeep(emptyData)
      }
    },
    resetOnSave: {
      type: Boolean
    }
  },
  data () {
    return {
      recipeSearchTerm: '',
      searchKeys: ['title', 'comment'],
      recipeResults: [],
      resultPage: 0,
      resultsPerPage: 5,
      expandTextarea: false,
      meal: {}
    }
  },
  created () {
    this.resetMeal()
  },
  mounted () {
    this.resetMeal()
  },
  watch: {
    recipeSearchTerm () {
      this.$search(this.recipeSearchTerm, this.recipeList, {keys: this.searchKeys, defaultAll: false}).then(results => {
        this.recipeResults = results
      })
    }
  },
  computed: {
    sliceStart () {
      return this.resultPage * this.resultsPerPage
    },
    sliceEnd () {
      return (this.resultPage + 1) * this.resultsPerPage
    },
    recipeList () {
      var list = _.map(this.$store.getters['recipes/recipeList'], (recipe) => {
        return {
          _id: recipe._id,
          title: recipe.title
        }
      })
      return list
    },
    recipeResultsNotSelected () {
      return this.recipeResults.filter(recipe => {
        return this.meal.recipes.indexOf(recipe._id) === -1
      })
    },
    selectedRecipes () {
      return this.recipeList.filter(recipe => {
        return this.meal.recipes.indexOf(recipe._id) !== -1
      })
    },
    date () {
      if (this.meal.date) {
        return this.meal.date
      } else if (this.week && this.year) {
        return moment().isoWeek(this.week).isoWeekYear(this.year).startOf('isoWeek').toDate()
      } else {
        return moment().startOf('isoWeek').toDate()
      }
    }
  },
  methods: {
    selectRecipe (id) {
      this.meal.recipes.push(id)
    },
    removeRecipe (id) {
      this.meal.recipes.splice(this.meal.recipes.indexOf(id), 1)
    },
    resetMeal () {
      this.meal = _.cloneDeep(this.mealData)
      this.recipeSearchTerm = ''
    },
    cancelEdit  () {
      this.resetMeal()
      this.$emit('cancel-edit')
    },
    saveMeal () {
      this.meal.date = this.date
      this.$emit('save-meal', this.meal)
      if (this.resetOnSave) {
        this.resetMeal()
      }
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
