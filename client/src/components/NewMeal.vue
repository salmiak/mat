<template>
  <div class="meal">
    <div v-if="expanded">
      <div class="toolbar">
        <X class="iconBtn" :size="16" @click="expanded = false" />
      </div>
      <h2>{{ t('Add Meal') }}</h2>
      <edit-meal :week="week" :year="year" :reset-on-save="true" @save-meal="addMeal" @cancel-edit="expanded = false" />
    </div>
    <div v-else>
      <button @click="expanded = true">{{ t('Add Meal') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMealsStore } from '@/stores/meals'
import type { NewMeal } from '@/types'
import EditMeal from './EditMeal.vue'
import { X } from 'lucide-vue-next'

defineProps<{
  week?: number
  year?: number
}>()

const { t } = useI18n()
const mealsStore = useMealsStore()
const expanded = ref(false)

async function addMeal (mealData: NewMeal) {
  await mealsStore.addMeal(mealData)
  expanded.value = false
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.meal {
  background: @cMealBg;
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
