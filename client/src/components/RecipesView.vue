<template>
  <div class="recipes">
    <header>
      <h1 class="text-center">{{ t('Recipes') }}</h1>
    </header>

    <new-recipe />

    <input type="search" v-model="searchTerm" :placeholder="t('Type to search')" />

    <recipe-card v-for="recipe in list" :key="recipe.id" :id="recipe.id" :show-delete="true" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'
import { useRecipesStore } from '@/stores/recipes'
import RecipeCard from './RecipeCard.vue'
import NewRecipe from './NewRecipe.vue'

const { t } = useI18n()
const recipesStore = useRecipesStore()
const searchTerm = ref('')

const fuse = computed(() => new Fuse(recipesStore.list, { keys: ['title', 'comment'] }))

const list = computed(() => {
  if (searchTerm.value) {
    return fuse.value.search(searchTerm.value).map((result) => result.item)
  }
  return [...recipesStore.list].sort((a, b) => a.title.localeCompare(b.title, 'sv'))
})

onMounted(() => {
  document.title = 'Recept | Beckmans matsajt'
  recipesStore.loadRecipeList()
})
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
input {
  width: calc(100% - @bu - 4px);
  border: none;
  max-width: 25rem;
  margin: 0 auto;
  background: @cMealBg;
  &:focus {
    background: @cRecipeBg;
  }
}
</style>
