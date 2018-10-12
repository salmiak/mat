<template>
  <div class="recipes">
    <header>
      <h1 class="text-center">{{$t('Recipes')}}</h1>
    </header>

    <new-recipe></new-recipe>

    <input type="search" v-model="searchTerm" :placeholder="$t('Type to search')" />

    <recipe v-for="recipe in list" :key="recipe._id" :id="recipe._id" :showDelete="true" :showCreate="true"></recipe>
  </div>
</template>

<script>
import orderBy from 'lodash/orderBy'
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
      searchResults: [],
      searchTerm: ''
    }
  },
  computed: {
    ...mapState('recipes', {
      recipes: 'list'
    }),
    list () {
      if (this.searchTerm) {
        return this.searchResults
      } else {
        return orderBy(this.recipes, 'score', 'desc')
      }
    }
  },
  watch: {
    searchTerm () {
      this.$search(this.searchTerm, this.recipes, {keys: this.searchKeys, defaultAll: false}).then(results => {
        this.searchResults = results
      })
    }
  },
  created () {
    this.searchResults = this.recipes
    this.searchTerm = ''
  },
  mounted () {
    this.searchResults = this.recipes
    this.searchTerm = ''
    this.$store.dispatch('recipes/loadRecipeList')
  }
}
</script>
<style lang="less" scoped>
@import "../assets/global.less";
input {
  width: calc(100% - @bu - 4px);
  border: none;
  max-width: 25rem;
  margin: 0 auto;
  background: @cMealBg;
  &:focus {
    background: @cRecipeBg;
  }
}
</style>
