<template>
  <div class="recipe">
    <template v-if="!recipe">
      Something is wrong with this recipe
    </template>
    <template v-else>
      <context-menu v-if="!editMode">
        <div class="toolbar">
          <i v-if="showCreate && recipe.added === 'added'" class="fal fa-check-square"></i>
          <i v-if="showCreate && recipe.added === 'inProgress'" class="fal fa-spinner fa-pulse"></i>
        </div>
        <h2>
          <a v-if="recipe.url" :href="recipe.url" target="_blank">{{recipe.title}}</a>
          <span v-else>{{recipe.title}}</span>
        </h2>

        <expander class="comment" v-if="recipe.comment && recipe.comment.length > 70">
          <vue-markdown>{{recipe.comment}}</vue-markdown>
        </expander>
        <vue-markdown v-else class="comment">{{recipe.comment}}</vue-markdown>

        <template slot="contextMenu">
          <ul>
            <li @click="editMode = true">
              <i class="fal fa-pen fa-fw"></i> Edit
            </li>
            <sure-button v-if="showDelete" @clicked="deleteRecipe(recipe._id)" type="li"><i class="fal fa-trash-alt fa-fw" /> Delete</sure-button>
            <li @click="mealFromRecipe(recipe)">
              <i v-if="showCreate" class="fal fa-plus-square fa-fw"></i> Add meal
            </li>
          </ul>
        </template>

      </context-menu>
      <div v-if="editMode">
        <h2>{{$t('Edit recipe')}}</h2>
        <edit-recipe :recipeData="recipe" @save-recipe="updateRecipe" @cancel-edit="editMode = false"></edit-recipe>
      </div>

    </template>
  </div>
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
    async deleteRecipe (id) {
      await this.$store.dispatch('recipes/deleteRecipe', id)
      this.$root.$emit('closeContextMenu')
    },
    async updateRecipe (recipe) {
      await this.$store.dispatch('recipes/updateRecipe', recipe)
      this.editMode = false
    },
    async mealFromRecipe (recipe) {
      this.$root.$emit('closeContextMenu')
      var meal = {
        recipes: [recipe._id],
        title: recipe.title,
        date: moment().add(1, 'w').startOf('isoWeek').toDate()
      }
      this.$set(recipe, 'added', 'inProgress')
      this.$store.dispatch('meals/addMeal', meal).then(() => {
        this.$set(recipe, 'added', 'added')
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
.recipe > div {
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
