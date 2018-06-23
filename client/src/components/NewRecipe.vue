<template>
  <div class="recipes">
    <h1>Add Recipe</h1>
      <div class="form">
        <div>
          <input type="text" name="title" placeholder="TITLE" v-model="title">
        </div>
        <div>
          <textarea rows="15" cols="15" placeholder="COMMENT" v-model="comment"></textarea>
        </div>
        <div>
          <input type="url" name="url" v-model="url" placeholder="URL">
        </div>
        <div>
          <button class="app_recipe_btn" @click="addRecipe">Add</button>
        </div>
      </div>
  </div>
</template>

<script>
import RecipesService from '@/services/RecipesService'
export default {
  name: 'NewRecipe',
  data () {
    return {
      title: '',
      comment: '',
      url: ''
    }
  },
  methods: {
    async addRecipe () {
      await RecipesService.addRecipe({
        title: this.title,
        comment: this.comment,
        url: this.url
      })
      this.$router.push({ name: 'Recipes' })
    }
  }
}
</script>
<style type="text/css">
.form input, .form textarea {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
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
  width: 520px;
  border: none;
  cursor: pointer;
}
</style>
