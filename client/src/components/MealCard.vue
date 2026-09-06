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
        <span v-if="meal.made"><Square :size="18" /> {{ t('Not made') }}</span>
        <span v-else><SquareCheck :size="18" /> {{ t('Made') }}</span>
      </template>
      <template #rightsecondary>
        <span v-if="meal.made"><Copy :size="18" /> {{ t('Copy') }}</span>
        <span v-else><ArrowRight :size="18" /> {{ t('Move') }}</span>
      </template>
      <template #leftprimary>
        <span><Pencil :size="18" /> {{ t('Edit') }}</span>
      </template>
      <template #leftsecondary>
        <span><ArrowLeft :size="18" /> {{ t('Move') }}</span>
      </template>

      <div class="mealContent">
        <div v-if="!meal.made">
          <h2><Square :size="18" /> {{ meal.title }}</h2>

          <expander-box v-if="meal.comment && meal.comment.length > 70" class="comment">
            <markdown-text :source="meal.comment" />
          </expander-box>
          <markdown-text v-if="meal.comment && meal.comment.length <= 70" class="comment" :source="meal.comment" />

          <recipe-content v-for="recipeId in meal.recipeIds" :key="recipeId" :id="recipeId" />
        </div>

        <div v-if="meal.made" class="madeRow">
          <!-- Icon and title on one line: Vue condenses away whitespace
               that contains a newline between elements -->
          <h2><SquareCheck :size="18" /> <span class="text-disabled">{{ meal.title }}</span></h2>
          <vote-buttons :meal="meal" />
        </div>
      </div>
    </swipe-action-item>

    <div v-if="editMode" class="mealContent">
      <div class="toolbar">
        <sure-button class="iconBtn" @clicked="mealsStore.deleteMeal(meal.id)"><Trash2 :size="16" /></sure-button>
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
import VoteButtons from './VoteButtons.vue'
import { ArrowLeft, ArrowRight, Copy, Pencil, Square, SquareCheck, Trash2 } from 'lucide-vue-next'

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
    svg {
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
.madeRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @bu/2;
  h2 {
    padding-right: 0;
  }
}
</style>
