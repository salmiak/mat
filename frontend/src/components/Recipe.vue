<template>
  <div>
    <form v-if="editMode" class="recipe recipeEdit">
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

    <div v-if="!editMode && disableActions">
      <div class="recipeContent">
        <div class="recipe">
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
          <div v-if="recipeData.content != ''" v-html="recipeData.content"></div>
        </div>
      </div>
    </div>

    <swipe-action-item v-if="!editMode && !disableActions"
    class="recipeItem"
    v-on:leftprimary="toggleEditMode"
    v-on:rightprimary="createMeal">

      <span slot="leftprimary"><icon name="edit"></icon> Redigera</span>
      <span slot="rightprimary"><icon name="copy"></icon> Kopiera</span>

      <div class="recipeContent">
        <div class="recipe">
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
          <p class="ranking">
            <icon name="star" v-for="n in ranking.stars" :key="n"></icon><icon name="star-o" v-for="n in (5 - ranking.stars)" :key="n"></icon>
            ({{ranking.votes}} r&ouml;ster)
          </p>
          <div v-if="recipeData.content != ''" v-html="recipeData.content"></div>

        </div>
      </div>

    </swipe-action-item>
  </div>
</template>

<script>
  import moment from 'moment'
  import SwipeActionItem from './SwipeActionItem'

  export default {
    name: "Recipe",
    components: { SwipeActionItem },
    props: ['recipeId','disableActions','hideEdit'],
    data() {
      return {
        recipeData: this.$store.getters.verifyRecipe(this.recipeId) ?  this.$store.getters.recipeById(this.recipeId) : {},
        editMode: false,
        createdMeal: false
      }
    },
    computed: {
      ranking() {
        let upValue = parseInt(this.recipeData.fields.upvotes || 0)+1
        let downValue = parseInt(this.recipeData.fields.downvotes || 0)+1
        let rankValue = (upValue - downValue) / (upValue + downValue)
        let score = (rankValue+1)*5/2
        return {
          votes: 0 + parseInt(this.recipeData.fields.upvotes || 0) + parseInt(this.recipeData.fields.downvotes || 0),
          score: score,
          stars: Math.round(score)
        }
      }
    },
    methods: {
      toggleEditMode() {
        console.log('hej')
        this.editMode = !this.editMode
      },
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
.recipeContent {
  padding: @bu/2 0;
}

.recipe {
  position: relative;
  margin: 0 @bu;
  padding: @bu @bu;
  border-radius: @bu/2;
  background: @colorBackground;
  box-shadow: 0 0 0 1px @colorBorder inset;
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
  &:last-child {
    margin-bottom: 0;
  }
  .ranking {
    font-size: @fusm;
    .capitals;
    .fa-icon {
      vertical-align: -.2em;
      margin-right: 0.2em;
      color: @colorYellow;
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
h3 {
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
