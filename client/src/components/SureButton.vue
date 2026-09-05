<template>
  <component :is="type || 'span'" :class="{ clicked: clickedOnce }" @click="clicked">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ type?: string }>()
const emit = defineEmits<{ clicked: [] }>()

// First click arms the button, second click within 3s confirms
const clickedOnce = ref(false)
let timeout: ReturnType<typeof setTimeout> | undefined

function clicked () {
  clearTimeout(timeout)
  if (clickedOnce.value) {
    clickedOnce.value = false
    emit('clicked')
  } else {
    clickedOnce.value = true
    timeout = setTimeout(() => {
      clickedOnce.value = false
    }, 3000)
  }
}

onBeforeUnmount(() => clearTimeout(timeout))
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.clicked {
  color: darken(@cSecondary, 20%);
  background: @cSecondary;
  &:hover {
    background-color: darken(@cSecondary, 5%);
  }
}
</style>
