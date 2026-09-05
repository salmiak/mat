import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SureButton from '@/components/SureButton.vue'

describe('SureButton', () => {
  it('emits only after a confirming second click', async () => {
    const wrapper = mount(SureButton)

    await wrapper.trigger('click')
    expect(wrapper.emitted('clicked')).toBeUndefined()
    expect(wrapper.classes()).toContain('clicked')

    await wrapper.trigger('click')
    expect(wrapper.emitted('clicked')).toHaveLength(1)
  })

  it('disarms after 3 seconds', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SureButton)

    await wrapper.trigger('click')
    vi.advanceTimersByTime(3100)
    await wrapper.trigger('click')

    expect(wrapper.emitted('clicked')).toBeUndefined()
    vi.useRealTimers()
  })

  it('renders the element given by the type prop', () => {
    const wrapper = mount(SureButton, { props: { type: 'i' } })
    expect(wrapper.element.tagName).toBe('I')
  })
})
