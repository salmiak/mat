<template>
  <div class="editRecipe">
    <recipe-fields :recipe="recipe" @upload-start="uploading = true" @upload-done="uploading = false" />
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
import RecipeFields from './RecipeFields.vue'

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
}
</style>
