<template>
  <div class="add-meal">

    <add-recipe/>

    <form v-if="showForm">

      <h2>Lägg till måltid</h2>

      <input v-model="mealData.title" placeholder="Namn" v-if="selectedRecipes.length > 1"/>

      <multiselect placeholder="Namn eller sök recept" v-model="selectedRecipes" tag-placeholder="Lägg till utan recept" track-by="id" label="title" :options="recipes" :multiple="true" :taggable="true" @tag="noRecipe">
        <template slot="tag" slot-scope="props">
          <span class="multiselect__tag custom__tag">
            <span>{{ props.option.title }}</span>
            <span v-if="!props.option.id" @click="$emit('newrecipe', props.option.title)">
              <icon name="plus" />
            </span>
            <span @click="props.remove(props.option)">
              <icon name="close" />
            </span>
          </span>
        </template>
      </multiselect>

      <p class="capitals" v-if="!showComment" @click="showComment = !showComment">
        <icon name="comment"></icon> Lägg till Kommentar
      </p>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar" ref="comment" v-if="showComment"></textarea>

      <div class="saveBtnContainer">
        <span class="btn" @click="toggleForm()">Avbryt</span>
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
  import AddRecipe from './AddRecipe'
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
    components: { Recipe, AddRecipe, Multiselect },
    props: ['year','week'],
    data() {
      return {
        showForm: false,
        showComment: false,
        nonRecipes: [],
        mealData: JSON.parse(JSON.stringify(emptyMeal))
      }
    },
    computed: {
      ...mapGetters({
        'recipes': 'allRecipes'
      }),
      selectedRecipes: {
        get() {
          // Fetch the reciepes data
          let recipes = this.mealData.fields.recipes.map(id => this.$store.getters.recipeById(id))
          // Concat with non recipe tags
          return recipes.concat(this.nonRecipes)
        },
        set(newValue) {
          // Filter out recipes and set them in fields
          let recipes = newValue.filter(r => r.id != undefined)
          this.mealData.fields.recipes = recipes.map(recipe => recipe.id)
          // Update nonRecipes if any non recipe tag has been removed
          this.nonRecipes = newValue.filter(r => r.id === undefined)
        }
      }
    },
    watch: {
      // Update title if selectedRecipes changes
      selectedRecipes(newVal) {
        if (!newVal.length) {
          this.mealData.title = ""
        } else {
          this.mealData.title = newVal.map(r => r.title).join(' & ')
        }
      },
      // Set marker in comment field on show showComment (with small timeout to make sure field is showing when focused)
      showComment() {
        let _this = this
        setTimeout(() => {
          _this.$refs.comment.focus()
        }, 150)
      }
    },
    methods: {
      noRecipe(val) {
        this.nonRecipes.push({
          id: undefined,
          title: val
        })
      },
      toggleForm() {
        this.resetMealData()
        this.showForm = !this.showForm
      },
      saveMeal() {
        this.mealData.fields.date = moment().isoWeekYear( this.year ).isoWeek( this.week )
        this.$store.dispatch('updateMeal',{payload: this.mealData})
        this.resetMealData()
        this.toggleForm()
      },
      resetMealData() {
        this.showComment = false
        this.nonRecipes = []
        this.mealData = JSON.parse(JSON.stringify(emptyMeal))
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.add-meal {
  position: relative;
  .border-bottom;
  padding: @bu @bu*2;
  > div {
    .btn;
  }
  .saveBtnContainer {
    padding: @bu 0;
  }
}

.custom__tag {
  padding: .5rem 0.5rem;
  > span:not(:last-child) {
    margin-right: .25em;
  }
  .fa-icon {
    vertical-align: -0.125em;
    font-size: 1em;
  }
}
</style>
