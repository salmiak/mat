<template>
  <div class="voteButtons">
    <span class="vote" :class="{ active: own === 1 }" @click.stop="vote(1)">
      <i :class="own === 1 ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
      <span v-if="meal.upvotes" class="count">{{ meal.upvotes }}</span>
    </span>
    <span class="vote" :class="{ active: own === -1 }" @click.stop="vote(-1)">
      <i :class="own === -1 ? 'fas fa-thumbs-down' : 'far fa-thumbs-down'"></i>
      <span v-if="meal.downvotes" class="count">{{ meal.downvotes }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMealsStore } from '@/stores/meals'
import type { Meal, VoteValue } from '@/types'

const props = defineProps<{ meal: Meal }>()

const mealsStore = useMealsStore()
const own = computed(() => mealsStore.ownVote(props.meal.id))

function vote (value: VoteValue) {
  mealsStore.voteMeal(props.meal.id, value)
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.voteButtons {
  .noselect;
  display: inline-flex;
  gap: @bu/2;
  .vote {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    padding: 0.2rem 0.5rem;
    border-radius: @radius;
    color: fade(@cPrimary, 60%);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
    &:hover {
      background: fade(@cBackground, 30%);
    }
    &.active {
      color: darken(@cSecondary, 20%);
      background: @cSecondary;
    }
    .count {
      font-size: 0.7rem;
      font-weight: 700;
    }
  }
}
</style>
