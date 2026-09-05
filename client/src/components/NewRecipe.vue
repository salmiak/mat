<template>
  <div class="recipe">
    <div v-if="expanded">
      <div class="toolbar">
        <i class="fal fa-times" @click="expanded = false"></i>
      </div>
      <h2>{{ t('Add Recipe') }}</h2>
      <edit-recipe @save-recipe="addRecipe" @cancel-edit="expanded = false" />
    </div>
    <div v-else>
      <button @click="expanded = true">{{ t('Add Recipe') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRecipesStore } from '@/stores/recipes'
import type { NewRecipe } from '@/types'
import EditRecipe from './EditRecipe.vue'

const { t } = useI18n()
const recipesStore = useRecipesStore()
const expanded = ref(false)

async function addRecipe (recipeData: NewRecipe) {
  await recipesStore.addRecipe(recipeData)
  expanded.value = false
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.recipe {
  background: @cRecipeBg;
  padding: @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu/2 auto;
  position: relative;
  h1 {
    margin-top: 8px;
  }
}
</style>
