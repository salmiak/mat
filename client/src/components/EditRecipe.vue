<template>
  <div class="editRecipe">
    <div>
      <input type="text" name="title" :placeholder="$t('Title')" v-model="recipe.title">
    </div>
    <div>
      <input type="url" name="url" :placeholder="$t('Url')" v-model="recipe.url">
    </div>
    <div>
      <textarea :placeholder="$t('Comment')" v-model="recipe.comment" @focus="expandTextarea" @blur="collapsTextarea" @keydown="growTextarea" :style="commentStyle"></textarea>
      <pre class="textareameasure">{{recipe.comment}}</pre>
    </div>
    <div class="cardfooter">
      <button @click="cancelEdit">{{$t('Cancel')}}</button>
      <button class="btn-primary pull-right" @click="saveRecipe">{{$t('Save')}}</button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import VueMarkdown from 'vue-markdown'

var emptyData = {
  title: '',
  comment: '',
  url: ''
}

export default {
  name: 'EditRecipe',
  components: {VueMarkdown},
  props: {
    recipeData: {
      default () {
        return _.cloneDeep(emptyData)
      }
    }
  },
  data () {
    return {
      textareaExpanded: false,
      recipe: {},
      commentHeight: 64
    }
  },
  computed: {
    commentStyle () {
      if (this.textareaExpanded || this.recipe.comment) {
        return {'height': (this.commentHeight + 24) + 'px'}
      }
      return undefined
    }
  },
  created () {
    this.resetRecipe()
  },
  mounted () {
    this.resetRecipe()
  },
  methods: {
    expandTextarea (e) {
      this.growTextarea(e)
      this.textareaExpanded = true
    },
    collapsTextarea (e) {
      this.textareaExpanded = false
    },
    growTextarea (e) {
      this.commentHeight = Math.max(e.path[0].nextElementSibling.offsetHeight, 64)
    },
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
    height: calc(2.5rem + 2px);
    transition: height .3s;
  }
}
.textareameasure {
  position: absolute;
  top: 0;
  left: 100vw;
  width: calc(100% + @bu);
  margin: 0 -@bu/2 @bu/2;
  padding: @bu/2 @bu/2;
  border: 1px solid fade(@cBackground, 40%);
  border-radius: @radius;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.88rem;
  line-height: 1.5em;
  color: @cText;
  display: block;
  white-space: pre-line;
}
</style>
