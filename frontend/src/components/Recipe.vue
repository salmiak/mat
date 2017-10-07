<template>
  <div class="meal">
    <a v-bind:href="fields.url" v-if="fields.url">{{title}}</a>
    <span v-else>{{title}}</span>
  </div>
</template>

<script>
  export default {
    name: "Recipe",
    props: ['recipeId'],
    data() {
      if ( this.$store.getters.verifyRecipe(this.recipeId) ) {
        return this.$store.getters.recipeById(this.recipeId)
      } else {
        return {}
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
  top: 1.95em;
  left: -1.3em;
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
