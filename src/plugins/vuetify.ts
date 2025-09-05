import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { en, af } from 'vuetify/locale'
import { i18n } from './i18n'

// Create the Vuetify i18n adapter with proper configuration
const vuetifyI18nAdapter = createVueI18nAdapter({
  i18n: i18n as any,
  useI18n: () => {
    const { t, locale, fallbackLocale } = i18n.global
    return {
      t: (key: string, ...params: any[]) => {
        // Handle Vuetify's t(key, ...params) vs vue-i18n's t(key, [params]) difference
        if (params.length === 0) {
          return t(key)
        }
        return t(key, params)
      },
      locale,
      fallbackLocale,
    } as any
  },
})

export const vuetify = createVuetify({
  locale: {
    adapter: vuetifyI18nAdapter,
    locale: i18n.global.locale.value as string,
    fallback: 'en',
    messages: { en, af },
  } as any,
  theme: {
    defaultTheme: 'community-security',
    themes: {
      'community-security': {
        dark: false,
        colors: {
          primary: '#6b4f2a',
          secondary: '#3a7d44',
          accent: '#f6b40e',
          error: '#c0392b',
          warning: '#f6b40e',
          info: '#3a7d44',
          success: '#3a7d44',
        },
      },
      'community-security-dark': {
        dark: true,
        colors: {
          primary: '#8b6f4a',
          secondary: '#4a8b5a',
          accent: '#f6b40e',
          error: '#e74c3c',
          warning: '#f6b40e',
          info: '#4a8b5a',
          success: '#4a8b5a',
        },
      },
    },
  },
})
