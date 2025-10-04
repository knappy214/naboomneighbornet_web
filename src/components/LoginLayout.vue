<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { getSupportedLocales } from '@/utils/localeDetection'
import { useLocaleRouter } from '@/composables/useLocaleRouter'

const { t, locale } = useI18n()
const { currentTheme, currentThemeData, setTheme } = useTheme()
const { switchLocale } = useLocaleRouter()

const supportedLocales = getSupportedLocales()

const currentLocaleIcon = computed(() => {
  const localeInfo = supportedLocales.find((l) => l.code === locale.value)
  return localeInfo?.flag || '🌐'
})

const currentLocaleLabel = computed(() => {
  const localeInfo = supportedLocales.find((l) => l.code === locale.value)
  return localeInfo?.nativeName || locale.value.toUpperCase()
})

const themeIcon = computed(() => {
  return currentThemeData.value?.icon || '🌙'
})

const themeLabel = computed(() => {
  return currentThemeData.value?.label || 'Theme'
})

const changeTheme = (newTheme: string) => {
  setTheme(newTheme as 'light' | 'business')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-dot-pattern"></div>
    </div>

    <!-- Clean Header with Language and Theme Switchers -->
    <div class="navbar bg-base-100/80 backdrop-blur-sm shadow-sm">
      <div class="navbar-start">
        <router-link
          to="/"
          class="btn btn-ghost text-xl font-bold text-primary flex items-center gap-3"
        >
          <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-8 h-8 object-contain" />
          {{ t('app.title') }}
        </router-link>
      </div>

      <div class="navbar-end">
        <!-- Language Switcher -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
            <span class="text-lg">{{ currentLocaleIcon }}</span>
            <span class="hidden sm:inline">{{ currentLocaleLabel }}</span>
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
              @click="switchLocale(localeOption.code)"
              :class="{ 'menu-active': localeOption.code === locale }"
            >
              <button class="flex items-center gap-3">
                <span class="text-lg">{{ localeOption.flag }}</span>
                <span>{{ localeOption.nativeName }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Theme Switcher -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
            <div class="text-lg">{{ themeIcon }}</div>
            <span class="hidden sm:inline">{{ themeLabel }}</span>
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg"
          >
            <li class="menu-title">
              <span>{{ t('app.theme') }}</span>
            </li>
            <li @click="changeTheme('light')" :class="{ 'menu-active': currentTheme === 'light' }">
              <button class="flex items-center gap-3">
                <span class="text-lg">💡</span>
                <span>{{ t('app.light') }}</span>
                <span v-if="currentTheme === 'light'" class="badge badge-primary badge-sm">
                  {{ t('common.active') }}
                </span>
              </button>
            </li>
            <li
              @click="changeTheme('business')"
              :class="{ 'menu-active': currentTheme === 'business' }"
            >
              <button class="flex items-center gap-3">
                <span class="text-lg">🏢</span>
                <span>{{ t('app.dark') }}</span>
                <span v-if="currentTheme === 'business'" class="badge badge-primary badge-sm">
                  {{ t('common.active') }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div class="w-full max-w-6xl">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-100/50 backdrop-blur-sm text-base-content">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-6 h-6 object-contain" />
          <span class="font-semibold">{{ t('app.title') }}</span>
        </div>
        <p class="text-sm opacity-70">{{ t('auth.subtitle') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.bg-dot-pattern {
  background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
