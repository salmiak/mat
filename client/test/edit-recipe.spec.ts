import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import EditRecipe from '@/components/EditRecipe.vue'
import { api } from '@/services/api'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn() }
}))

const mockedApi = vi.mocked(api)

const i18n = createI18n({ legacy: false, locale: 'se', missingWarn: false, fallbackWarn: false, messages: { se: {} } })

function mountForm () {
  return mount(EditRecipe, { global: { plugins: [i18n] } })
}

describe('EditRecipe link preview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('fills in the page title on url blur when title is empty', async () => {
    mockedApi.get.mockResolvedValue({ title: 'Pannkakor – recept', imageUrl: 'https://x.se/a.jpg' })
    const wrapper = mountForm()
    await wrapper.find('input[name="url"]').setValue('https://x.se/pannkakor')
    await wrapper.find('input[name="url"]').trigger('blur')
    await vi.waitFor(() => {
      expect((wrapper.find('input[name="title"]').element as HTMLInputElement).value).toBe('Pannkakor – recept')
    })
    expect(mockedApi.get).toHaveBeenCalledWith('/link-preview?url=' + encodeURIComponent('https://x.se/pannkakor'))
    expect(wrapper.find('.preview-hint img').attributes('src')).toBe('https://x.se/a.jpg')
  })

  it('never overwrites a typed title and skips non-urls', async () => {
    mockedApi.get.mockResolvedValue({ title: 'Sajtens titel', imageUrl: null })
    const wrapper = mountForm()
    await wrapper.find('input[name="title"]').setValue('Min egen titel')
    await wrapper.find('input[name="url"]').setValue('https://x.se/r')
    await wrapper.find('input[name="url"]').trigger('blur')
    await vi.waitFor(() => expect(mockedApi.get).toHaveBeenCalled())
    expect((wrapper.find('input[name="title"]').element as HTMLInputElement).value).toBe('Min egen titel')

    mockedApi.get.mockClear()
    await wrapper.find('input[name="url"]').setValue('inte en url')
    await wrapper.find('input[name="url"]').trigger('blur')
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it('fetches after debounce without blur', async () => {
    vi.useFakeTimers()
    mockedApi.get.mockResolvedValue({ title: 'Titel', imageUrl: null })
    const wrapper = mountForm()
    await wrapper.find('input[name="url"]').setValue('https://x.se/debounce')
    expect(mockedApi.get).not.toHaveBeenCalled()
    vi.advanceTimersByTime(800)
    expect(mockedApi.get).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
