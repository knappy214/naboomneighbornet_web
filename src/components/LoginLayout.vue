<template>
  <div class="min-h-screen bg-base-200">
    <!-- Clean daisyUI Navbar -->
    <div class="navbar bg-base-100 shadow-sm">
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost text-xl font-bold text-primary">
          <img src="/logo.png" alt="Logo" class="w-8 h-8 mr-2" />
          {{ t('app.title') }}
        </router-link>
      </div>

      <div class="navbar-end gap-2">
        <!-- Language Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
            <span class="text-lg">{{ currentLocaleIcon }}</span>
            <span class="hidden sm:inline ml-1">{{ currentLocaleLabel }}</span>
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
              :class="{ 'menu-active': localeOption.code === locale }"
            >
              <button class="flex items-center gap-3">
                <span class="text-lg">{{ localeOption.flag }}</span>
                <span>{{ localeOption.nativeName }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Theme Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
            <div class="text-lg">{{ themeIcon }}</div>
            <span class="hidden sm:inline ml-1">{{ themeLabel }}</span>
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
                <span v-if="currentTheme === 'light'" class="badge badge-primary badge-sm">{{
                  t('common.active')
                }}</span>
              </button>
            </li>
            <li
              @click="changeTheme('business')"
              :class="{ 'menu-active': currentTheme === 'business' }"
            >
              <button class="flex items-center gap-3">
                <span class="text-lg">🏢</span>
                <span>{{ t('app.dark') }}</span>
                <span v-if="currentTheme === 'business'" class="badge badge-primary badge-sm">{{
                  t('common.active')
                }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main>
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <aside>
        <p>© 2024 {{ t('app.title') }}. {{ t('common.allRightsReserved') }}.</p>
      </aside>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { i18n } from '@/plugins/i18n'

const { t, locale } = useI18n()
const { currentTheme, setTheme } = useTheme()
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
  return currentTheme.value === 'light' ? '💡' : '🏢'
})

const themeLabel = computed(() => {
  return currentTheme.value === 'light' ? t('app.light') : t('app.dark')
})
</script>
