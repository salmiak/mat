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
    <!-- Replacing the image on demand only works on a saved recipe -->
    <div v-if="recipe.id" class="imageActions">
      <button :disabled="imageBusy" @click="replaceImage('generate-ai-image', { title: recipe.title, comment: recipe.comment })">
        <Sparkles :size="14" /> {{ t('Generate AI image') }}
      </button>
      <button v-if="hasUrl" :disabled="imageBusy" @click="replaceImage('fetch-og-image', { url: recipe.url })">
        <ImageDown :size="14" /> {{ t('Fetch image from link') }}
      </button>
      <span v-if="imageBusy" class="hint">{{ t('Generating image') }}</span>
      <span v-else-if="imageError" class="hint error">{{ t('Image update failed') }}</span>
    </div>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'
import { useRecipesStore } from '@/stores/recipes'
import type { NewRecipe, Recipe } from '@/types'
import ImageUpload from './ImageUpload.vue'
import SureButton from './SureButton.vue'
import GrowingTextarea from './GrowingTextarea.vue'
import { ImageDown, Sparkles, Trash2 } from 'lucide-vue-next'

// The shared title/image/url/comment fields for a recipe being edited —
// used by EditRecipe and by the recipe drafts inside EditMeal. Mutates the
// recipe object the parent owns.
const props = defineProps<{ recipe: NewRecipe }>()

const emit = defineEmits<{
  'upload-start': []
  'upload-done': []
  /** The preview filled in an empty title */
  'title-autofilled': [string]
  /** The entered url already belongs to a saved recipe */
  'existing-recipe': [Recipe]
}>()

const { t } = useI18n()
const recipesStore = useRecipesStore()

function imageAttached (e: { imageUrl: string }) {
  emit('upload-done')
  props.recipe.imageUrl = e.imageUrl || null
}

const hasUrl = computed(() => /^https?:\/\//.test(props.recipe.url.trim()))

// Force a new AI image or re-fetch the link's og image, replacing the
// current one. Draft values are sent along so the buttons act on what's
// on screen; the save button is blocked meanwhile via upload-start/done.
const imageBusy = ref(false)
const imageError = ref(false)

async function replaceImage (action: 'generate-ai-image' | 'fetch-og-image', body: object) {
  imageBusy.value = true
  imageError.value = false
  emit('upload-start')
  try {
    const { recipe } = await api.post<{ recipe: Recipe }>(`/recipes/${props.recipe.id}/${action}`, body)
    props.recipe.imageUrl = recipe.imageUrl
    props.recipe.imageSource = recipe.imageSource
    recipesStore.setRecipe(recipe)
  } catch {
    imageError.value = true
  } finally {
    imageBusy.value = false
    emit('upload-done')
  }
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

  // The link may already belong to a saved recipe — offer that instead of
  // creating a duplicate. The parent decides what "use it" means.
  const existing = recipesStore.recipeByUrl(url)
  if (existing) {
    emit('existing-recipe', existing)
    return
  }

  try {
    const preview = await api.get<{ title: string | null, imageUrl: string | null }>(
      `/link-preview?url=${encodeURIComponent(url)}`
    )
    if (url !== props.recipe.url.trim()) return // user kept typing
    if (preview.title && !props.recipe.title.trim()) {
      props.recipe.title = preview.title
      emit('title-autofilled', preview.title)
    }
    previewImageUrl.value = preview.imageUrl
  } catch { /* no preview is fine */ }
}

watch(() => props.recipe.url, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchPreview, 700)
})
onBeforeUnmount(() => clearTimeout(debounceTimer))

// A draft created from a pasted link arrives with the url already set:
// fetch right away. Only when the title is empty, so editing an existing
// recipe doesn't flag itself as a duplicate.
onMounted(() => {
  if (props.recipe.url && !props.recipe.title.trim()) fetchPreview()
})
</script>

<style lang="less" scoped>
@import "@/assets/global.less";
.recipe-thumbnail {
  max-width: 120px;
  height: auto;
}
.imageActions {
  clear: both;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: @bu/2;
  margin: @bu/2 0;
  .hint {
    font-size: 0.8rem;
    opacity: 0.8;
  }
  .error {
    color: darken(@cSecondary, 30%);
  }
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
