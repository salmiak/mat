<template>
  <button :disabled="uploading" @click="input?.click()">
    <Upload :size="16" />
    <span>{{ uploading ? t('Uploading image') : t('Upload image') }}</span>
    <!-- inline display:none — the global input styles override the hidden attribute -->
    <input ref="input" type="file" accept="image/*" style="display: none" @change="upload">
  </button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'
import { Upload } from 'lucide-vue-next'

const emit = defineEmits<{
  uploadStart: []
  uploadDone: [{ imageUrl: string }]
}>()

const { t } = useI18n()
const uploading = ref(false)
const input = useTemplateRef('input')

async function upload () {
  const file = input.value?.files?.[0]
  if (!file) return

  uploading.value = true
  emit('uploadStart')
  try {
    const { url } = await api.uploadImage(file)
    emit('uploadDone', { imageUrl: url })
  } catch (err) {
    console.error(err)
    emit('uploadDone', { imageUrl: '' })
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>
