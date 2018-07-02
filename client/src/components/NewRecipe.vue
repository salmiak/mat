<template>
  <div class="recipes">
    <h1>Add Recipe</h1>
    <edit-recipe :recipeData="recipeData" @save-recipe="addRecipe"></edit-recipe>
  </div>
</template>

<script>
import _ from 'lodash'
import EditRecipe from './EditRecipe'

var emptyData = {
  title: '',
  comment: '',
  url: ''
}

export default {
  name: 'NewRecipe',
  components: { EditRecipe },
  data () {
    return {
      recipeData: _.clone(emptyData)
    }
  },
  methods: {
    addRecipe (recipeData) {
      this.$store.dispatch('recipes/addRecipe', recipeData).then(() => {
        this.$router.push({ name: 'Recipes' })
      })
    }
  }
}
</script>
<style type="text/css">
</style>
