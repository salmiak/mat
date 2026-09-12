<template>
  <div>
    <input type="text" name="title" :placeholder="t('Title')" v-model="recipe.title">
  </div>
  <div>
    <div v-if="recipe.imageUrl" style="position: relative; float: left; clear: both">
      <img :src="recipe.imageUrl" class="recipe-thumbnail" />
      <div class="toolbar">
        <sure-button class="iconBtn" @clicked="recipe.imageUrl = null"><Trash2 :size="16" /></sure-button>
      </div>
    </div>
    <image-upload v-else @upload-start="emit('upload-start')" @upload-done="imageAttached" />
  </div>
  <div>
    <input type="url" name="url" :placeholder="t('Url')" v-model="recipe.url" @blur="fetchPreview">
    <p v-if="previewImageUrl && !recipe.imageUrl" class="preview-hint">
      <img :src="previewImageUrl" class="recipe-thumbnail" />
      <span>{{ t('Image from link') }}</span>
    </p>
  </div>
  <div>
    <growing-textarea :placeholder="t('Comment')" v-model="recipe.comment" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'
import type { NewRecipe } from '@/types'
import ImageUpload from './ImageUpload.vue'
import SureButton from './SureButton.vue'
import GrowingTextarea from './GrowingTextarea.vue'
import { Trash2 } from 'lucide-vue-next'

// The shared title/image/url/comment fields for a recipe being edited —
// used by EditRecipe and by the recipe drafts inside EditMeal. Mutates the
// recipe object the parent owns.
const props = defineProps<{ recipe: NewRecipe }>()

const emit = defineEmits<{
  'upload-start': []
  'upload-done': []
}>()

const { t } = useI18n()

function imageAttached (e: { imageUrl: string }) {
  emit('upload-done')
  props.recipe.imageUrl = e.imageUrl || null
}

// Paste a URL and the page's title fills in by itself (never over a title
// the user typed); the og:image is shown as a hint of what save attaches.
const previewImageUrl = ref<string | null>(null)
let previewedUrl = ''
let debounceTimer: ReturnType<typeof setTimeout> | undefined

async function fetchPreview () {
  const url = props.recipe.url.trim()
  if (!/^https?:\/\//.test(url) || url === previewedUrl) return
  previewedUrl = url
  try {
    const preview = await api.get<{ title: string | null, imageUrl: string | null }>(
      `/link-preview?url=${encodeURIComponent(url)}`
    )
    if (url !== props.recipe.url.trim()) return // user kept typing
    if (preview.title && !props.recipe.title.trim()) {
      props.recipe.title = preview.title
    }
    previewImageUrl.value = preview.imageUrl
  } catch { /* no preview is fine */ }
}

watch(() => props.recipe.url, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchPreview, 700)
})
onBeforeUnmount(() => clearTimeout(debounceTimer))
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.recipe-thumbnail {
  max-width: 120px;
  height: auto;
}
.preview-hint {
  display: flex;
  align-items: center;
  gap: @bu/2;
  margin: @bu/2 0 0;
  font-size: 0.8rem;
  opacity: 0.8;
  img {
    border-radius: @radius;
  }
}
</style>
