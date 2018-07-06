<template>
  <div class="recipes">
    <header>
      <h1>Recipes</h1>
    </header>

    <div v-if="recipes.length > 0" class="table-wrap">
      <div>
        <router-link v-bind:to="{ name: 'NewRecipe' }" class="">Add Recipe</router-link>
      </div>

      <vue-fuse :placeholder="'Search recipe'" :list="recipes" :keys="searchKeys" event-name="searchChanged" :defaultAll="true"></vue-fuse>

      <table>
        <tr>
          <td>Title</td>
          <td width="550">Comment</td>
          <td width="100" align="center">Action</td>
        </tr>
        <tr v-for="recipe in recipeSearchResults" :key="recipe._id" :class="{made:recipe.made}">
          <td v-if="recipe.url"><a :href="recipe.url">{{ recipe.title }}</a></td>
          <td v-else>{{ recipe.title }}</td>
          <td>{{ recipe.comment }}</td>
          <td align="center">
            <router-link v-bind:to="{ name: 'EditRecipe', params: { id: recipe._id } }">Edit</router-link> |
            <a href="#" @click="deleteRecipe(recipe._id)">Delete</a>
          </td>
        </tr>
      </table>
    </div>
    <div v-else>
      There are no recipes.. Lets add one now <br /><br />
      <router-link v-bind:to="{ name: 'NewRecipe' }" class="add_recipe_link">Add Recipe</router-link>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'recipes',
  data () {
    return {
      searchKeys: ['title', 'comment'],
      recipeSearchResults: []
    }
  },
  computed: {
    ...mapState('recipes', {
      recipes: 'list'
    })
  },
  created () {
    this.$on('searchChanged', results => {
      this.recipeSearchResults = results
    })
  },
  mounted () {
    this.$store.dispatch('recipes/loadRecipeList')
  },
  methods: {
    ...mapActions('recipes', {
      deleteRecipe: 'deleteRecipe'
    })
  }
}
</script>
<style type="text/css" scoped>

</style>
