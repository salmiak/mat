<template>
  <div class="recipes">
    <header>
      <h1 class="text-center">{{ t('Recipes') }}</h1>
    </header>

    <new-recipe />

    <input type="search" v-model="searchTerm" :placeholder="t('Type to search')" />

    <recipe-card
      v-for="recipe in list"
      :key="recipe.id"
      :id="recipe.id"
      :data-letter="searchTerm ? undefined : letterOf(recipe.title)"
      :show-delete="true"
    />

    <nav v-if="!searchTerm && letters.length > 1" class="letterIndex" :class="{ visible: indexVisible }">
      <span v-for="letter in letters" :key="letter" @click="scrollToLetter(letter)">{{ letter }}</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
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

function letterOf (title: string): string {
  const first = (title.trim()[0] ?? '#').toLocaleUpperCase('sv')
  return /\p{Letter}/u.test(first) ? first : '#'
}

const letters = computed(() => {
  const seen: string[] = []
  for (const recipe of list.value) {
    const letter = letterOf(recipe.title)
    if (!seen.includes(letter)) seen.push(letter)
  }
  return seen
})

// The index shows while the page scrolls and fades away shortly after
const indexVisible = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | undefined

function showIndex () {
  indexVisible.value = true
  clearTimeout(hideTimeout)
  hideTimeout = setTimeout(() => {
    indexVisible.value = false
  }, 1800)
}

function scrollToLetter (letter: string) {
  document.querySelector(`[data-letter="${letter}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  showIndex()
}

onMounted(() => {
  document.title = 'Recept | Beckmans matsajt'
  recipesStore.loadRecipeList()
  window.addEventListener('scroll', showIndex, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', showIndex)
  clearTimeout(hideTimeout)
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

// Room for the fixed header when a letter is scrolled to
:deep(.recipe) {
  scroll-margin-top: 5.5rem;
}

.letterIndex {
  .noselect;
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 800;
  display: flex;
  flex-direction: column;
  padding: @bu/2 @bu/4 @bu/2 @bu/2;
  background: fade(@cRecipeBg, 85%);
  border-radius: @radius 0 0 @radius;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
  span {
    .capitals;
    color: @cPrimary;
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1.3;
    padding: 0.05rem 0.4rem;
    cursor: pointer;
    text-align: center;
    &:hover {
      color: darken(@cSecondary, 20%);
    }
  }
}
</style>
