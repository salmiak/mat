<template>
  <div class="recipe">
    <form v-if="editMode">
      <div class="closeIcon" @click="toggleEditMode()">
        <icon name="times"></icon>
      </div>

      <h3>
        Redigera recept
        <span @click="deleteRecipe()">
          <icon name="trash"></icon>
        </span>
      </h3>
      <input v-model="recipeData.title" placeholder="Namn"/>
      <input v-model="recipeData.fields.url" placeholder="Url"/>
      <textarea v-model="recipeData.content" placeholder="Anteckning"></textarea>
      <p>
        <span class="pull-right btn" @click="toggleEditMode()">Stäng</span>
        <span class="btn btn-primary" @click="saveRecipe()">Spara</span>
      </p>
    </form>

    <div v-else>
      <div class="editIcon" @click="toggleEditMode()">
        <icon name="edit"></icon>
      </div>

      <h3 v-if="recipeData.fields.url">
        <a v-bind:href="recipeData.fields.url" target="_blank">
        {{recipeData.title}}
        <icon name="external-link"></icon>
      </a>
      </h3>
      <h3 v-else>{{recipeData.title}}</h3>
      <p v-if="recipeData.content != ''" v-html="recipeData.content"></p>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Recipe",
    props: ['recipeId'],
    data() {
      return {
        recipeData: this.$store.getters.verifyRecipe(this.recipeId) ?  this.$store.getters.recipeById(this.recipeId) : {},
        editMode: false
      }
    },
    methods: {
      toggleEditMode() { this.editMode = !this.editMode },
      saveRecipe() {
        this.$store.dispatch('updateRecipe',{id: this.recipeData.id})
        this.editMode = false
      },
      deleteRecipe() {
        this.$store.dispatch('deleteRecipe', {id: this.recipeData.id})
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
.editIcon, .closeIcon {
  position: absolute;
  top: .35em;
  left: -2em;
  cursor: pointer;
  padding: .5em .5em .25em;
}
.editIcon {
  opacity: 0;
}
.recipe:hover {
  .editIcon {
    opacity: 1;
  }
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
input, textarea {
  box-sizing: border-box;
  display: block;
  width: calc(100% - .6em);
  margin: 0 0 1em;
  font-size: 1em;
  line-height: 1.5em;
  padding: .3em;
  border: none;
  border-bottom: 1px solid fade(@colorPrimary, 12%);
  background: none;
  border-radius: 4px 4px 0 0;
  &:focus {
    background: #FFF;
    outline: none;
    border-bottom-color: @colorSecondary;
  }
}
</style>
