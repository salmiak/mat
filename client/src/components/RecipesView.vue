<template>
  <div class="recipes">
    <header>
      <h1 class="text-center">{{ t('Recipes') }}</h1>
    </header>

    <new-recipe />

    <input type="search" v-model="searchTerm" :placeholder="t('Type to search')" />

    <!-- Search results are a flat list; the browsable list is grouped
         under sticky letter dividers -->
    <div v-if="searchTerm" class="cards">
      <recipe-card v-for="recipe in list" :key="recipe.id" :id="recipe.id" :show-delete="true" />
    </div>
    <section v-else v-for="group in groups" :key="group.letter" class="letterSection" :data-letter="group.letter">
      <h3 class="letterHeading"><span>{{ group.letter }}</span></h3>
      <div class="cards">
        <recipe-card v-for="recipe in group.recipes" :key="recipe.id" :id="recipe.id" :show-delete="true" />
      </div>
    </section>

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

// The list is already sorted, so consecutive titles share their letter
const groups = computed(() => {
  const out: Array<{ letter: string, recipes: typeof list.value }> = []
  for (const recipe of list.value) {
    const letter = letterOf(recipe.title)
    if (out[out.length - 1]?.letter !== letter) out.push({ letter, recipes: [] })
    out[out.length - 1].recipes.push(recipe)
  }
  return out
})

const letters = computed(() => groups.value.map((group) => group.letter))

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

:deep(.recipe) {
  // Skip layout/paint of offscreen cards — makes long lists cheap to
  // render and scroll without changing what's in the DOM
  content-visibility: auto;
  contain-intrinsic-size: auto 9rem;
}

// Room for the fixed header when a letter is scrolled to
.letterSection {
  scroll-margin-top: 5rem;
}

// Divider per first letter, sticky just below the fixed header so the
// current letter stays visible while scrolling through the list
.letterHeading {
  .noselect;
  position: sticky;
  top: 5rem;
  z-index: 700;
  width: 95%;
  max-width: @bu * 25;
  margin: @bu auto 0;
  display: flex;
  align-items: center;
  gap: @bu/2;
  span {
    .capitals;
    color: @cPrimary;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.4rem;
    min-width: 1.4rem;
    text-align: center;
    background: fade(@cRecipeBg, 85%);
    border-radius: @radius;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
  }
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid fade(@cPrimary, 25%);
  }
}

// Wide screens: the cards sit side by side in a grid
@media @wide {
  .recipes {
    max-width: @wideMax;
    margin: 0 auto;
    padding: 0 @bu;
  }
  .letterHeading {
    width: 100%;
    max-width: none;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(@bu * 19, 1fr));
    column-gap: @bu;
    align-items: start;
    :deep(.recipe) {
      width: 100%;
      max-width: none;
      margin: @bu/2 0;
    }
  }
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
