<template>
  <div id="recipeList">
    <div class="header">
      <h1>Recept</h1>
    </div>
    <add-recipe/>
    <div class="search" v-if="!isLoading">
      <vue-fuse class="searchField" :keys="keys" :list="recipes" :defaultAll="true" :eventName="'recipeSearchChanged'" placeholder="Sök recept"></vue-fuse>
    </div>
    <ul v-if="!isLoading">
      <li v-for="recipe in recipesResults" :key="recipe.id">
        <recipe v-bind:recipeId="recipe.id" />
      </li>
    </ul>
    <div v-for="i in [1,2,3]" class="loadingPlaceholder" v-if="!recipesResults.length && isLoading"></div>
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
#recipeList {
  background: @colorBackground;
}
.search {
  padding: 0 @bu;
  input.searchField {
    padding: @bu 2*@bu;
    margin: 0;
    border-radius: 0;
  }
}
ul {
  padding: @bu/2 0;
  li {
    list-style: none;
    padding: 0;
  }
}
.loadingPlaceholder {
  height: @bu*13;
  background: @colorBackground;
  position: relative;
  .border-bottom;
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: @bu*2;
    left: @bu*2;
    width: 34%;
    height: @bu*2;
    background: @colorBorder;
  }
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: @bu*6;
    left: @bu*2;
    right: @bu*5;
    height: @bu*1.5;
    background: @colorBorder;
    box-shadow: 0 @bu*3 0 0 @colorBorder;
  }
}
</style>
