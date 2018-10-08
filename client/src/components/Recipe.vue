<template>
  <div class="recipe">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>

      <swipe-action-item
        v-if="!editMode"
        :rightActions="1"
        :leftActions="1"
        @rightprimary="mealFromRecipe(recipe)"
        @leftprimary="editMode = true">

        <span slot="rightprimary">
          <i class="fal fa-plus-square"></i> {{$t('Add meal')}}
        </span>
        <span slot="leftprimary">
          <i class="fal fa-edit"></i> {{$t('Edit')}}
        </span>

        <recipe-content :id="id" ></recipe-content>

      </swipe-action-item>

      <div v-if="editMode" class="recipeContent">
        <div class="toolbar">
           <sure-button v-if="showDelete" @clicked="deleteRecipe(recipe._id)" type="i" class="fal fa-trash-alt"></sure-button>
         </div>

        <h2>{{$t('Edit recipe')}}</h2>
        <edit-recipe :recipeData="recipe" @save-recipe="updateRecipe" @cancel-edit="editMode = false"></edit-recipe>
      </div>

    </div>
  </div>
</template>

<i18n>
  {
    "en": {
      "Add meal": "Add meal",
      "Edit recipe": "Edit recipe"
    },
    "se": {
      "Add meal": "Skapa måltid",
      "Edit recipe": "Redigera recept"
    }
  }
</i18n>

<script>
import moment from 'moment'
import {mapActions} from 'vuex'
import VueMarkdown from 'vue-markdown'
import EditRecipe from './EditRecipe'
import RecipeContent from './RecipeContent'
import SureButton from './SureButton'
import Expander from './Expander'
import SwipeActionItem from './SwipeActionItem'

export default {
  name: 'recipe',
  props: ['id', 'showDelete', 'showCreate'],
  components: {EditRecipe, SureButton, VueMarkdown, Expander, SwipeActionItem, RecipeContent},
  data () {
    return {
      editMode: false
    }
  },
  mounted () {
    // TODO: If a recipe that isn't loaded is requested, fetch from server.
  },
  computed: {
    recipe () {
      return this.$store.getters['recipes/recipeById'](this.id)
    }
  },
  methods: {
    ...mapActions('recipes', {
      deleteRecipe: 'deleteRecipe'
    }),
    async updateRecipe (recipe) {
      await this.$store.dispatch('recipes/updateRecipe', recipe)
      this.editMode = false
    },
    async mealFromRecipe (recipe) {
      var meal = {
        recipes: [recipe._id],
        title: recipe.title,
        date: moment().add(1, 'w').startOf('isoWeek').toDate()
      }
      this.$store.dispatch('meals/addMeal', meal).then(() => {
        this.$set(recipe, 'added', true)
        setTimeout(() => {
          this.$set(recipe, 'added', false)
        }, 5000)
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.recipe {
  position: relative;
  width: 95%;
  max-width: @bu * 25;
  overflow: hidden;
  border-radius: @radius;
  margin: @bu/2 auto;
  h2 {
    padding-right: @bu*2 * 3;
    &:not(:last-child) {
      margin-bottom: @bu/2;
    }
  }
}
.recipeContent {
  background: @cMealBg;
  padding: @bu;
  border-radius: @radius;
}
</style>
