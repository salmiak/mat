<template>
  <div class="add-meal">
    <form v-if="showForm">
      <div class="closeIcon" @click="toggleForm()">
        <icon name="times"></icon>
      </div>

      <h3>Lägg till måltid</h3>

      <multiselect placeholder="Börja skriva" v-model="selectedRecipes" trackBy="id" label="title" :options="allTags" :multiple="true" :taggable="true" tag-placeholder="Lägg till" @tag="addTag" @remove="removeTag" ref="search"></multiselect>

      <input v-if="showTitleField" v-model="mealData.title" placeholder="Namn" @blur="showTitleField=false" ref="title"/>
      <h2 v-else @click="showTitleField=true">{{mealData.title || "Måltid"}}</h2>

      <textarea v-if="showCommentField" v-model="mealData.fields.comment" placeholder="Kommentar" @blur="showCommentField=false" ref="comment" ></textarea>
      <p v-else @click="showCommentField=true">{{mealData.fields.comment || "Redigera kommentar"}}</p>

      <div class="recipeList">
        <recipe
          v-for="recipe in selectedRecipes"
          :key="recipe.id"
          :recipeId="recipe.id"
          :disableActions="true"
          :hideEdit="true"></recipe>
      </div>

      <div v-if="extraTags.length">
        <h3>Skapa nya recept</h3>
        <p v-for="tag in extraTags">
          <add-recipe-inline @saved="recipeAdded" @initiated="addingRecipes.push(1)" @canceled="addingRecipes.pop()" :tag="tag" />
        </p>
      </div>

      <div class="saveBtnContainer">
        <span class="btn" @click="toggleForm()">Stäng</span>
        <span v-if="!addingRecipes.length" class="btn btn-primary pull-right" @click="saveMeal()">Spara</span>
        <span v-else class="btn btn-disabled pull-right">Spara</span>
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
  import AddRecipeInline from './AddRecipeInline'
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
    components: { Recipe, AddRecipeInline, Multiselect },
    props: ['year','week'],
    data() {
      return {
        showForm: false,
        showCommentField: false,
        showTitleField: false,
        mealData: JSON.parse(JSON.stringify(emptyMeal)),
        extraTags: [],
        addingRecipes: []
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
          this.setTitle()
        }
      }
    },
    watch: {
      showForm(value) {
        if(value) {
          this.$nextTick( () => this.$refs.search.$el.focus() )
        }
      },
      showTitleField(value) {
        if(value) {
          this.$nextTick( () => this.$refs.title.focus() )
        }
      },
      showCommentField(value) {
        if(value) {
          this.$nextTick( () => this.$refs.comment.focus() )
        }
      }
    },
    methods: {
      toggleForm() {
        this.showForm = !this.showForm
        if (!this.showForm)
          this.resetForm()
      },
      resetForm() {
        this.showCommentField = false
        this.mealData = JSON.parse(JSON.stringify(emptyMeal))
        this.extraTags = []
        this.showTitleField = false
      },
      setTitle() {
        this.setComment()
        if(this.showTitleField)
          return // Set title manualy, don't touch it.
        if(this.extraTags.length) {
          this.mealData.title = this.extraTags[0].title
        } else {
          this.mealData.title = this.$store.getters.recipeById(this.mealData.fields.recipes[0]).title
        }
        let recipeCount = this.extraTags.length + this.mealData.fields.recipes.length
        if (recipeCount > 1) {
          this.mealData.title = this.mealData.title + " + " + (recipeCount-1) + " recept"
        }
      },
      setComment() {
        if(this.showCommentField)
          return // Set comment manualy, don't touch it.
        if(this.extraTags.length > 1) {
          this.mealData.fields.comment = this.extraTags.map(tag => tag.title).join('\n')
        }
      },
      saveMeal() {
        this.mealData.fields.date = moment().isoWeekYear( this.year ).isoWeek( this.week )
        this.$store.dispatch('updateMeal',{payload: this.mealData})
        this.toggleForm()
      },
      addTag(newTag) {
        this.extraTags.push({
          title: newTag,
          id: "t"+(new Date()).getTime(),
          type: "tempTag"
        })
        this.setTitle()
      },
      removeTag(tagToRemove) {
        if(tagToRemove.type == "tempTag")
          this.extraTags = this.extraTags.filter(tag => tag.id != tagToRemove.id)
      },
      recipeAdded(reponse) {
        this.mealData.fields.recipes.push(reponse.recipe.id)
        this.removeTag(reponse.tag)
        this.addingRecipes.pop()
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
  h2 {
    margin: @bu 0;
    padding: @bu 0;
  }
  h3 {
    margin: @bu 0;
    .capitals;
  }
  > div {
    .btn;
  }
  .saveBtnContainer {
    padding: @bu 0;
  }
  .recipeList {
    margin: @bu -@bu*2 0;
  }
}

</style>
