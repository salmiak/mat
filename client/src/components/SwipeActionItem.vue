<template>
  <div class="swipeActionItem">
    <div
      class="itemContent"
      :style="{ left: leftOffset + 'px' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <slot></slot>
    </div>
    <div v-if="direction" class="itemBackground" :class="action">
      <div>
        <slot v-if="direction === 'right' && action === 'primary'" name="rightprimary"></slot>
        <slot v-if="direction === 'right' && action === 'secondary'" name="rightsecondary"></slot>
      </div>
      <div>
        <slot v-if="direction === 'left' && action === 'primary'" name="leftprimary"></slot>
        <slot v-if="direction === 'left' && action === 'secondary'" name="leftsecondary"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const FRICTION = 0.95
const MAX_THRESHOLD = 0.65
const START_THRESHOLD = 20

const props = defineProps<{
  rightActions?: number
  leftActions?: number
}>()

const emit = defineEmits<{
  rightprimary: []
  rightsecondary: []
  leftprimary: []
  leftsecondary: []
}>()

const leftOffset = ref(0)
const root = ref<HTMLElement>()

let startX = 0
let startY = 0
let tracking = false
let swiping = false

const direction = computed(() => {
  if (leftOffset.value > 0) return 'right'
  if (leftOffset.value < 0) return 'left'
  return undefined
})

const action = computed(() => {
  if (!direction.value) return undefined
  const el = root.value?.closest('.swipeActionItem') as HTMLElement | null
  const itemWidth = el?.offsetWidth ?? window.innerWidth
  const threshold = MAX_THRESHOLD * itemWidth
  const actions = direction.value === 'right' ? props.rightActions : props.leftActions
  if (actions === 2 && Math.abs(leftOffset.value) > threshold) {
    return 'secondary'
  }
  if (Math.abs(leftOffset.value) > threshold / 3) {
    return 'primary'
  }
  return undefined
})

function onPointerDown (e: PointerEvent) {
  startX = e.clientX
  startY = e.clientY
  tracking = true
  swiping = false
  root.value = e.currentTarget as HTMLElement
}

function onPointerMove (e: PointerEvent) {
  if (!tracking) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!swiping) {
    if (Math.abs(dx) < START_THRESHOLD) return
    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical intent: let the page scroll
      tracking = false
      return
    }
    swiping = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  leftOffset.value = dx * FRICTION
}

function onPointerUp () {
  if (swiping && direction.value && action.value) {
    emit(`${direction.value}${action.value}` as 'rightprimary')
  }
  tracking = false
  swiping = false
  leftOffset.value = 0
}
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.swipeActionItem {
  position: relative;
  overflow: hidden;
}
.itemContent {
  position: relative;
  z-index: 100;
  touch-action: pan-y;
}
.itemBackground {
  .h2;
  @bg: @cBackground;
  z-index: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: @bg;
  box-shadow: 0 0 1*@bu darken(@bg, 15%) inset;
  transition: all 0.2s, opacity 0.2s;
  padding: 0 @bu*2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: @radius;
  &.primary {
    @bg: @cSecondary;
    background: @bg;
    box-shadow: 0 0 1*@bu darken(@bg, 10%) inset;
  }
  &.secondary {
    @bg: darken(@cBackground, 10%);
    background: @bg;
    box-shadow: 0 0 1*@bu darken(@bg, 17%) inset;
  }
}
</style>
