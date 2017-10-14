<template>
  <div class="recipe" v-bind:class="editMode?'recipe-edit':''">
    <form v-if="editMode">
      <div class="closeIcon" @click="toggleEditMode()">
        <icon name="times"></icon>
      </div>

      <h3>
        Redigera recept
      </h3>
      <input v-model="recipeData.title" placeholder="Namn"/>
      <input v-model="recipeData.fields.url" placeholder="Url"/>
      <textarea v-model="recipeData.content" placeholder="Anteckning"></textarea>
      <p class="saveBtnContainer">
        <span class="btn" @click="toggleEditMode()">Stäng</span>
        <span class="btn btn-red" @click="deleteRecipe()">Ta bort</span>
        <span class="btn btn-primary pull-right" @click="saveRecipe()">Spara</span>
      </p>
    </form>

    <div v-else>
      <div class="actionIconContainer">
        <div class="actionIcon" @click="toggleEditMode()">
          <icon name="edit"></icon>
        </div>
        <div v-if="!hideCreateMeal" class="actionIcon" @click="createMeal()">
          <icon name="clone"></icon>
        </div>
      </div>

      <h3 v-if="recipeData.fields.url">
        <a v-bind:href="recipeData.fields.url" target="_blank">
        {{recipeData.title}}
        <icon name="external-link"></icon>
        <span v-if="createdMeal" class="createdNotification">Ny måltid skapad!</span>
      </a>
      </h3>
      <h3 v-else>
        {{recipeData.title}}
        <span v-if="createdMeal" class="createdNotification">Ny måltid skapad!</span>
      </h3>
      <p v-if="recipeData.content != ''" v-html="recipeData.content"></p>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'

  export default {
    name: "Recipe",
    props: ['recipeId','hideCreateMeal'],
    data() {
      return {
        recipeData: this.$store.getters.verifyRecipe(this.recipeId) ?  this.$store.getters.recipeById(this.recipeId) : {},
        editMode: false,
        createdMeal: false
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
      },
      createMeal() {
        let mealData = {
          title: this.recipeData.title,
          fields: {
            recipes: [this.recipeData.id],
            date: moment().isoWeekYear( this.$store.getters.currentYear ).isoWeek( this.$store.getters.currentWeek ).add(1, 'w')
          },
          status: 'publish'
        }
        this.$store.dispatch('updateMeal', {payload: mealData})
        this.createdMeal = true
        var _this = this
        setTimeout(() => _this.createdMeal = false, 4000)
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.recipe {
  position: relative;
  margin: @bu -@bu;
  padding: @bu @bu*5 @bu @bu;
  min-height: @bu*9;
  border-radius: @bu/2;
  background: fade(#FFA900, 3%);
  box-shadow: 0 0 0 1px fade(@colorPrimary, 12%) inset;
  &-edit {
    padding-right: @bu;
    padding-bottom: 0;
  }
  .saveBtnContainer {
    padding: @bu 0;
    .btn-red {
      background: #F35;
    }
  }
}
.createdNotification {
  display: inline-block;
  background-color: @colorPrimary;
  color: @colorBackground;
  font-size: @fusm;
  line-height: @bu*3;
  border-radius: @bu*2;
  padding: 0 @bu*2;
  white-space: nowrap;
}
.actionIconContainer {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: @bu*4.5;
  .centerContent;
  padding: @bu/2 @bu/2 @bu/2 0;
}
.actionIcon {
  cursor: pointer;
  padding: @bu;
  width: @bu*4;
  height: @bu*4;
  .centerContent;
  color: fade(@colorPrimary, 30%);
}
h3 {
  font-size: @fulg;
  margin: 0 0 @bu;
  > a {
    margin: -@bu;
    padding: @bu;
    display: block;
    > .fa-icon {
      vertical-align: -0.15em;
      width: .7em;
      height: .7em;
    }
  }
}
</style>
