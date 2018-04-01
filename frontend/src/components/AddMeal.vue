<template>
  <div class="add-meal">
    <form v-if="showForm">
      <div class="closeIcon" @click="toggleForm()">
        <icon name="times"></icon>
      </div>

      <h2>Lägg till måltid</h2>
      <multiselect placeholder="Sök recept eller skriv måltid" v-model="selectedRecipes" trackBy="id" label="title" :options="allTags" :multiple="true" :taggable="true" tag-placeholder="Spara utan recept" @tag="addTag" @remove="removeTag"></multiselect>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      <div class="saveBtnContainer">
        <span class="btn" @click="toggleForm()">Stäng</span>
        <span class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
      </div>

<!--
      <h2>Lägg till måltid</h2>
      <input v-model="mealData.title" placeholder="Namn"/>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      <multiselect placeholder="Recept" v-model="selectedRecipes" trackBy="id" label="title" :options="recipes" :multiple="true"></multiselect>
      <div class="saveBtnContainer">
        <span class="btn" @click="toggleForm()">Stäng</span>
        <span class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
      </div>
    -->
    </form>

    <div @click="toggleForm()" v-else>
      Lägg till måltid
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Recipe from './Recipe'
  import moment from 'moment'
  import Multiselect from 'vue-multiselect'

  var emptyMeal = {
    fields: {
      made: false,
      recipes: []
    },
    status: 'publish'
  }

  export default {
    name: "AddMeal",
    components: { Recipe, Multiselect },
    props: ['year','week'],
    data() {
      return {
        showForm: false,
        mealData: JSON.parse(JSON.stringify(emptyMeal)),
        extraTags: []
      }
    },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      }),
      allTags() {
        return this.extraTags.concat(this.recipes)
      },
      selectedRecipes: {
        get() {
          return this.extraTags.concat(this.mealData.fields.recipes.map(id => this.$store.getters.recipeById(id)))
        },
        set(newValue) {
          this.mealData.fields.recipes = newValue.filter(tag => tag.type != "tempTag").map(recipe => recipe.id)
        }
      },
    },
    methods: {
      toggleForm() {
        this.showForm = !this.showForm
      },
      saveMeal() {

        if(this.extraTags.length)
          this.mealData.title = this.extraTags[0].title
        else
          this.mealData.title = this.$store.getters.recipeById(this.mealData.fields.recipes[0]).title

        this.mealData.fields.date = moment().isoWeekYear( this.year ).isoWeek( this.week )
        this.$store.dispatch('updateMeal',{payload: this.mealData})
        this.mealData = JSON.parse(JSON.stringify(emptyMeal))
        this.extraTags = []
      },
      addTag(newTag) {
        this.extraTags.unshift({
          title: newTag,
          id: "t"+Math.floor(Math.random()*100),
          type: "tempTag"
        })
      },
      removeTag(tagToRemove) {
        if(tagToRemove.type == "tempTag")
          this.extraTags = this.extraTags.filter(tag => tag.id != tagToRemove.id)
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.add-meal {
  position: relative;
  z-index: 200;
  .border-bottom;
  padding: @bu @bu*2;
  > div {
    .btn;
  }
  .saveBtnContainer {
    padding: @bu 0;
  }
}
</style>
