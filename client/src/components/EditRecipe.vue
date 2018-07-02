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
.editRecipe input, .editRecipe textarea {
  width: 90%;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
  margin: 0 0 4px;
}
.form div {
  margin: 20px;
}
.app_recipe_btn {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  width: 90%;
  margin: 0 auto;
  display: block;
  border: none;
  cursor: pointer;
}
</style>
