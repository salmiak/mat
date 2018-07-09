<template>
  <div class="editRecipe">
    <div>
      <input type="text" name="title" placeholder="Title" v-model="recipe.title">
    </div>
    <div>
      <input type="url" name="url" placeholder="Url" v-model="recipe.url">
    </div>
    <div>
      <textarea placeholder="Comment" v-model="recipe.comment" @focus="expandTextarea = true" @blur="expandTextarea = (recipe.comment && recipe.comment.length !== 0)" :class="{collapsed: !expandTextarea}"></textarea>
    </div>
    <div class="clear">
      <button @click="cancelEdit">Cancel</button>
      <button class="btn-primary pull-right" @click="saveRecipe">Save</button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

var emptyData = {
  title: '',
  comment: '',
  url: ''
}

export default {
  name: 'EditRecipe',
  props: {
    recipeData: {
      default () {
        return _.cloneDeep(emptyData)
      }
    }
  },
  data () {
    return {
      expandTextarea: false,
      recipe: {}
    }
  },
  created () {
    this.resetRecipe()
  },
  mounted () {
    this.resetRecipe()
  },
  methods: {
    resetRecipe () {
      this.recipe = _.cloneDeep(this.recipeData)
    },
    cancelEdit  () {
      this.resetRecipe()
      this.$emit('cancel-edit')
    },
    saveRecipe () {
      this.$emit('save-recipe', this.recipe)
    }
  }
}
</script>
<style lang="less" scoped>
@import "../assets/global.less";
.editRecipe {
  padding: @bu/2 0 0;
  h3 {
    margin: @bu 0 @bu/2;
  }
  p {
    margin: 0 0 @bu/2;
  }
  textarea{
    height: 8rem;
    transition: height .3s;
    &.collapsed {
      height: calc(2.5em + 2px);
    }
  }
}
</style>
