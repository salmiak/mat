<template>
  <div class="recipeContent">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>
      <h2>
        <a v-if="recipe.url" :href="recipe.url" target="_blank">{{recipe.title}}</a>
        <span v-else>{{recipe.title}}</span>
        <span class="score">
          <i v-for="n in (recipe.score + 2)" class="fa fa-star" :key="'filled-'+n" /><i v-for="n in (5 - (recipe.score + 2))" class="far fa-star" :key="'open-'+n" />
        </span>
      </h2>

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
import range from 'lodash/range'
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
    },
    stars () {
      return range(this.recipe.score + 3)
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
    .score {
      font-size: @bu*.6;
      letter-spacing: 0.05rem;
      opacity: 0.54;
      white-space: nowrap;
    }
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
