<template>
  <div class="recipes">
    <header>
      <h1 class="text-center">Recipes</h1>
    </header>

    <new-recipe></new-recipe>

    <vue-fuse :placeholder="'Search recipe'" :list="recipes" :keys="searchKeys" event-name="searchChanged" :defaultAll="true"></vue-fuse>

    <recipe v-for="recipe in searchResults" :key="recipe._id" :id="recipe._id" :showDelete="true" :showCreate="true"></recipe>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Recipe from './Recipe'
import NewRecipe from './NewRecipe'

export default {
  name: 'recipes',
  metaInfo: {
    title: 'Recieps'
  },
  components: {Recipe, NewRecipe},
  data () {
    return {
      searchKeys: ['title', 'comment'],
      searchResults: []
    }
  },
  computed: {
    ...mapState('recipes', {
      recipes: 'list'
    })
  },
  created () {
    this.$on('searchChanged', results => {
      this.searchResults = results
    })
  },
  mounted () {
    this.$store.dispatch('recipes/loadRecipeList')
  }
}
</script>
<style lang="less" scoped>
input {
  margin: 0 calc(2px + .5rem);
  width: calc(100% - 1rem - 4px);
  border: none;
}
</style>
