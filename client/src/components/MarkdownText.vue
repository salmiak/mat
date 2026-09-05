<template>
  <div v-html="rendered"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

// html: false — user-written markdown is rendered, raw HTML is escaped
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

const props = defineProps<{ source?: string | null }>()

const rendered = computed(() => md.render(props.source ?? ''))
</script>
