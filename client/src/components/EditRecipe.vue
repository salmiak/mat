<template>
  <div class="editRecipe">
    <div>
      <input type="text" name="title" :placeholder="t('Title')" v-model="recipe.title">
    </div>
    <div>
      <div v-if="recipe.imageUrl" style="position: relative; float: left; clear: both">
        <img :src="recipe.imageUrl" class="recipe-thumbnail" />
        <div class="toolbar">
          <sure-button type="i" class="fal fa-trash-alt" @clicked="recipe.imageUrl = null"></sure-button>
        </div>
      </div>
      <image-upload v-else @upload-start="uploading = true" @upload-done="imageAttached" />
    </div>
    <div>
      <input type="url" name="url" :placeholder="t('Url')" v-model="recipe.url">
    </div>
    <div>
      <growing-textarea :placeholder="t('Comment')" v-model="recipe.comment" />
    </div>
    <div class="cardfooter">
      <button @click="cancelEdit">{{ t('Cancel') }}</button>
      <button v-if="!uploading" class="btn-primary pull-right" @click="saveRecipe">{{ t('Save') }}</button>
      <span v-else class="pull-right">{{ t('Uploading image') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NewRecipe } from '@/types'
import ImageUpload from './ImageUpload.vue'
import SureButton from './SureButton.vue'
import GrowingTextarea from './GrowingTextarea.vue'

const props = defineProps<{ recipeData?: Partial<NewRecipe> }>()

const emit = defineEmits<{
  'save-recipe': [NewRecipe]
  'cancel-edit': []
}>()

const { t } = useI18n()
const uploading = ref(false)
const recipe = ref<NewRecipe>(freshRecipe())

function freshRecipe (): NewRecipe {
  return {
    title: '',
    comment: '',
    url: '',
    imageUrl: null,
    ...props.recipeData
  }
}

watch(() => props.recipeData, () => { recipe.value = freshRecipe() })

function imageAttached (e: { imageUrl: string }) {
  uploading.value = false
  recipe.value.imageUrl = e.imageUrl || null
}

function cancelEdit () {
  recipe.value = freshRecipe()
  emit('cancel-edit')
}

function saveRecipe () {
  emit('save-recipe', recipe.value)
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.editRecipe {
  padding: @bu/2 0 0;
  h3 {
    margin: @bu 0 @bu/2;
  }
  p {
    margin: 0 0 @bu/2;
  }
  .recipe-thumbnail {
    max-width: 120px;
    height: auto;
  }
}
</style>
