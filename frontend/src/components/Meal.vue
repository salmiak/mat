<template>
  <div class="meal" v-bind:class="editMode?'meal-edit':''">
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
        <span class="btn btn-red" @click="deleteMeal()">Ta bort</span>
        <span class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
      </p>
    </form>

    <div v-else>
      <div class="iconContainer iconContainerLeft">
        <div class="actionIcon" @click="toggleMade()">
          <icon name="check-square-o" v-if="mealData.fields.made"></icon>
          <icon name="square-o" v-else></icon>
        </div>
      </div>

      <div class="iconContainer iconContainerRight">
        <div class="actionIcon" @click="toggleEditMode()">
          <icon name="edit"></icon>
        </div>
        <div class="actionIcon" v-if="showCopyMeal" @click="copyToCurrentNextWeek()">
          <icon name="clone"></icon>
        </div>
        <div class="actionIcon" v-if="createdMeal">
          <icon name="check"></icon>
        </div>
      </div>

      <div class="moveArrow moveArrowLeft" @click="moveToPrevWeek()">
        <icon name="arrow-left"></icon>
      </div>
      <div class="moveArrow moveArrowRight" @click="moveToNextWeek()">
        <icon name="arrow-right"></icon>
      </div>
      <h2>
        {{mealData.title}}
        <span v-if="createdMeal" class="createdNotification">Ny måltid skapad!</span>
      </h2>
      <p v-html="mealData.fields.comment" v-if="mealData.fields.comment"></p>
      <div class="recipeList" v-if="verifiedRecipes.length">
        <recipe v-for="recipe in verifiedRecipes" :key="recipe" v-bind:recipeId="recipe" v-bind:hideCreateMeal="true" v-bind:hideEdit="true"></recipe>
      </div>
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
  padding: @bu*1.5 @bu*5 @bu*4.5;
  position: relative;
  min-height: @bu*9;
  .border-bottom;

  &-edit {
    padding: @bu @bu*2;
  }
  .saveBtnContainer {
    padding: @bu 0;
    .btn-red {
      background: #F35;
    }
  }
}
.createdNotification {
}

.iconContainer {
  position: absolute;
  width: @bu*4;
  top: 0;
  bottom: 0;
  // background: fade(@colorPrimary, 3%);
  &Left { left: 0 }
  &Right { right: 0 }
  .centerContent;
}
.actionIcon {
  cursor: pointer;
  padding: @bu;
  width: @bu*4;
  height: @bu*4;
  .centerContent;
  color: fade(@colorPrimary, 30%);
}

.moveArrow {
  position: absolute;
  bottom: 0;
  padding: @bu;
  &Right {
    right: @bu*4;
  }
  &Left {
    left: @bu*4;
  }
}

.recipeList {
  margin: @bu 0 0;
}
</style>
