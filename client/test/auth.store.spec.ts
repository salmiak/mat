import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { api, ApiError } from '@/services/api'

vi.mock('@/services/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/api')>()
  return {
    ...original,
    api: {
      get: vi.fn(),
      post: vi.fn()
    }
  }
})

const mockedApi = vi.mocked(api)

const anna = { id: 1, email: 'anna@example.com', name: 'Anna', picture: '' }
const googleProvider = { name: 'google', clientId: 'cid' }

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('ensureChecked loads user and providers once', async () => {
    mockedApi.get.mockResolvedValue({ user: anna, providers: [googleProvider], authRequired: true })
    const store = useAuthStore()
    await store.ensureChecked()
    await store.ensureChecked()
    expect(mockedApi.get).toHaveBeenCalledTimes(1)
    expect(store.user).toEqual(anna)
    expect(store.providers).toEqual([googleProvider])
    expect(store.authRequired).toBe(true)
    expect(store.loggedIn).toBe(true)
  })

  it('fails open when the status check errors', async () => {
    mockedApi.get.mockRejectedValue(new Error('network'))
    const store = useAuthStore()
    await store.ensureChecked()
    expect(store.authRequired).toBe(false)
    expect(store.checked).toBe(true)
  })

  it('loginWithIdToken stores the user', async () => {
    mockedApi.post.mockResolvedValue({ user: anna })
    const store = useAuthStore()
    await store.loginWithIdToken('google', 'token')
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/google', { credential: 'token' })
    expect(store.user).toEqual(anna)
  })

  it('loginWithIdToken propagates a 403', async () => {
    mockedApi.post.mockRejectedValue(new ApiError('nope', 403))
    const store = useAuthStore()
    await expect(store.loginWithIdToken('google', 'token')).rejects.toMatchObject({ status: 403 })
    expect(store.user).toBeNull()
  })

  it('logout clears the user even if the request fails', async () => {
    mockedApi.get.mockResolvedValue({ user: anna, providers: [googleProvider], authRequired: true })
    mockedApi.post.mockRejectedValue(new Error('network'))
    const store = useAuthStore()
    await store.ensureChecked()
    await store.logout().catch(() => {})
    expect(store.user).toBeNull()
  })

  it('sessionExpired clears the user only when auth is required', async () => {
    mockedApi.get.mockResolvedValue({ user: anna, providers: [googleProvider], authRequired: true })
    const store = useAuthStore()
    await store.ensureChecked()
    store.sessionExpired()
    expect(store.user).toBeNull()
  })
})
