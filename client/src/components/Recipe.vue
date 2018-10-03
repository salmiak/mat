<template>
  <context-menu class="recipe">
    <template v-if="!recipe">
      Something is wrong with this recipe
    </template>
    <template v-else>
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

        <expander class="comment" v-if="recipe.comment && recipe.comment.length > 70">
          <vue-markdown>{{recipe.comment}}</vue-markdown>
        </expander>
        <vue-markdown v-else class="comment">{{recipe.comment}}</vue-markdown>

      </div>
      <div v-if="editMode">
        <h2>{{$t('Edit recipe')}}</h2>
        <edit-recipe :recipeData="recipe" @save-recipe="updateRecipe" @cancel-edit="editMode = false"></edit-recipe>
      </div>

    </template>
  </context-menu>
</template>

<i18n>
  {
    "en": {
      "Edit recipe": "Edit recipe"
    },
    "se": {
      "Edit recipe": "Redigera recept"
    }
  }
</i18n>

<script>
import moment from 'moment'
import {mapActions} from 'vuex'
import VueMarkdown from 'vue-markdown'
import EditRecipe from './EditRecipe'
import SureButton from './SureButton'
import Expander from './Expander'
import ContextMenu from './ContextMenu'

export default {
  name: 'recipe',
  props: ['id', 'showDelete', 'showCreate'],
  components: {EditRecipe, SureButton, VueMarkdown, Expander, ContextMenu},
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
  background: @cRecipeBg;
  padding: @bu @bu @bu/2;
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
    h2 {
      .h3;
      line-height: @bu;
    }
    &:last-child {
      margin-bottom: -@bu/2;
    }
  }
}
</style>
