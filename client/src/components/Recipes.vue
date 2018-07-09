<template>
  <div class="recipes">
    <header>
      <h1 class="text-center">{{$t('Recipes')}}</h1>
    </header>

    <new-recipe></new-recipe>

    <vue-fuse :placeholder="$t('Type to search')" :list="recipes" :keys="searchKeys" event-name="searchChanged" :defaultAll="true"></vue-fuse>

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
