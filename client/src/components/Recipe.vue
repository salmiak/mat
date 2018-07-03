<template>
  <div class="recipe">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>
      <div v-if="!editMode">
        <h2>
          <a v-if="recipe.url" :href="recipe.url" target="_blank">{{recipe.title}}</a>
          <span v-else>{{recipe.title}}</span>
        </h2>
        <p>
          {{recipe.comment}}
        </p>
        <button @click="editMode = true">Edit</button>
      </div>
      <edit-recipe v-if="editMode" :recipeData="recipe" @save-recipe="updateRecipe"></edit-recipe>
    </div>
  </div>
</template>

<script>
import RecipesService from '@/services/RecipesService'
import EditRecipe from './EditRecipe'

export default {
  name: 'recipe',
  props: ['id'],
  components: {EditRecipe},
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
    async updateRecipe (recipe) {
      await RecipesService.updateRecipe(recipe)
      this.editMode = false
    }
  }
}
</script>

<style>
.recipe {
  background: #F5FAFA;
  padding: 0 16px 16px;
  border: 1px solid #EEE;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  margin: 12px auto;
  text-align: left;
}
</style>
