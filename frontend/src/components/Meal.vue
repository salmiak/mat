<template>
  <div class="meal">
    <form v-if="editMode">
      <div class="closeIcon" @click="toggleEditMode()">
        <icon name="times"></icon>
      </div>

      <h2>
        Redigera måltid
      </h2>
      <input v-model="mealData.title" placeholder="Namn"/>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      <multiselect placeholder="Recept" v-model="selectedRecipes" trackBy="id" label="title" :options="recipes" :multiple="true"></multiselect>
      <p class="saveBtnContainer">
        <span class="btn" @click="toggleEditMode()">Stäng</span>
        <span class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
      </p>
    </form>

    <div v-else>
      <div class="madeIcon" @click="toggleMade()">
        <icon name="check-square-o" v-if="mealData.fields.made"></icon>
        <icon name="square-o" v-else></icon>
      </div>
      <div class="editIcon" @click="toggleEditMode()">
        <icon name="edit"></icon>
      </div>
      <div class="deleteIcon" @click="deleteMeal()">
        <icon name="trash"></icon>
      </div>
      <div class="cloneIcon" v-if="showCopyMeal" @click="copyToCurrentNextWeek()">
        <icon name="clone"></icon>
      </div>
      <div class="cloneIcon" v-if="createdMeal">
        <icon name="check"></icon>
      </div>
      <h2>
        {{mealData.title}}
        <span v-if="createdMeal" class="createdNotification">Ny måltid skapad!</span>
        <span @click="moveToPrevWeek()">
          <icon name="arrow-left"></icon>
        </span>
        <span @click="moveToNextWeek()">
          <icon name="arrow-right"></icon>
        </span>
      </h2>
      <p v-html="mealData.fields.comment" v-if="mealData.fields.comment"></p>
      <ul class="recipeList" v-if="verifiedRecipes.length">
        <recipe v-for="recipe in verifiedRecipes" :key="recipe" v-bind:recipeId="recipe" v-bind:hideCreateMeal="true"></recipe>
      </ul>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import moment from 'moment'
  import Multiselect from 'vue-multiselect'
  import Recipe from './Recipe'

  export default {
    name: "Meal",
    components: { Recipe,Multiselect },
    props: ['mealId'],
    data() {
      return {
        mealData: this.$store.getters.mealById(this.mealId),
        editMode: false,
        createdMeal: false
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
      verifiedRecipes() {
        return this.mealData.fields.recipes && this.mealData.fields.recipes.filter(id => this.$store.getters.verifyRecipe(id))
      },
      showCopyMeal() {
        if ( this.createdMeal )
          return false  // Don't show for meals copied this session
        if ( !this.$route.params.week && !this.$route.params.year )
          return false  // If route params not set, we're on home route

        let currentDate = moment().isoWeekYear(this.$store.getters.currentYear).isoWeek(this.$store.getters.currentWeek)
        let testedDate = moment().isoWeekYear(this.$route.params.year).isoWeek(this.$route.params.week)

        // Show for dates before current week
        return currentDate >= testedDate
      }
    },
    methods: {
      toggleEditMode() {
        this.editMode = !this.editMode
      },
      toggleMade() {
        this.mealData.fields.made = !this.mealData.fields.made
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
      },
      saveMeal() {
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
        this.editMode = false
      },
      deleteMeal() {
        this.$store.dispatch('deleteMeal', {id: this.mealData.id})
      },
      moveToPrevWeek() {
        if(this.mealData.fields.date){
          this.mealData.fields.date = moment(this.mealData.fields.date).subtract(1, 'w')
        }
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
      },
      moveToNextWeek() {
        if(this.mealData.fields.date){
          this.mealData.fields.date = moment(this.mealData.fields.date).add(1, 'w')
        }
        this.$store.dispatch('updateMeal',{id: this.mealData.id})
      },
      copyToCurrentNextWeek() {
        var mealClone = JSON.parse(JSON.stringify(this.mealData))
        delete mealClone.id
        delete mealClone.fields.made
        delete mealClone.date
        mealClone.fields.date = moment().isoWeekYear( this.$store.getters.currentYear ).isoWeek( this.$store.getters.currentWeek ).add(1, 'w')
        this.$store.dispatch('updateMeal',{payload: mealClone})
        this.createdMeal = true
        var _this = this
        setTimeout(() => _this.createdMeal = false, 4000)
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  padding: @bu @bu*2;
  position: relative;
  .border-bottom;
  .saveBtnContainer {
    padding: @bu 0;
  }
}
.createdNotification {
}

.madeIcon, .editIcon, .cloneIcon, .deleteIcon {
  position: absolute;
  top: .15em;
  cursor: pointer;
  padding: .5em .5em .25em;
}
.madeIcon { left: -2em; }
.editIcon, .cloneIcon, .deleteIcon {
  opacity: 0;
  right: .3em;
}
.deleteIcon {
  top: 1.5em;
}
.cloneIcon {
  top: 3.15em;
}
.meal:hover {
  .editIcon, .cloneIcon, .deleteIcon {
    opacity: 1;
  }
}
ul.recipeList {
  margin: .6em 0 0;
  padding: 0;
  li {
    list-style: none;
  }
}

.closeIcon {
  position: absolute;
  top: .35em;
  left: -2em;
  cursor: pointer;
  padding: .5em .5em .25em;
}
</style>
