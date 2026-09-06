<template>
  <div class="week">
    <header>
      <router-link class="weekNav" :to="{ name: 'Week', params: { week: prevWeek.week, year: prevWeek.year } }">
        <ArrowLeft :size="18" />
      </router-link>
      <h1>
        <router-link v-if="!isCurrentWeek" to="/week">{{ t('Week') }} {{ week }}</router-link>
        <router-link v-else :to="{ name: 'Week', params: { week: nextWeek.week, year: nextWeek.year } }">{{ t('This week') }}</router-link>
      </h1>
      <router-link class="weekNav" :to="{ name: 'Week', params: { week: nextWeek.week, year: nextWeek.year } }">
        <ArrowRight :size="18" />
      </router-link>
    </header>

    <new-meal :week="week" :year="year" />

    <meal-card v-for="meal in mealsInCurrentWeek" :key="meal.id" :meal="meal" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { addWeeks, getISOWeek, getISOWeekYear, setISOWeek, setISOWeekYear, startOfISOWeek } from 'date-fns'
import { useMealsStore } from '@/stores/meals'
import { useRecipesStore } from '@/stores/recipes'
import type { WeekRef } from '@/types'
import MealCard from './MealCard.vue'
import NewMeal from './NewMeal.vue'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
const { t } = useI18n()
const mealsStore = useMealsStore()
const recipesStore = useRecipesStore()

const week = computed(() => Number(route.params.week) || getISOWeek(new Date()))
const year = computed(() => Number(route.params.year) || getISOWeekYear(new Date()))

const isCurrentWeek = computed(() =>
  week.value === getISOWeek(new Date()) && year.value === getISOWeekYear(new Date())
)

const currentWeek = computed<WeekRef>(() => ({ week: week.value, year: year.value }))

function shiftWeek (delta: number): WeekRef {
  const base = startOfISOWeek(setISOWeek(setISOWeekYear(new Date(), year.value), week.value))
  const shifted = addWeeks(base, delta)
  return { week: getISOWeek(shifted), year: getISOWeekYear(shifted) }
}

const nextWeek = computed(() => shiftWeek(1))
const prevWeek = computed(() => shiftWeek(-1))

const mealsInCurrentWeek = computed(() => {
  return [...mealsStore.mealsInWeek(currentWeek.value)]
    .sort((a, b) => Number(a.made) - Number(b.made))
})

function loadSurroundingWeeks () {
  mealsStore.loadMealsInWeek(currentWeek.value)
  mealsStore.loadMealsInWeek(prevWeek.value)
  mealsStore.loadMealsInWeek(nextWeek.value)
}

onMounted(() => {
  loadSurroundingWeeks()
  recipesStore.loadRecipeList()
})

watch(week, () => {
  document.title = `Planering vecka ${week.value} | Beckmans matsajt`
  loadSurroundingWeeks()
}, { immediate: true })
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
header {
  a.weekNav {
    width: 3rem;
    line-height: 3rem;
    text-align: center;
  }
}
</style>
