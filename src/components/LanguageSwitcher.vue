<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost">
      <span class="text-lg">{{ currentLocaleIcon }}</span>
      <span class="ml-1">{{ currentLocaleLabel }}</span>
    </div>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg">
      <li class="menu-title">
        <span>{{ t('app.language') }}</span>
      </li>
      <li
        v-for="localeOption in supportedLocales"
        :key="localeOption.code"
        @click="changeLocale(localeOption.code as AppLocale)"
        :class="{ 'menu-active': localeOption.code === currentLocale }"
      >
        <button class="flex items-center gap-3">
          <span class="text-lg">{{ localeOption.flag }}</span>
          <span>{{ localeOption.nativeName }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORT_LOCALES, type AppLocale } from '@/plugins/i18n'
import { i18n } from '@/plugins/i18n'

const { t, locale } = useI18n()

const currentLocale = computed(() => locale.value as AppLocale)

const supportedLocales = computed(() => {
  const availableLocales = i18n.global.availableLocales as string[]
  return availableLocales.map((code) => {
    switch (code) {
      case 'en':
        return { code, flag: '🇺🇸', nativeName: 'English' }
      case 'af':
        return { code, flag: '🇿🇦', nativeName: 'Afrikaans' }
      default:
        return { code, flag: '🌐', nativeName: code.toUpperCase() }
    }
  })
})

const currentLocaleIcon = computed(() => {
  const current = supportedLocales.value.find(
    (l: { code: string; flag: string }) => l.code === locale.value,
  )
  return current?.flag || '🌐'
})

const currentLocaleLabel = computed(() => {
  const current = supportedLocales.value.find(
    (l: { code: string; nativeName: string }) => l.code === locale.value,
  )
  return current?.nativeName || 'Language'
})

const changeLocale = (newLocale: AppLocale) => {
  locale.value = newLocale
}
</script>
