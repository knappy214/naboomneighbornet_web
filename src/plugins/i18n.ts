import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import af from '@/locales/af.json'

export const SUPPORT_LOCALES = ['en', 'af'] as const
export type AppLocale = (typeof SUPPORT_LOCALES)[number]

const messages = {
  en,
  af,
}

const saved = (localStorage.getItem('locale') ||
  navigator.language.split('-')[0] ||
  'en') as AppLocale

export const i18n = createI18n({
  legacy: false,
  locale: SUPPORT_LOCALES.includes(saved) ? saved : 'en',
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  allowComposition: true,
  sync: true,
  warnHtmlMessage: false,
  // Enable parameter interpolation for i18n compatibility
  pluralizationRules: {
    en: (choice: number) => (choice === 1 ? 0 : 1),
    af: (choice: number) => (choice === 1 ? 0 : 1),
  },
  // Enable message format for parameter handling
  messageFormat: {
    message: true,
    messageSyntax: true,
  },
})
