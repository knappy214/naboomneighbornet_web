<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2">mdi-palette</v-icon>
      {{ t('app.language') }} & Theme Switcher
    </v-card-title>
    <v-card-text>
      <v-row>
        <!-- Language Switcher -->
        <v-col cols="12" md="6">
          <h4>{{ t('app.language') }}</h4>
          <VuetifyLocaleSwitcher />
          <v-divider class="my-2" />
          <v-chip color="primary" size="small">
            {{ t('app.language') }}: {{ currentLocale }}
          </v-chip>
        </v-col>

        <!-- Theme Switcher -->
        <v-col cols="12" md="6">
          <h4>Theme</h4>
          <v-btn-toggle
            v-model="currentTheme"
            mandatory
            @update:model-value="changeTheme"
            class="mb-2"
          >
            <v-btn value="light" size="small">
              <v-icon start>mdi-weather-sunny</v-icon>
              Light
            </v-btn>
            <v-btn value="business" size="small">
              <v-icon start>mdi-weather-night</v-icon>
              Business
            </v-btn>
          </v-btn-toggle>
          <v-divider class="my-2" />
          <v-chip color="secondary" size="small"> Theme: {{ currentTheme }} </v-chip>
        </v-col>
      </v-row>

      <!-- Locale-specific theme preview -->
      <v-divider class="my-4" />
      <v-row>
        <v-col cols="12">
          <h4>Locale-specific Theme Preview</h4>
          <v-alert
            :type="currentLocale === 'af' ? 'info' : 'success'"
            :color="currentLocale === 'af' ? 'info' : 'success'"
            variant="tonal"
          >
            <template #prepend>
              <v-icon>
                {{ currentLocale === 'af' ? 'mdi-flag-south-africa' : 'mdi-flag' }}
              </v-icon>
            </template>
            <div>
              <strong>{{ t('app.title') }}</strong
              ><br />
              {{
                currentLocale === 'af'
                  ? "Hierdie is 'n voorbeeld van die Afrikaans tema met donkerder kleure vir beter leesbaarheid."
                  : 'This is an example of the English theme with lighter colors for better readability.'
              }}
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Theme colors preview -->
      <v-divider class="my-4" />
      <v-row>
        <v-col cols="12">
          <h4>Theme Colors</h4>
          <v-row>
            <v-col cols="3" v-for="(color, name) in themeColors" :key="name">
              <v-card :color="color" height="60" class="d-flex align-center justify-center">
                <span
                  :class="
                    name.includes('primary') || name.includes('secondary')
                      ? 'text-white'
                      : 'text-black'
                  "
                  class="text-caption font-weight-bold"
                >
                  {{ name }}
                </span>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme, useLocale } from 'vuetify'
import VuetifyLocaleSwitcher from './VuetifyLocaleSwitcher.vue'
import { type AppLocale } from '@/plugins/i18n'

const { t, locale } = useI18n()
const theme = useTheme()
const vuetifyLocale = useLocale()

const currentLocale = computed(() => locale.value as AppLocale)
const currentTheme = ref(theme.current.value.dark ? 'business' : 'light')

const themeColors = computed(() => {
  const currentThemeObj = theme.current.value
  return {
    primary: currentThemeObj.colors.primary,
    secondary: currentThemeObj.colors.secondary,
    accent: currentThemeObj.colors.accent,
    error: currentThemeObj.colors.error,
    warning: currentThemeObj.colors.warning,
    info: currentThemeObj.colors.info,
    success: currentThemeObj.colors.success,
  }
})

const changeTheme = (newTheme: string) => {
  theme.global.name.value = newTheme
  localStorage.setItem('theme', newTheme)
}

// Watch for locale changes and adjust theme if needed
watch(currentLocale, (newLocale) => {
  // You can add locale-specific theme logic here
  // For example, automatically switch to business theme for Afrikaans
  if (newLocale === 'af' && currentTheme.value === 'light') {
    // Optionally auto-switch to business theme for Afrikaans
    // changeTheme('business')
  }
})

// Watch for theme changes
watch(
  () => theme.current.value.dark,
  (isDark) => {
    currentTheme.value = isDark ? 'business' : 'light'
  },
)
</script>
