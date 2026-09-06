<template>
  <div class="recipe">
    <div v-if="!recipe">
      Something is wrong with this recipe
    </div>
    <div v-else>
      <swipe-action-item
        v-if="!editMode"
        :right-actions="1"
        :left-actions="1"
        @rightprimary="mealFromRecipe"
        @leftprimary="editMode = true"
      >
        <template #rightprimary>
          <span><i class="fal fa-plus-square"></i> {{ t('Add meal') }}</span>
        </template>
        <template #leftprimary>
          <span><i class="fal fa-edit"></i> {{ t('Edit') }}</span>
        </template>

        <recipe-content :id="id" />
      </swipe-action-item>

      <div v-if="editMode" class="recipeContent">
        <div class="toolbar">
          <sure-button v-if="showDelete" type="i" class="fal fa-trash-alt" @clicked="recipesStore.deleteRecipe(recipe.id)"></sure-button>
        </div>

        <h2>{{ t('Edit recipe') }}</h2>
        <edit-recipe :recipe-data="recipe" @save-recipe="updateRecipe" @cancel-edit="editMode = false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { addWeeks, formatISO, startOfISOWeek } from 'date-fns'
import { useRecipesStore } from '@/stores/recipes'
import { useMealsStore } from '@/stores/meals'
import type { NewRecipe } from '@/types'
import EditRecipe from './EditRecipe.vue'
import RecipeContent from './RecipeContent.vue'
import SureButton from './SureButton.vue'
import SwipeActionItem from './SwipeActionItem.vue'

const props = defineProps<{
  id: number
  showDelete?: boolean
}>()

const { t } = useI18n()
const recipesStore = useRecipesStore()
const mealsStore = useMealsStore()
const editMode = ref(false)

const recipe = computed(() => recipesStore.recipeById(props.id))

async function updateRecipe (recipeData: NewRecipe) {
  if (!recipe.value) return
  await recipesStore.updateRecipe({ ...recipeData, id: recipe.value.id })
  editMode.value = false
}

async function mealFromRecipe () {
  if (!recipe.value) return
  await mealsStore.addMeal({
    recipeIds: [recipe.value.id],
    title: recipe.value.title,
    comment: '',
    made: false,
    index: 0,
    date: formatISO(startOfISOWeek(addWeeks(new Date(), 1)), { representation: 'date' })
  })
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.recipe {
  position: relative;
  width: 95%;
  max-width: @bu * 25;
  overflow: hidden;
  border-radius: @radius;
  margin: @bu/2 auto;
  h2 {
    padding-right: @bu*2 * 3;
    &:not(:last-child) {
      margin-bottom: @bu/2;
    }
  }
}
// Applies both to the edit container and to the displayed RecipeContent
// root (child roots carry the parent scope). The descendant selector keeps
// the specificity above RecipeContent's own white defaults, so the blue
// background and matching fade color win regardless of CSS order.
.recipe .recipeContent {
  background: @cMealBg;
  --expander-bg: @cMealBg;
  padding: @bu;
  border-radius: @radius;
}
</style>
