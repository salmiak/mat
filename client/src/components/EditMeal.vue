<template>
  <div class="editMeal">
    <div>
      <input type="text" name="title" :placeholder="$t('Title')" v-model="meal.title">
    </div>
    <div>
      <textarea :placeholder="$t('Comment')" v-model="meal.comment" @focus="expandTextarea" @blur="collapsTextarea" @keydown="growTextarea" :style="commentStyle"></textarea>
      <pre class="textareameasure">{{meal.comment}}</pre>
    </div>
    <div>
      <input type="search" v-model="recipeSearchTerm" :placeholder="$t('Type to search current recipes')" />
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
    </div>

    <h3 v-if="selectedRecipes.length || newRecipes.length">{{$t('Recipes')}}</h3>

    <div v-if="selectedRecipes.length">
      <ul>
        <li v-for="recipe in selectedRecipes" :key="recipe._id">
          <span class="btn btn-sm pull-right" @click="removeRecipe(recipe._id)">{{$t('Remove')}}</span>
          {{recipe.title}}
        </li>
      </ul>
    </div>

    <div v-if="!recipeSearchTerm">
      <div v-for="(recipe,index) in newRecipes" :key="recipe.tmpId" class="recipe">
        <div class="toolbar">
          <i class="fal fa-times pull-right" @click="removeNewRecipe(index)"></i>
        </div>
        <h3>{{$t('Create new recipe')}}</h3>
        <div>
          <input type="text" name="title" :placeholder="$t('Title')" v-model="recipe.title">
        </div>
        <div>
          <input type="url" name="url" :placeholder="$t('Url')" v-model="recipe.url">
        </div>
        <div>
          <textarea :placeholder="$t('Comment')" v-model="recipe.comment"></textarea>
        </div>
      </div>
      <button @click="addNewRecipe"><i class="fal fa-plus"></i> {{$t('Create new recipe')}}</button>
    </div>

    <div class="cardfooter">
      <button @click="cancelEdit">{{$t('Cancel')}}</button>
      <button class="btn-primary pull-right" @click="saveMeal">{{$t('Save')}}</button>
    </div>
  </div>
</template>

<i18n>
  {
    "en": {
      "Create new recipe": "Create new recipe",
      "Show more": "Show more",
      "No results": "No results",
      "searchEmptyMsg": "Search to add recipes to this meal.",
      "Add": "Add",
      "Remove": "Remove",
      "Type to search current recipes": "Type to search current recipes"
    },
    "se": {
      "Create new recipe": "Skapa nytt recept",
      "Show more": "Visa fler",
      "No results": "Inga träffar",
      "searchEmptyMsg": "Sök recept att lägga till denna måltid",
      "Add": "Lägg till",
      "Remove": "Ta bort",
      "Type to search current recipes": "Sök för att lägga till befintligt recept"
    }
  }
</i18n>

<script>
import cloneDeep from 'lodash/cloneDeep'
import map from 'lodash/map'
import moment from 'moment'

var emptyData = {
  title: '',
  comment: '',
  recipes: []
}
var emptyRecipeData = {
  title: '',
  comment: '',
  url: ''
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
        return cloneDeep(emptyData)
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
      textareaExpanded: false,
      commentHeight: 64,
      meal: {},
      newRecipes: []
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
    commentStyle () {
      if (this.textareaExpanded || this.meal.comment) {
        return {'height': (this.commentHeight + 24) + 'px'}
      }
      return undefined
    },
    sliceStart () {
      return this.resultPage * this.resultsPerPage
    },
    sliceEnd () {
      return (this.resultPage + 1) * this.resultsPerPage
    },
    recipeList () {
      var list = map(this.$store.getters['recipes/recipeList'], (recipe) => {
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
    addNewRecipe () {
      var recipeData = cloneDeep(emptyRecipeData)
      recipeData.tmpId = (new Date()).getTime()
      this.newRecipes.push(recipeData)
    },
    removeNewRecipe (index) {
      this.newRecipes.splice(index, 1)
    },
    expandTextarea (e) {
      this.growTextarea(e)
      this.textareaExpanded = true
    },
    collapsTextarea (e) {
      this.textareaExpanded = false
    },
    growTextarea (e) {
      this.commentHeight = Math.max(e.path[0].nextElementSibling.offsetHeight, 64)
    },
    selectRecipe (id) {
      this.meal.recipes.push(id)
      this.recipeSearchTerm = ''
    },
    removeRecipe (id) {
      this.meal.recipes.splice(this.meal.recipes.indexOf(id), 1)
    },
    resetMeal () {
      this.meal = cloneDeep(this.mealData)
      this.recipeSearchTerm = ''
    },
    cancelEdit  () {
      this.resetMeal()
      this.$emit('cancel-edit')
    },
    saveMeal () {
      if (this.newRecipes.length) {
        this.saveRecipe(this.newRecipes.pop()).then((id) => {
          this.meal.recipes.push(id)
          this.saveMeal()
        })
      } else {
        this.meal.date = this.date
        this.$emit('save-meal', this.meal)
        if (this.resetOnSave) {
          this.resetMeal()
        }
      }
    },
    saveRecipe (recipeData) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('recipes/addRecipe', recipeData).then((recipe) => {
          resolve(recipe._id)
        })
      })
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
    height: calc(2.5rem + 2px);
    transition: height .3s;
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
.recipe {
  position: relative;
  background: @cRecipeBg;
  padding: @bu @bu @bu/2;
  border-radius: @radius;
  width: auto;
  margin: @bu/2 -@bu/2;
  textarea {
    margin-bottom: 0;
  }
  h3 {
    margin-top: 0;
    line-height: @bu;
  }
}
.textareameasure {
  position: absolute;
  top: 0;
  left: 100vw;
  width: calc(100% + @bu);
  margin: 0 -@bu/2 @bu/2;
  padding: @bu/2 @bu/2;
  border: 1px solid fade(@cBackground, 40%);
  border-radius: @radius;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88rem;
  line-height: 1.5em;
  color: @cText;
  display: block;
  white-space: pre-line;
}
</style>
