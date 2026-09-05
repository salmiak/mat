<template>
  <textarea
    ref="el"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
    @focus="grow"
  ></textarea>
</template>

<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'

// Auto-growing textarea (replaces the old measure-<pre> trick)
const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const el = useTemplateRef('el')

function grow () {
  const node = el.value
  if (!node) return
  node.style.height = 'auto'
  node.style.height = Math.max(node.scrollHeight + 2, 64) + 'px'
}

function onInput (e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  grow()
}

watch(() => props.modelValue, () => nextTick(grow))
</script>

<style scoped>
textarea {
  min-height: calc(2.5rem + 2px);
  transition: height .15s;
  overflow: hidden;
}
</style>
