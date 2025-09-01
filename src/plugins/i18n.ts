import { createI18n } from 'vue-i18n'

export const SUPPORT_LOCALES = ['en','af'] as const
export type AppLocale = typeof SUPPORT_LOCALES[number]

// Eager-load defaults; lazy-load others if you add more later
const messages = {
  en: {
    app: { title: 'Vue + Wagtail Starter', language: 'Language', english: 'English', afrikaans: 'Afrikaans' }
  },
  af: {
    app: { title: 'Vue + Wagtail Beginstel', language: 'Taal', english: 'Engels', afrikaans: 'Afrikaans' }
  }
}

const saved = (localStorage.getItem('locale') || navigator.language.split('-')[0] || 'en') as AppLocale

export const i18n = createI18n({
  legacy: false, // required for Composition API + Vuetify adapter
  locale: SUPPORT_LOCALES.includes(saved) ? saved : 'en',
  fallbackLocale: 'en',
  messages,
})
