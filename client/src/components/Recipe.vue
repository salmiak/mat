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
