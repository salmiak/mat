<template>
  <div id="recipeList">
    <h1>Recept</h1>
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
  margin: 0 auto 40px;
  padding: 0;
}
li {
  list-style: none;
  text-align: left;
  margin-bottom: 0.5em;
}
input, textarea {
  box-sizing: border-box;
  display: block;
  width: calc(100% - .6em);
  margin: .5em 0;
  font-size: 1em;
  line-height: 1.5em;
  padding: .3em .5em;
  border: none;
  border: 1px solid fade(@colorPrimary, 12%);
  background: fade(@colorPrimary, 3%);
  border-radius: 4px;
  &:focus {
    background: #FFF;
    outline: none;
    border-color: @colorSecondary;
  }
}
</style>
