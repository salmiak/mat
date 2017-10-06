<template>
  <div class="meal">
    <h2>{{title}}</h2>
    <p v-html="acf.comment" v-if="acf.comment"></p>
    <ul>
      <recipe v-for="recipe in verifiedRecipes" :key="recipe" v-bind:recipeId="recipe"></recipe>
    </ul>
  </div>
</template>

<script>
  import Recipe from './Recipe'
  export default {
    name: "Meal",
    components: { Recipe },
    props: ['mealId'],
    data() {
      return this.$store.getters.mealById(this.mealId)
    },
    computed: {
      verifiedRecipes() {
        return this.acf.recipes && this.acf.recipes.filter(id => this.$store.getters.verifyRecipe(id))
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  margin: 0;
  padding: 1em .3em;
  border-bottom: 1px solid fade(@colorPrimary, 12%);
  &:first-of-type {
    border-top: 1px solid fade(@colorPrimary, 12%);
  }
  &:hover {
    background: fade(@colorPrimary, 3%);
  }
}
h2 {
  font-size: 1.2em;
  margin: .5em 0 .2em;
}
p {
  margin: 0 0 .5em;
  opacity: .54;
}
ul {
  margin: 0 0 .5em;
  padding: 0;
  li {
    list-style: none;
  }
}
</style>
