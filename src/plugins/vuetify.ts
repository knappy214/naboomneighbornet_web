import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { en, af } from 'vuetify/locale'
import { i18n } from './i18n'
import { useI18n } from 'vue-i18n'

export const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
    locale: i18n.global.locale.value,
    fallback: 'en',
    messages: { en, af },
  },
})
