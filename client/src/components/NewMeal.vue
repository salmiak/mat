<template>
  <div class="meals">
    <h1>Add Meal</h1>
      <div>
        <div>
          <input type="text" name="title" placeholder="TITLE" v-model="title">
        </div>
        <div>
          <textarea rows="15" cols="15" placeholder="COMMENT" v-model="comment"></textarea>
        </div>
        <div>
          <div v-for="recipe in recipeList" :key="recipe._id" @click="selectRecipe(recipe._id)">
            <span v-if="recipe.selected">
              Selected
            </span>
            {{recipe.title}}
          </div>
        </div>
        <div>
          <button class="app_meal_btn" @click="addMeal">Add</button>
        </div>
      </div>
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'NewMeal',
  props: ['week', 'year'],
  data () {
    return {
      title: '',
      comment: '',
      recipes: []
    }
  },
  computed: {
    recipeList () {
      var list = _.map(this.$store.getters['recipes/recipeList'], (recipe) => {
        return {
          _id: recipe._id,
          title: recipe.title,
          selected: (this.recipes.indexOf(recipe._id) !== -1)
        }
      })
      return list
    },
    date () {
      if (this.week && this.year) {
        return moment().isoWeek(this.week).isoWeekYear(this.year).startOf('isoWeek').toDate()
      } else {
        return moment().startOf('isoWeek').toDate()
      }
    }
  },
  methods: {
    selectRecipe (id) {
      var index = this.recipes.indexOf(id)
      if (index !== -1) {
        this.recipes.splice(index, 1)
      } else {
        this.recipes.push(id)
      }
    },
    addMeal () {
      this.$store.dispatch('meals/addMeal', {
        title: this.title,
        comment: this.comment,
        recipes: this.recipes,
        date: this.date
      }).then(() => {
        this.title = ''
        this.comment = ''
        this.recipes = []
      })
    }
  }
}
</script>
<style type="text/css">
.form input, .form textarea {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
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
  width: 520px;
  border: none;
  cursor: pointer;
}
</style>
