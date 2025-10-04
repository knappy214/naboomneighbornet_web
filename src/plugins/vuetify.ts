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
          primary: '#570df8', // DaisyUI light primary
          secondary: '#f000b8', // DaisyUI light secondary
          accent: '#37cdbe', // DaisyUI light accent
          error: '#f87272', // DaisyUI light error
          warning: '#fbbd23', // DaisyUI light warning
          info: '#3abff8', // DaisyUI light info
          success: '#36d399', // DaisyUI light success
          surface: '#ffffff', // DaisyUI base-100
          'surface-variant': '#f3f4f6', // DaisyUI base-200
          'on-surface': '#1f2937', // DaisyUI base-content
          'on-surface-variant': '#6b7280', // DaisyUI base-content/70
        },
      },
      business: {
        dark: true,
        colors: {
          primary: '#1a365d', // DaisyUI business primary
          secondary: '#2d3748', // DaisyUI business secondary
          accent: '#3182ce', // DaisyUI business accent
          error: '#e53e3e', // DaisyUI business error
          warning: '#dd6b20', // DaisyUI business warning
          info: '#3182ce', // DaisyUI business info
          success: '#38a169', // DaisyUI business success
          surface: '#1a202c', // DaisyUI business base-100
          'surface-variant': '#2d3748', // DaisyUI business base-200
          'on-surface': '#e2e8f0', // DaisyUI business base-content
          'on-surface-variant': '#a0aec0', // DaisyUI business base-content/70
        },
      },
    },
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VBtn: {
      variant: 'elevated',
      size: 'large',
    },
    VCard: {
      elevation: 8,
    },
  },
})
