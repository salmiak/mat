<template>
  <div class="add-meal">
    <form v-if="showForm">
      <div class="closeIcon" @click="toggleForm()">
        <icon name="times"></icon>
      </div>

      <h2>Lägg till måltid</h2>
      <input v-model="mealData.title" placeholder="Namn"/>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      <multiselect placeholder="Recept" v-model="selectedRecipes" trackBy="id" label="title" :options="recipes" :multiple="true"></multiselect>
      <div class="saveBtnContainer">
        <span class="btn" @click="toggleForm()">Stäng</span>
        <span class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
      </div>
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
        mealData: JSON.parse(JSON.stringify(emptyMeal))
      }
    },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      }),
      selectedRecipes: {
        get() {
          return this.mealData.fields.recipes.map(id => this.$store.getters.recipeById(id))
        },
        set(newValue) {
          this.mealData.fields.recipes = newValue.map(recipe => recipe.id)
        }
      },
    },
    methods: {
      toggleForm() {
        this.showForm = !this.showForm
      },
      saveMeal() {
        this.mealData.fields.date = moment().isoWeekYear( this.year ).isoWeek( this.week )
        this.$store.dispatch('updateMeal',{payload: this.mealData})
        this.mealData = JSON.parse(JSON.stringify(emptyMeal))
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.add-meal {
  position: relative;
  box-shadow: 0 -1px 0 0 @colorBorder inset, 0 1px 0 0 @colorBorder inset;
  padding: @bu @bu*2;
  > div {
    .btn;
  }
  .saveBtnContainer {
    padding: @bu 0;
  }
}

.closeIcon {
  position: absolute;
  top: @bu;
  right: @bu;
  line-height: @bu*3;
  height: @bu*3;
  width: @bu*3;
  .centerContent;
}

</style>
