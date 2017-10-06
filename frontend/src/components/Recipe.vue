<template>
  <li>
    <a v-bind:href="acf.url" v-if="acf.url">{{title}}</a>
    <span v-else>{{title}}</span>
  </li>
</template>

<script>
  export default {
    name: "Recipe",
    props: ['recipeId'],
    data() {
      return this.$store.getters.recipeById(this.recipeId)
    }
  }
</script>
