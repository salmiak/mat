<template>
  <div class="editRecipe">
    <div>
      <input type="text" name="title" :placeholder="$t('Title')" v-model="recipe.title">
    </div>
    <div>
      <div v-if="recipe.fileUrl" style="position: relative; float:left; clear:both">
        <img :src="recipe.fileUrl" class="recipe-thumbnail" />
        <div class="toolbar">
          <sure-button @clicked="recipe.fileUrl = ''" type="i" class="fal fa-trash-alt"></sure-button>
        </div>
      </div>
      <upload v-else v-on:uploadStart="blockSave" v-on:uploadDone="fileAttached"></upload>
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
      <button v-if="!disableSave" class="btn-primary pull-right" @click="saveRecipe">{{$t('Save')}}</button>
      <span v-else class="pull-right">Laddar upp bild</span>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import VueMarkdown from 'vue-markdown'
import Upload from './Upload'
import SureButton from './SureButton'

var emptyData = {
  title: '',
  comment: '',
  url: '',
  fileUrl: ''
}

export default {
  name: 'EditRecipe',
  components: {VueMarkdown, Upload, SureButton},
  props: {
    recipeData: {
      default () {
        return cloneDeep(emptyData)
      }
    }
  },
  data () {
    return {
      textareaExpanded: false,
      recipe: {},
      commentHeight: 64,
      disableSave: false
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
    blockSave () {
      this.disableSave = true
    },
    fileAttached (e) {
      this.disableSave = false
      this.recipe.fileUrl = e.fileUrl
    },
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
      this.recipe = cloneDeep(this.recipeData)
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
  .recipe-thumbnail {
    max-width: 120px;
    height: auto;
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
