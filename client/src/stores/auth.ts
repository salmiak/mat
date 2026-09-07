import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/services/api'
import type { AuthProvider, AuthUser, MeResponse } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const providers = ref<AuthProvider[]>([])
  const authRequired = ref(false)
  const checked = ref(false)

  const loggedIn = computed(() => user.value !== null)

  let pending: Promise<void> | null = null
  async function ensureChecked () {
    if (checked.value) return
    pending ??= (async () => {
      try {
        const data = await api.get<MeResponse>('/auth/me')
        user.value = data.user
        providers.value = data.providers
        authRequired.value = data.authRequired
      } catch {
        // API down: fail open so the router doesn't trap the user on /login;
        // every data call will surface its own error anyway.
        authRequired.value = false
      } finally {
        checked.value = true
        pending = null
      }
    })()
    await pending
  }

  /** Exchange a provider id token for a session. Throws ApiError (403 = not allowed). */
  async function loginWithIdToken (provider: string, credential: string) {
    const data = await api.post<{ user: AuthUser }>(`/auth/${provider}`, { credential })
    user.value = data.user
  }

  async function logout () {
    try {
      await api.post('/auth/logout', {})
    } finally {
      user.value = null
    }
  }

  function sessionExpired () {
    if (authRequired.value) user.value = null
  }

  return { user, providers, authRequired, checked, loggedIn, ensureChecked, loginWithIdToken, logout, sessionExpired }
})

export { ApiError }
