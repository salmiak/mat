<template>
  <div class="meal">
    <form v-if="editMode">
      <div class="closeIcon" @click="toggleEditMode()">
        <icon name="times"></icon>
      </div>

      <h2>
        Redigera måltid
        <span @click="deleteMeal()">
          <icon name="trash"></icon>
        </span>
      </h2>
      <input v-model="mealData.title" placeholder="Namn"/>
      <textarea v-model="mealData.fields.comment" placeholder="Kommentar"></textarea>
      <multiselect placeholder="Recept" v-model="selectedRecipes" trackBy="id" label="title" :options="recipes" :multiple="true"></multiselect>
      <p>
        <span class="pull-right btn" @click="toggleEditMode()">Stäng</span>
        <span class="btn btn-primary" @click="saveMeal()">Spara</span>
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
      <div class="cloneIcon" v-if="showCopyMeal" @click="copyToCurrentNextWeek()">
        <icon name="clone"></icon>
      </div>
      <div class="cloneIcon" v-if="mealCopied">
        <icon name="check"></icon>
      </div>
      <h2>
        {{mealData.title}}
        <span @click="moveToPrevWeek()">
          <icon name="arrow-left"></icon>
        </span>
        <span @click="moveToNextWeek()">
          <icon name="arrow-right"></icon>
        </span>
      </h2>
      <p v-html="mealData.fields.comment" v-if="mealData.fields.comment"></p>
      <ul class="recipeList" v-if="verifiedRecipes.length">
        <recipe v-for="recipe in verifiedRecipes" :key="recipe" v-bind:recipeId="recipe"></recipe>
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
        mealCopied: false
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
        if ( this.mealCopied )
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
        this.mealCopied = true
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/global.less";
.meal {
  position: relative;
  margin: 0;
  padding: 1em .3em;
  border-bottom: 1px solid fade(@colorPrimary, 12%);
  &:first-of-type {
    border-top: 1px solid fade(@colorPrimary, 12%);
  }
  &:hover {
    background: fade(@colorPrimary, 3%);
  }
  > form {
    padding: .2em .3em .5em;
    border-bottom: 1px solid fade(@colorPrimary, 12%);
    border-top: 1px solid fade(@colorPrimary, 12%);
    background: fade(@colorPrimary, 3%);
  }
}
.madeIcon, .editIcon, .cloneIcon {
  position: absolute;
  top: 1.15em;
  cursor: pointer;
  padding: .5em .5em .25em;
}
.madeIcon { left: -2em; }
.editIcon, .cloneIcon {
  opacity: 0;
  right: -2.3em;
}
.cloneIcon {
  top: 3.15em;
}
.meal:hover {
  .editIcon, .cloneIcon {
    opacity: 1;
  }
}
h2 {
  font-size: 1.2em;
  margin: .5em 0 .2em;
}
p {
  margin: 0 0 .5em;
  opacity: .54;
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

@import '../../node_modules/vue-multiselect/dist/vue-multiselect.min.css';
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
