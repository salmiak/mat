<template>
  <div id="recipeList">
    <div class="header">
      <h1>Recept</h1>
    </div>
    <add-recipe/>
    <vue-fuse :keys="keys" :list="recipes" :defaultAll="true" :eventName="'recipeSearchChanged'" placeholder="Sök recept"></vue-fuse>
    <ul>
      <li v-for="recipe in recipesResults" :key="recipe.id">
        <recipe v-bind:recipeId="recipe.id"></recipe>
      </li>
    </ul>
  </div>
</template>

<script>
  import { mapState,mapGetters } from 'vuex'
  import { mapMutations } from 'vuex'
  import VueFuse from 'vue-fuse'
  import Recipe from './Recipe'
  import AddRecipe from './AddRecipe'

  export default {
    name: "RecipeList",
    components: { Recipe, AddRecipe, VueFuse },
    created(){
      this.$on('recipeSearchChanged', results =>{
        this.recipesResults = results
      })
    },
    data(){
      return {
        recipesResults: [],
        keys: ['title','content']
      }
    },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      })
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
ul {
  margin: 0 auto;
  padding: 0 @bu*2;
  li {
    list-style: none;
    margin-bottom: @bu;
  }
}
</style>
