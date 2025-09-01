import { createI18n } from 'vue-i18n'

export const SUPPORT_LOCALES = ['en', 'af'] as const
export type AppLocale = (typeof SUPPORT_LOCALES)[number]

const messages = {
  en: {
    app: {
      title: 'Vue + Wagtail Starter',
      language: 'Language',
      english: 'English',
      afrikaans: 'Afrikaans',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    },
    auth: {
      email: 'Email',
      password: 'Password',
      forgot: 'Forgot password?',
      haveAccount: 'Have an account?',
      needAccount: 'Need an account?',
      sendLink: 'Send reset link',
      resetPassword: 'Reset Password',
      newPassword: 'New Password',
      confirm: 'Confirm'
    }
  },
  af: {
    app: {
      title: 'Vue + Wagtail Beginstel',
      language: 'Taal',
      english: 'Engels',
      afrikaans: 'Afrikaans',
      login: 'Meld aan',
      register: 'Registreer',
      logout: 'Teken uit'
    },
    auth: {
      email: 'E-pos',
      password: 'Wagwoord',
      forgot: 'Wagwoord vergeet?',
      haveAccount: 'Het jy \'n rekening?',
      needAccount: 'Benodig \'n rekening?',
      sendLink: 'Stuur herstel skakel',
      resetPassword: 'Herstel Wagwoord',
      newPassword: 'Nuwe Wagwoord',
      confirm: 'Bevestig'
    }
  }
}

const saved = (localStorage.getItem('locale') || navigator.language.split('-')[0] || 'en') as AppLocale

export const i18n = createI18n({
  legacy: false,
  locale: SUPPORT_LOCALES.includes(saved) ? saved : 'en',
  fallbackLocale: 'en',
  messages
})
