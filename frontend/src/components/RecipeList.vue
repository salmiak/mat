<template>
  <div id="recipeList">
    <div class="header">
      <h1>Recept</h1>
    </div>
    <div v-if="isLoading" class="loading">
      <p><icon name="refresh" scale="1" spin></icon></p>
      <p>Laddar</p>
    </div>
    <div v-else>
      <add-recipe/>
      <div class="search">
        <vue-fuse :keys="keys" :list="recipes" :defaultAll="true" :eventName="'recipeSearchChanged'" placeholder="Sök recept"></vue-fuse>
      </div>
      <ul>
        <li v-for="recipe in recipesResults" :key="recipe.id">
          <recipe v-bind:recipeId="recipe.id" />
        </li>
      </ul>
    </div>
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
      isLoading(){ return this.$store.getters.isLoading },
      ...mapGetters({
        'recipes': 'allRecipes'
      })
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.search {
  .border-bottom;
  input {
    padding: @bu 2*@bu;
    margin: 0;
    border-radius: 0;
  }
}
ul {
  padding: 0 @bu*2;
  li {
    list-style: none;
    margin-bottom: @bu;
  }
}
</style>
