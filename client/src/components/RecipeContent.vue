<template>
  <div class="recipeContent">
    <div v-if="!recipe">
      …
    </div>
    <div v-else>
      <h2>
        <a v-if="recipe.url" :href="recipe.url" target="_blank">{{recipe.title}}</a>
        <a v-else-if="recipe.fileUrl" :href="recipe.fileUrl" target="_blank">{{recipe.title}}</a>
        <span v-else>{{recipe.title}}</span>
      </h2>

      <a v-if="recipe.fileUrl" :href="recipe.fileUrl" target="_blank">
        <img :src="recipe.fileUrl" class="recipe-thumbnail" />
      </a>

      <expander class="comment" v-if="recipe.comment && recipe.comment.length > 70">
        <vue-markdown>{{recipe.comment}}</vue-markdown>
      </expander>
      <vue-markdown v-else class="comment">{{recipe.comment}}</vue-markdown>
    </div>
  </div>
</template>

<i18n>
  {
  }
</i18n>

<script>
import VueMarkdown from 'vue-markdown'
import Expander from './Expander'

export default {
  name: 'RecipeContent',
  props: ['id', 'showDelete', 'showCreate'],
  components: {VueMarkdown, Expander},
  data () {
    return {
    }
  },
  mounted () {
    // TODO: If a recipe that isn't loaded is requested, fetch from server.
  },
  computed: {
    recipe () {
      return this.$store.getters['recipes/recipeById'](this.id)
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.recipeContent {
  position: relative;
  background: @cRecipeBg;
  padding: @bu @bu @bu/2;
  border-radius: @radius;
  margin: 0;
  h2 {
    padding-right: @bu*2 * 3;
    &:not(:last-child) {
      margin-bottom: @bu/2;
    }
  }
  .recipe-thumbnail {
    max-width: 120px;
    height: auto;
    float: left;
    margin: 0 @bu @bu/2 0;
  }

  &::after {
    content: '';
    display: block;
    clear: both;
  }
}
.meal {
  .recipeContent {
    width: auto;
    margin: @bu/2 -@bu/2;
    h2 {
      .h3;
      line-height: @bu;
    }
    &:last-child {
      margin-bottom: -@bu/2;
    }
  }
}
</style>
