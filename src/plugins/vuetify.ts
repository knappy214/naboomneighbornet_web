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
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#570df8',
          secondary: '#f000b8',
          accent: '#37cdbe',
          error: '#f87272',
          warning: '#fbbd23',
          info: '#3abff8',
          success: '#36d399',
        },
      },
      business: {
        dark: true,
        colors: {
          primary: '#1a365d',
          secondary: '#2d3748',
          accent: '#3182ce',
          error: '#e53e3e',
          warning: '#dd6b20',
          info: '#3182ce',
          success: '#38a169',
        },
      },
    },
  },
})
