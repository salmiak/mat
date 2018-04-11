<template>
  <span class="add-recipe">
    <form v-if="showForm">
      <div class="closeIcon" @click="toggleForm()">
        <icon name="times"></icon>
      </div>

      <h2>Lägg till recept för {{recipeData.title}}</h2>
      <input v-model="recipeData.title" placeholder="Namn"/>
      <input v-model="recipeData.fields.url" placeholder="Url"/>
      <textarea v-model="recipeData.content" placeholder="Anteckning"></textarea>
      <p>
        <span class="pull-right btn btn-primary" @click="saveRecipe()">Spara recept</span>
        <span class="btn" @click="toggleForm()">Ångra</span>
      </p>
    </form>

    <span @click="toggleForm()" v-else>
      Lägg till recept för {{recipeData.title}}
    </span>
  </span>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Recipe from './Recipe'
  import moment from 'moment'
  import Multiselect from 'vue-multiselect'

  var emptyRecipe = {
    fields: {},
    status: 'publish'
  }

  export default {
    name: "AddRecipeInline",
    components: { },
    props: ['tag'],
    data() {
      let recipeData = JSON.parse(JSON.stringify(emptyRecipe))
      if(this.tag) {
        recipeData.title = this.tag.title
      }
      return {
        showForm: false,
        recipeData: recipeData
      }
    },
    methods: {
      toggleForm() {
        this.showForm = !this.showForm
        if (this.showForm)
          this.$emit('initiated')
        else {
          this.$emit('canceled')
        }
      },
      saveRecipe() {
        this.$store.dispatch('updateRecipe',{payload: this.recipeData}).then(recipe => this.$emit('saved', {recipe: recipe, tag: this.tag}))
        this.recipeData = JSON.parse(JSON.stringify(emptyRecipe))
        this.showForm = false
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.add-recipe {
  position: relative;
  padding: @bu 0;
  > form {
    padding: @bu @bu 1px;
    margin: @bu -@bu;
    background: @colorBackground;
    border: 1px solid @colorBorder;
    border-radius: 2px;
  }
  > span {
    color: @colorSecondary;
    text-decoration: underline;
  }
  .saveBtnContainer {
    padding: @bu 0 0;
  }
}
</style>
