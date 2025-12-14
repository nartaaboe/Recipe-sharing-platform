import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RecipeCard from '@/components/RecipeCard.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: []
})

describe('RecipeCard', () => {
  const mockRecipe = {
    _id: '123',
    title: 'Test Recipe',
    description: 'A test recipe description',
    image: '/test-image.jpg',
    tags: ['test', 'recipe'],
    views: 100
  }

  it('renders recipe information correctly', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: mockRecipe
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('Test Recipe')
    expect(wrapper.text()).toContain('A test recipe description')
    expect(wrapper.text()).toContain('100 views')
  })

  it('displays recipe tags', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: mockRecipe
      },
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('#test')
    expect(wrapper.text()).toContain('#recipe')
  })

  it('has a view button', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: mockRecipe
      },
      global: {
        plugins: [router]
      }
    })

    const viewButton = wrapper.find('.btn')
    expect(viewButton.exists()).toBe(true)
    expect(viewButton.text()).toContain('View')
  })
})

