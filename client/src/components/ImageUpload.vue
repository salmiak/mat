<template>
  <div>
    <input v-if="status === 'idle'" ref="input" type="file" accept="image/*" @change="upload">
    <span v-if="status === 'uploading'">{{ t('Uploading image') }}</span>
    <img v-if="uploadedUrl" :src="uploadedUrl" width="100" />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'

const emit = defineEmits<{
  uploadStart: []
  uploadDone: [{ imageUrl: string }]
}>()

const { t } = useI18n()
const status = ref<'idle' | 'uploading' | 'done'>('idle')
const uploadedUrl = ref<string>()
const input = useTemplateRef('input')

async function upload () {
  const file = input.value?.files?.[0]
  if (!file) return

  status.value = 'uploading'
  emit('uploadStart')
  try {
    const { url } = await api.uploadImage(file)
    status.value = 'done'
    uploadedUrl.value = url
    emit('uploadDone', { imageUrl: url })
  } catch (err) {
    console.error(err)
    status.value = 'idle'
    emit('uploadDone', { imageUrl: '' })
  }
}
</script>
