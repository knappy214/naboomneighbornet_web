import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'
import { createPinia } from 'pinia'
import { i18n } from '../plugins/i18n'

describe('App', () => {
  it('renders title', async () => {
    router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router, createPinia(), i18n] } })
    expect(wrapper.text()).toContain('Vue + Wagtail Starter')
  })
})
