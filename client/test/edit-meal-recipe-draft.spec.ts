import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import EditMeal from '@/components/EditMeal.vue'
import { api } from '@/services/api'

vi.mock('@/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }
}))

const mockedApi = vi.mocked(api)

const i18n = createI18n({ legacy: false, locale: 'se', missingWarn: false, fallbackWarn: false, messages: { se: {} } })

// The reported bug: creating a recipe inline while adding a meal did not
// fetch title/image from a pasted URL (the meal form had its own copy of
// the recipe fields, without the link preview).
describe('EditMeal inline recipe draft', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fills in the page title on url blur in a new-recipe draft', async () => {
    mockedApi.get.mockResolvedValue({ title: 'Pannkakor – recept', imageUrl: 'https://x.se/a.jpg' })
    const wrapper = mount(EditMeal, { global: { plugins: [i18n] } })

    const createButtons = wrapper.findAll('button').filter((b) => b.text().includes('Create new recipe'))
    await createButtons[0].trigger('click')

    const draft = wrapper.find('.recipe')
    // The meal title prefills the draft title — clear it to simulate a pure link paste
    await draft.find('input[name="title"]').setValue('')
    await draft.find('input[name="url"]').setValue('https://x.se/pannkakor')
    await draft.find('input[name="url"]').trigger('blur')

    await vi.waitFor(() => {
      expect((draft.find('input[name="title"]').element as HTMLInputElement).value).toBe('Pannkakor – recept')
    })
    expect(draft.find('.preview-hint img').attributes('src')).toBe('https://x.se/a.jpg')
  })
})
