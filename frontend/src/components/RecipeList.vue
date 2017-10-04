<template>
  <ul>
    <li v-for="recipe in recipes">
      <recipe v-bind:id="recipe.id"></recipe>
    </li>
  </ul>
</template>

<script>
  import { mapState } from 'vuex'
  import { mapMutations } from 'vuex'
  import Recipe from './Recipe'

  export default {
    name: "RecipeList",
    components: {Recipe},
    computed: {
      ...mapState([
        'recipes'
      ])
    },
    created() {
      this.$store.dispatch('loadRecipes')
    }
  }
</script>
