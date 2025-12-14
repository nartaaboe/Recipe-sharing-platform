import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'

describe('SearchBar', () => {
  it('renders search input', () => {
    const wrapper = mount(SearchBar)
    
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.search-btn').exists()).toBe(true)
  })

  it('emits search event on button click', async () => {
    const wrapper = mount(SearchBar)
    
    const input = wrapper.find('.search-input')
    await input.setValue('test query')
    
    const button = wrapper.find('.search-btn')
    await button.trigger('click')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['test query'])
  })

  it('emits search event on Enter key', async () => {
    const wrapper = mount(SearchBar)
    
    const input = wrapper.find('.search-input')
    await input.setValue('test query')
    await input.trigger('keyup.enter')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['test query'])
  })

  it('updates modelValue on input', async () => {
    const wrapper = mount(SearchBar)
    
    const input = wrapper.find('.search-input')
    await input.setValue('new value')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
  })
})

