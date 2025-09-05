<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        :prepend-icon="currentLocaleIcon"
        class="text-capitalize"
      >
        {{ currentLocaleLabel }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="locale in SUPPORT_LOCALES"
        :key="locale"
        :value="locale"
        @click="changeLocale(locale)"
        :active="locale === currentLocale"
      >
        <template #prepend>
          <v-icon>{{ getLocaleIcon(locale) }}</v-icon>
        </template>
        <v-list-item-title>{{ getLocaleLabel(locale) }}</v-list-item-title>
        <template #append>
          <v-chip v-if="locale === currentLocale" size="small" color="primary">
            {{ t('app.language') }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'
import { SUPPORT_LOCALES, type AppLocale } from '@/plugins/i18n'

// Use both vue-i18n and Vuetify's useLocale
const { t, locale: i18nLocale } = useI18n()
const vuetifyLocale = useLocale()

const currentLocale = computed(() => i18nLocale.value as AppLocale)

const currentLocaleIcon = computed(() => getLocaleIcon(currentLocale.value))
const currentLocaleLabel = computed(() => getLocaleLabel(currentLocale.value))

const getLocaleIcon = (locale: AppLocale): string => {
  const icons = {
    en: 'mdi-flag',
    af: 'mdi-flag-south-africa',
  }
  return icons[locale]
}

const getLocaleLabel = (locale: AppLocale): string => {
  const labels = {
    en: 'English',
    af: 'Afrikaans',
  }
  return labels[locale]
}

const changeLocale = (newLocale: AppLocale) => {
  // Update both vue-i18n and Vuetify locale
  i18nLocale.value = newLocale
  vuetifyLocale.current.value = newLocale
  localStorage.setItem('locale', newLocale)
}

// Watch for external locale changes and sync both systems
watch(i18nLocale, (newLocale) => {
  if (vuetifyLocale.current.value !== newLocale) {
    vuetifyLocale.current.value = newLocale as string
  }
})

watch(
  () => vuetifyLocale.current.value,
  (newLocale) => {
    if (i18nLocale.value !== newLocale) {
      i18nLocale.value = newLocale as AppLocale
    }
  },
)
</script>
