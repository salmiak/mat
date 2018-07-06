<template>
  <div class="editRecipe">
    <div>
      <input type="text" name="title" placeholder="TITLE" v-model="recipeData.title">
    </div>
    <div>
      <input type="url" name="url" placeholder="URL" v-model="recipeData.url">
    </div>
    <div>
      <textarea rows="15" cols="15" placeholder="COMMENT" v-model="recipeData.comment"></textarea>
    </div>
    <div>
      <button class="app_recipe_btn" @click="saveRecipe">Save</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditRecipe',
  props: ['recipeData'],
  data () {
    return {
    }
  },
  methods: {
    saveRecipe () {
      this.$emit('save-recipe', this.recipeData)
    }
  }
}
</script>
<style type="text/css">

</style>
