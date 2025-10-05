<template>
  <div class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h2 class="card-title text-lg mb-4">
        <span class="text-xl">🎨</span>
        {{ t('app.language') }} & Theme Switcher
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Language Switcher -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">{{ t('app.language') }}</h3>
          <div class="dropdown dropdown-end w-full">
            <div tabindex="0" role="button" class="btn btn-outline w-full justify-start">
              <span class="text-lg">{{ currentLocaleIcon }}</span>
              <span class="ml-2">{{ currentLocaleLabel }}</span>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg"
            >
              <li class="menu-title">
                <span>{{ t('app.language') }}</span>
              </li>
              <li
                v-for="localeOption in supportedLocales"
                :key="localeOption.code"
                @click="switchLocale(localeOption.code as 'en' | 'af')"
                :class="{ 'menu-active': localeOption.code === currentLocale }"
              >
                <button class="flex items-center gap-3">
                  <span class="text-lg">{{ localeOption.flag }}</span>
                  <span>{{ localeOption.nativeName }}</span>
                </button>
              </li>
            </ul>
          </div>
          <div class="badge badge-primary">{{ t('app.language') }}: {{ currentLocale }}</div>
        </div>

        <!-- Theme Switcher -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Theme</h3>
          <div class="join w-full">
            <button
              class="btn join-item"
              :class="{
                'btn-primary': currentTheme === 'light',
                'btn-outline': currentTheme !== 'light',
              }"
              @click="changeTheme('light')"
            >
              <span class="text-lg">☀️</span>
              Light
            </button>
            <button
              class="btn join-item"
              :class="{
                'btn-primary': currentTheme === 'business',
                'btn-outline': currentTheme !== 'business',
              }"
              @click="changeTheme('business')"
            >
              <span class="text-lg">🌙</span>
              Business
            </button>
          </div>
          <div class="badge badge-secondary">Theme: {{ currentTheme }}</div>
        </div>
      </div>

      <!-- Locale-specific theme preview -->
      <div class="divider my-6"></div>
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Locale-specific Theme Preview</h3>
        <div
          role="alert"
          class="alert"
          :class="currentLocale === 'af' ? 'alert-info' : 'alert-success'"
        >
          <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path
              v-if="currentLocale === 'af'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 class="font-bold">
              {{ currentLocale === 'af' ? 'Afrikaans Theme' : 'English Theme' }}
            </h4>
            <div class="text-sm">
              {{ currentLocale === 'af' ? 'Afrikaanse tema is aktief' : 'English theme is active' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Current Settings Display -->
      <div class="divider my-6"></div>
      <div class="stats stats-vertical lg:stats-horizontal shadow">
        <div class="stat">
          <div class="stat-figure text-primary">
            <span class="text-2xl">{{ currentLocaleIcon }}</span>
          </div>
          <div class="stat-title">{{ t('app.language') }}</div>
          <div class="stat-value text-lg">{{ currentLocaleLabel }}</div>
          <div class="stat-desc">{{ currentLocale }}</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <span class="text-2xl">{{ themeIcon }}</span>
          </div>
          <div class="stat-title">Theme</div>
          <div class="stat-value text-lg">{{ currentTheme }}</div>
          <div class="stat-desc">{{ themeMode }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { i18n } from '@/plugins/i18n'

const { t, locale } = useI18n()
const { currentTheme, setTheme, availableThemes } = useTheme()
const { switchLocale } = useLocaleRouter()

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

const changeTheme = (theme: string) => {
  setTheme(theme as 'light' | 'business')
}

const currentLocale = computed(() => locale.value)

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

const themeIcon = computed(() => {
  return currentTheme.value === 'light' ? '☀️' : '🌙'
})

const themeMode = computed(() => {
  return currentTheme.value === 'light' ? 'Light Mode' : 'Dark Mode'
})
</script>
