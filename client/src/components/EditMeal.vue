<template>
  <div class="editMeal">
    <div>
      <input type="text" name="title" :placeholder="t('Title')" v-model="meal.title">
    </div>
    <div>
      <growing-textarea :placeholder="t('Comment')" v-model="meal.comment" />
    </div>
    <div>
      <div class="searchField">
        <Search class="searchIcon" :size="16" />
        <input
          type="search"
          v-model="recipeSearchTerm"
          :placeholder="t('Type to search current recipes')"
          @focus="recipeSearchTerm = recipeSearchTerm || meal.title"
        />
      </div>
      <ul v-if="recipeResultsNotSelected.length">
        <li v-for="recipe in recipeResultsNotSelected.slice(sliceStart, sliceEnd + 1)" :key="recipe.id" @click="selectRecipe(recipe.id)">
          <div class="btn btn-sm pull-right">{{ t('Add') }}</div>
          {{ recipe.title }}
        </li>
        <li v-if="sliceEnd < recipeResultsNotSelected.length" class="text-center">
          <span class="btn btn-sm" @click.stop="resultPage++">{{ t('Show more results') }}</span>
        </li>
      </ul>
      <p v-if="recipeSearchTerm && recipeResultsNotSelected.length === 0">
        {{ t('No results') }}
      </p>
    </div>

    <h3 v-if="selectedRecipes.length || newRecipes.length">{{ t('Recipes') }}</h3>

    <div v-if="selectedRecipes.length">
      <ul>
        <li v-for="recipe in selectedRecipes" :key="recipe.id">
          <span class="btn btn-sm pull-right" @click="removeRecipe(recipe.id)">{{ t('Remove') }}</span>
          {{ recipe.title }}
        </li>
      </ul>
    </div>

    <div v-if="!recipeSearchTerm">
      <div v-for="(recipe, index) in newRecipes" :key="recipe.tmpId" class="recipe">
        <div class="toolbar">
          <X class="iconBtn pull-right" :size="16" @click="removeNewRecipe(index)" />
        </div>
        <h3>{{ t('Create new recipe') }}</h3>
        <recipe-fields
          :recipe="recipe"
          @upload-start="uploadsInProgress++"
          @upload-done="uploadsInProgress--"
          @title-autofilled="meal.title = meal.title || $event"
          @existing-recipe="useExistingRecipe(index, $event)"
        />
      </div>
      <button @click="addNewRecipe"><Plus :size="14" /> {{ t('Create new recipe') }}</button>
    </div>

    <div class="cardfooter">
      <button @click="cancelEdit">{{ t('Cancel') }}</button>
      <button v-if="uploadsInProgress < 1" class="btn-primary pull-right" @click="saveMeal">{{ t('Save') }}</button>
      <span v-else class="pull-right">{{ t('Uploading image') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'
import { formatISO, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns'
import { useRecipesStore } from '@/stores/recipes'
import type { NewMeal, NewRecipe } from '@/types'
import GrowingTextarea from './GrowingTextarea.vue'
import RecipeFields from './RecipeFields.vue'
import { Plus, Search, X } from 'lucide-vue-next'

type DraftRecipe = NewRecipe & { tmpId: number }

const props = defineProps<{
  week?: number
  year?: number
  mealData?: Partial<NewMeal>
  resetOnSave?: boolean
}>()

const emit = defineEmits<{
  'save-meal': [NewMeal]
  'cancel-edit': []
}>()

const { t } = useI18n()
const recipesStore = useRecipesStore()

const RESULTS_PER_PAGE = 5

const recipeSearchTerm = ref('')
const resultPage = ref(0)
const uploadsInProgress = ref(0)
const newRecipes = ref<DraftRecipe[]>([])
const meal = ref<NewMeal>(freshMeal())

function freshMeal (): NewMeal {
  return {
    title: '',
    comment: '',
    recipeIds: [],
    made: false,
    index: 0,
    date: '',
    ...props.mealData,
    // never share the array with the prop object
    ...(props.mealData?.recipeIds ? { recipeIds: [...props.mealData.recipeIds] } : {})
  }
}

watch(() => props.mealData, () => resetMeal())
watch(recipeSearchTerm, () => { resultPage.value = 0 })

const fuse = computed(() => new Fuse(recipesStore.list, { keys: ['title', 'comment'] }))

const recipeResults = computed(() => {
  if (!recipeSearchTerm.value) return []
  return fuse.value.search(recipeSearchTerm.value).map((result) => result.item)
})

const recipeResultsNotSelected = computed(() =>
  recipeResults.value.filter((recipe) => !meal.value.recipeIds.includes(recipe.id))
)

const selectedRecipes = computed(() =>
  meal.value.recipeIds
    .map((id) => recipesStore.recipeById(id))
    .filter((recipe) => recipe !== undefined)
)

const sliceStart = computed(() => resultPage.value * RESULTS_PER_PAGE)
const sliceEnd = computed(() => (resultPage.value + 1) * RESULTS_PER_PAGE)

const date = computed(() => {
  if (meal.value.date) {
    return meal.value.date
  }
  let base = new Date()
  if (props.week && props.year) {
    base = setISOWeek(setISOWeekYear(base, props.year), props.week)
  }
  return formatISO(startOfISOWeek(base), { representation: 'date' })
})

function addNewRecipe () {
  newRecipes.value.push({
    title: meal.value.title,
    comment: '',
    url: '',
    imageUrl: null,
    tmpId: Date.now()
  })
}

function removeNewRecipe (index: number) {
  newRecipes.value.splice(index, 1)
}

// The draft's url turned out to belong to a saved recipe: attach that one
// to the meal instead of creating a duplicate
function useExistingRecipe (index: number, recipe: { id: number, title: string }) {
  newRecipes.value.splice(index, 1)
  if (!meal.value.recipeIds.includes(recipe.id)) {
    meal.value.recipeIds.push(recipe.id)
  }
  meal.value.title = meal.value.title || recipe.title
}

function selectRecipe (id: number) {
  meal.value.recipeIds.push(id)
  meal.value.title = meal.value.title || recipesStore.recipeById(id)?.title || ''
  recipeSearchTerm.value = ''
}

function removeRecipe (id: number) {
  meal.value.recipeIds = meal.value.recipeIds.filter((recipeId) => recipeId !== id)
}

function resetMeal () {
  meal.value = freshMeal()
  newRecipes.value = []
  recipeSearchTerm.value = ''
}

function cancelEdit () {
  resetMeal()
  emit('cancel-edit')
}

async function saveMeal () {
  // Create any drafted new recipes first, then attach their ids to the meal
  while (newRecipes.value.length > 0) {
    const draft = newRecipes.value.pop() as DraftRecipe
    const recipe = await recipesStore.addRecipe(draft)
    meal.value.recipeIds.push(recipe.id)
  }
  meal.value.date = date.value
  emit('save-meal', meal.value)
  if (props.resetOnSave) {
    resetMeal()
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.editMeal {
  padding: @bu/2 0 0;
  .searchField {
    position: relative;
    // The magnifying glass sits inside the field, left of the text
    .searchIcon {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      color: fade(@cPrimary, 40%);
      pointer-events: none;
    }
    input {
      padding-left: @bu*1.5;
    }
  }
  h3 {
    margin: @bu 0 @bu/2;
  }
  p {
    margin: 0 0 @bu/2;
  }
  ul {
    margin: 0 -@bu/2 @bu/2;
  }
  li {
    padding: @bu/2 @bu/2;
    border-radius: @radius;
    clear: both;
    cursor: pointer;
    &:first-child {
      padding-top: 0;
    }
    &:nth-child(2n) {
      background: lighten(@cMealBg, 3%);
    }
  }
}
.recipe {
  position: relative;
  background: @cRecipeBg;
  padding: @bu @bu @bu/2;
  border-radius: @radius;
  width: auto;
  margin: @bu/2 -@bu/2;
  h3 {
    margin-top: 0;
    line-height: @bu;
  }
}
</style>
