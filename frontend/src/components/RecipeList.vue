<template>
  <div id="recipeList">
    <h1>Recept</h1>
    <add-recipe/>
    <ul>
      <li v-for="recipe in recipes" :key="recipe.id">
        <recipe v-bind:recipeId="recipe.id"></recipe>
      </li>
    </ul>
  </div>
</template>

<script>
  import { mapState,mapGetters } from 'vuex'
  import { mapMutations } from 'vuex'
  import Recipe from './Recipe'
  import AddRecipe from './AddRecipe'

  export default {
    name: "RecipeList",
    components: { Recipe, AddRecipe },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      })
    }
  }
</script>

<style scoped>
ul {
  margin: 0 auto 40px;
  padding: 0;
}
li {
  list-style: none;
  text-align: left;
  margin-bottom: 0.5em;
}
</style>
