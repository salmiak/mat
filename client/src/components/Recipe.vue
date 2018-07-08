<template>
  <div class="recipe">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>
      <div v-if="!editMode">
        <div class="toolbar">
          <i class="fal fa-pen" @click="editMode = true"></i>
        </div>
        <h2>
          <a v-if="recipe.url" :href="recipe.url" target="_blank">{{recipe.title}}</a>
          <span v-else>{{recipe.title}}</span>
        </h2>
        <p v-if="recipe.comment">
          {{recipe.comment}}
        </p>
      </div>
      <edit-recipe v-if="editMode" :recipeData="recipe" @save-recipe="updateRecipe"></edit-recipe>
    </div>
  </div>
</template>

<script>
import RecipesService from '@/services/RecipesService'
import EditRecipe from './EditRecipe'

export default {
  name: 'recipe',
  props: ['id'],
  components: {EditRecipe},
  data () {
    return {
      editMode: false
    }
  },
  mounted () {
    // TODO: If a recipe that isn't loaded is requested, fetch from server.
  },
  computed: {
    recipe () {
      return this.$store.getters['recipes/recipeById'](this.id)
    }
  },
  methods: {
    async updateRecipe (recipe) {
      await RecipesService.updateRecipe(recipe)
      this.editMode = false
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.recipe {
  position: relative;
  background: @cRecipeBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  h2 {
    padding-right: @bu*2;
    &:not(:last-child) {
      margin-bottom: @bu/2;
    }
  }
}
.meal {
  .recipe {
    width: auto;
    margin: @bu/2 -@bu/2;
    padding: @bu @bu;
    h2 {
      .h3;
      line-height: @bu;
    }
  }
}
</style>
