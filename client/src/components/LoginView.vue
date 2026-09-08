<template>
  <div class="login">
    <div class="card">
      <h2>{{ t('Log in') }}</h2>
      <p>{{ t('Login intro') }}</p>

      <div v-if="googleProvider" ref="googleButton" class="provider" />
      <p v-else class="error">{{ t('No login providers') }}</p>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore, ApiError } from '@/stores/auth'

// Google Identity Services is loaded from its script tag at runtime.
interface GoogleCredentialResponse { credential: string }
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize (config: { client_id: string, callback: (r: GoogleCredentialResponse) => void }): void
          renderButton (el: HTMLElement, options: Record<string, unknown>): void
        }
      }
    }
  }
}

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const error = ref('')
const googleButton = ref<HTMLElement | null>(null)
const googleProvider = computed(() => auth.providers.find((p) => p.name === 'google'))

async function onGoogleCredential (response: GoogleCredentialResponse) {
  error.value = ''
  try {
    await auth.loginWithIdToken('google', response.credential)
    router.push('/week')
  } catch (err) {
    error.value = err instanceof ApiError && err.status === 403
      ? t('Account not allowed')
      : t('Login failed')
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

function loadGsi (): Promise<void> {
  if (window.google) return Promise.resolve()
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = GSI_SRC
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')))
  })
}

async function renderGoogleButton () {
  const provider = googleProvider.value
  if (!provider || !googleButton.value) return
  try {
    await loadGsi()
    window.google!.accounts.id.initialize({ client_id: provider.clientId, callback: onGoogleCredential })
    window.google!.accounts.id.renderButton(googleButton.value, {
      theme: 'outline',
      size: 'large',
      width: 260,
      locale: locale.value === 'se' ? 'sv_SE' : 'en_US'
    })
  } catch {
    error.value = t('Login failed')
  }
}

onMounted(renderGoogleButton)
watch(googleProvider, renderGoogleButton)
</script>

<style lang="less" scoped>
@import "@/assets/global.less";

.login {
  display: flex;
  justify-content: center;
}

.card {
  background: @cMealBg;
  padding: @bu*2 @bu;
  width: 95%;
  max-width: @bu * 25;
  border-radius: @radius;
  margin: @bu*2 auto;
  text-align: center;

  h2 {
    margin-bottom: @bu;
  }
  p {
    margin-bottom: @bu;
  }
}

.provider {
  display: flex;
  justify-content: center;
}

.error {
  color: darken(@cSecondary, 30%);
  font-weight: 500;
}
</style>
