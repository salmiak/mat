<template>
  <div class="meal">
    <div class="madeIcon" @click="toggleMade()">
      <icon name="check-square-o" v-if="fields.made"></icon>
      <icon name="square-o" v-else></icon>
    </div>
    <h2>
      {{title}}
    </h2>
    <p v-html="fields.comment" v-if="fields.comment"></p>
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
        return this.fields.recipes && this.fields.recipes.filter(id => this.$store.getters.verifyRecipe(id))
      }
    },
    methods: {
      toggleMade() {
        this.fields.made = !this.fields.made
        this.$store.dispatch('updateMeal',{id: this.id});
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  position: relative;
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
.madeIcon {
  position: absolute;
  top: 1.15em;
  left: -2em;
  cursor: pointer;
  padding: .5em .5em .25em;
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
