<template>
  <ul>
    <li v-for="recipe in recipes">
      <recipe v-bind:id="recipe.id"></recipe>
    </li>
  </ul>
</template>

<script>
  import { mapState,mapGetters } from 'vuex'
  import { mapMutations } from 'vuex'
  import Recipe from './Recipe'

  export default {
    name: "RecipeList",
    components: { Recipe },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      })
    },
    created() {
      this.$store.dispatch('getAllRecipes')
    }
  }
</script>

<style scoped>
ul {
  margin: 0 auto 40px;
  padding: 0;
  width: 300px;
}
li {
  list-style: none;
  text-align: left;
  margin-bottom: 0.5em;
}
</style>
