<template>
  <div class="recipe">
    <div v-if="expanded">
      <div class="toolbar">
        <i class="fal fa-times" @click="expanded = false"></i>
      </div>
      <h2>Add Recipe</h2>
      <edit-recipe @save-recipe="addRecipe" @cancel-edit="expanded = false"></edit-recipe>
    </div>
    <div v-else>
      <button @click="expanded = true">Add recipe</button>
    </div>
  </div>
</template>

<script>
import EditRecipe from './EditRecipe'

export default {
  name: 'NewRecipe',
  components: { EditRecipe },
  data () {
    return {
      expanded: false
    }
  },
  methods: {
    addRecipe (recipeData) {
      this.$store.dispatch('recipes/addRecipe', recipeData).then(() => {
        this.expanded = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import "../assets/global.less";
.recipe {
  background: @cRecipeBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  position: relative;
  h1 {
    margin-top: 8px;
  }
}
</style>
