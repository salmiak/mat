<template>
  <div class="recipe">
    <h3 v-if="fields.url">
      <a v-bind:href="fields.url">
      {{title}}
      <icon name="external-link"></icon>
    </a>
    </h3>
    <h3 v-else>{{title}}</h3>
    <p v-if="content != ''" v-html="content"></p>
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
.recipe {
  position: relative;
  margin: .2em -.3em 0;
  padding: 0em .6em .2em;
  border: 1px solid fade(@colorPrimary, 12%);
  border-radius: .3em;
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
h3 {
  font-size: 1.2em;
  margin: .7em 0 .5em;
  > a {
    margin: -.7em -.6em -.5em;
    padding: .7em .6em .5em;
    display: block;
    > svg {
      vertical-align: -0.1em;
      width: .75em;
      height: .75em;
    }
  }
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
