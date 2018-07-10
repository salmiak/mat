<template>
  <div class="recipe">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>
      <div v-if="!editMode">
        <div class="toolbar">
          <i class="fal fa-pen" @click="editMode = true"></i>
          <sure-button v-if="showDelete" @clicked="deleteRecipe(recipe._id)" type="i" class="fal fa-trash-alt"></sure-button>
          <i v-if="showCreate && !recipe.added" class="fal fa-plus-square" @click="mealFromRecipe(recipe)"></i>
          <i v-if="showCreate && recipe.added" class="fal fa-check-square"></i>
        </div>
        <h2>
          <a v-if="recipe.url" :href="recipe.url" target="_blank">{{recipe.title}}</a>
          <span v-else>{{recipe.title}}</span>
        </h2>
        <div class="comment" v-if="recipe.comment">
          <vue-markdown>{{recipe.comment}}</vue-markdown>
        </div>
      </div>
      <edit-recipe v-if="editMode" :recipeData="recipe" @save-recipe="updateRecipe" @cancel-edit="editMode = false"></edit-recipe>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import {mapActions} from 'vuex'
import VueMarkdown from 'vue-markdown'
import EditRecipe from './EditRecipe'
import SureButton from './SureButton'

export default {
  name: 'recipe',
  props: ['id', 'showDelete', 'showCreate'],
  components: {EditRecipe, SureButton, VueMarkdown},
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
  background: @cRecipeBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  h2 {
    padding-right: @bu*2 * 3;
    &:not(:last-child) {
      margin-bottom: @bu/2;
    }
  }
}
.meal {
  .recipe {
    width: auto;
    margin: @bu/2 -@bu/2;
    padding: @bu @bu;
    h2 {
      .h3;
      line-height: @bu;
    }
  }
}
</style>
