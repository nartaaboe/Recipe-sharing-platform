import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders when show is true', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        show: true
      }
    })

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('does not render when show is false', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        show: false
      }
    })

    expect(wrapper.find('.loading-spinner').exists()).toBe(false)
  })

  it('displays message when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        show: true,
        message: 'Loading recipes...'
      }
    })

    expect(wrapper.text()).toContain('Loading recipes...')
  })
})

