<template>
  <div class="recipe">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>
      <div v-if="!editMode">
        <h2>{{recipe.title}}</h2>
        <p>
          {{recipe.comment}}
        </p>
        <button @click="editMode = true">Edit</button>
      </div>
      <div v-if="editMode">
        <input type="text" v-model="recipe.title" />
        <textarea v-model="recipe.comment"></textarea>
        <button @click="updateRecipe()">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import RecipesService from '@/services/RecipesService'

export default {
  name: 'recipe',
  props: ['id'],
  data () {
    return {
      editMode: false
    }
  },
  computed: {
    recipe () {
      return this.$store.getters['recipes/recipeById'](this.id)
    }
  },
  methods: {
    async updateRecipe () {
      await RecipesService.updateRecipe(this.recipe)
      this.editMode = false
    }
  }
}
</script>

<style>
.recipe {
  padding: 12px 0;
  border-bottom: 1px solid #EEE;
}
</style>
