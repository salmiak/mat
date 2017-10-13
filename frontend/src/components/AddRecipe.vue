<template>
  <div class="add-recipe">
    <form v-if="showForm">
      <div class="closeIcon" @click="toggleForm()">
        <icon name="times"></icon>
      </div>

      <h2>Lägg till recept</h2>
      <input v-model="recipeData.title" placeholder="Namn"/>
      <input v-model="recipeData.fields.url" placeholder="Url"/>
      <textarea v-model="recipeData.content" placeholder="Anteckning"></textarea>
      <p>
        <span class="pull-right btn" @click="toggleForm()">Stäng</span>
        <span class="btn btn-primary" @click="saveRecipe()">Spara</span>
        <span class="btn" @click="saveRecipeAndClose()">Spara och stäng</span>
      </p>
    </form>

    <div @click="toggleForm()" v-else>
      Lägg till recept
    </div>
  </div>
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
    name: "AddRecipe",
    components: { },
    data() {
      return {
        showForm: false,
        recipeData: JSON.parse(JSON.stringify(emptyRecipe))
      }
    },
    methods: {
      toggleForm() {
        this.showForm = !this.showForm
      },
      saveRecipe() {
        this.$store.dispatch('updateRecipe',{payload: this.recipeData})
        this.recipeData = JSON.parse(JSON.stringify(emptyRecipe))
      },
      saveRecipeAndClose() {
        this.saveRecipe()
        this.showForm = false
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.add-recipe {
  position: relative;
  margin: 1em 0 .5em;
  > div {
    cursor: pointer;
    padding: 1em .3em;
    border-bottom: 1px solid fade(@colorPrimary, 12%);
    border-top: 1px solid fade(@colorPrimary, 12%);
    &:hover {
      background: fade(@colorPrimary, 3%);
    }
  }
  > form {
    padding: .2em .3em .5em;
    border-bottom: 1px solid fade(@colorPrimary, 12%);
    border-top: 1px solid fade(@colorPrimary, 12%);
    background: fade(@colorPrimary, 3%);
  }
}
h2 {
  font-size: 1.2em;
  margin: .5em 0 .75em;
}
.closeIcon {
  position: absolute;
  top: .35em;
  left: -2em;
  cursor: pointer;
  padding: .5em .5em .25em;
}
</style>
