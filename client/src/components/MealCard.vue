<template>
  <div class="meal">
    <swipe-action-item
      v-if="!editMode"
      :right-actions="2"
      :left-actions="2"
      @rightprimary="toggleMade"
      @rightsecondary="toNextWeek"
      @leftprimary="editMode = !editMode"
      @leftsecondary="moveToPrevWeek"
    >
      <template #rightprimary>
        <span v-if="meal.made"><i class="fal fa-square"></i> {{ t('Not made') }}</span>
        <span v-else><i class="fal fa-check-square"></i> {{ t('Made') }}</span>
      </template>
      <template #rightsecondary>
        <span v-if="meal.made"><i class="fal fa-copy"></i> {{ t('Copy') }}</span>
        <span v-else><i class="fal fa-arrow-right"></i> {{ t('Move') }}</span>
      </template>
      <template #leftprimary>
        <span><i class="fal fa-edit"></i> {{ t('Edit') }}</span>
      </template>
      <template #leftsecondary>
        <span><i class="fal fa-arrow-left"></i> {{ t('Move') }}</span>
      </template>

      <div class="mealContent">
        <div v-if="!meal.made">
          <h2><i class="fal fa-square"></i> {{ meal.title }}</h2>

          <expander-box v-if="meal.comment && meal.comment.length > 70" class="comment">
            <markdown-text :source="meal.comment" />
          </expander-box>
          <markdown-text v-if="meal.comment && meal.comment.length <= 70" class="comment" :source="meal.comment" />

          <recipe-content v-for="recipeId in meal.recipeIds" :key="recipeId" :id="recipeId" />
        </div>

        <div v-if="meal.made">
          <h2>
            <i class="fal fa-check-square"></i>
            <span class="text-disabled">{{ meal.title }}</span>
          </h2>
        </div>
      </div>
    </swipe-action-item>

    <div v-if="editMode" class="mealContent">
      <div class="toolbar">
        <sure-button type="i" class="fal fa-trash-alt" @clicked="mealsStore.deleteMeal(meal.id)"></sure-button>
      </div>
      <h2>{{ t('Edit meal') }}</h2>
      <edit-meal :meal-data="meal" @save-meal="updateMeal" @cancel-edit="editMode = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { addWeeks, formatISO, parseISO, startOfISOWeek } from 'date-fns'
import { useMealsStore } from '@/stores/meals'
import type { Meal, NewMeal } from '@/types'
import RecipeContent from './RecipeContent.vue'
import EditMeal from './EditMeal.vue'
import SureButton from './SureButton.vue'
import ExpanderBox from './ExpanderBox.vue'
import MarkdownText from './MarkdownText.vue'
import SwipeActionItem from './SwipeActionItem.vue'

const props = defineProps<{ meal: Meal }>()

const { t } = useI18n()
const mealsStore = useMealsStore()
const editMode = ref(false)

async function updateMeal (mealData: NewMeal) {
  await mealsStore.updateMeal({ ...props.meal, ...mealData, id: props.meal.id })
  editMode.value = false
}

function shiftWeeks (weeks: number) {
  return updateMeal({
    ...props.meal,
    date: formatISO(addWeeks(parseISO(props.meal.date), weeks), { representation: 'date' })
  })
}

function moveToPrevWeek () {
  shiftWeeks(-1)
}

async function toNextWeek () {
  if (props.meal.made) {
    // A made meal is copied to next week instead of moved
    await mealsStore.addMeal({
      ...props.meal,
      id: undefined,
      made: false,
      date: formatISO(startOfISOWeek(addWeeks(new Date(), 1)), { representation: 'date' })
    })
  } else {
    await shiftWeeks(1)
  }
}

function toggleMade () {
  updateMeal({ ...props.meal, made: !props.meal.made })
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.meal {
  position: relative;
  width: 95%;
  max-width: @bu * 25;
  overflow: hidden;
  border-radius: @radius;
  margin: @bu/2 auto;
  h2 {
    padding-right: calc(5rem);
    margin: 0 0 @bu/2;
    .noselect;
    .fal {
      color: @cText;
    }
  }
  h2:last-child {
    margin-bottom: 0;
  }
}
.mealContent {
  background: @cMealBg;
  --expander-bg: @cMealBg;
  padding: @bu;
  border-radius: @radius;
}
</style>
