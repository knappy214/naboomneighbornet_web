<template>
  <div class="drawer lg:drawer-open">
    <input id="nav-drawer" type="checkbox" class="drawer-toggle" />

    <!-- Main content -->
    <div class="drawer-content">
      <!-- Page content here -->
    </div>

    <!-- Sidebar -->
    <div class="drawer-side">
      <label for="nav-drawer" class="drawer-overlay"></label>
      <aside class="min-h-full w-80 bg-base-200">
        <!-- Header -->
        <div class="p-4 border-b border-base-300">
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="w-10 rounded-full">
                <img :src="logoUrl" :alt="t('app.title')" />
              </div>
            </div>
            <div class="flex-1">
              <h2 class="font-bold text-lg">{{ t('app.title') }}</h2>
              <p class="text-sm text-base-content/70">{{ locale.toUpperCase() }}</p>
            </div>
            <label for="nav-drawer" class="btn btn-ghost btn-sm btn-circle">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </label>
          </div>
        </div>

        <!-- Navigation Menu -->
        <ul class="menu p-4 w-full">
          <!-- Dashboard -->
          <li>
            <router-link
              :to="getLocalizedPath('/dashboard')"
              :class="{ 'menu-active': isRoute('/dashboard') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                />
              </svg>
              {{ t('app.dashboard') }}
            </router-link>
          </li>

          <!-- Monitor -->
          <li>
            <router-link
              :to="getLocalizedPath('/monitor')"
              :class="{ 'menu-active': isRoute('/monitor') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {{ t('app.monitor') }}
            </router-link>
          </li>

          <!-- Panic Dashboard -->
          <li>
            <router-link
              :to="getLocalizedPath('/panic-dashboard')"
              :class="{ 'menu-active': isRoute('/panic-dashboard') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              {{ t('app.panicDashboard') }}
            </router-link>
          </li>

          <!-- Channels -->
          <li>
            <router-link
              :to="getLocalizedPath('/channels')"
              :class="{ 'menu-active': isRoute('/channels') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {{ t('hub.nav.channels') }}
            </router-link>
          </li>

          <div class="divider my-2"></div>

          <!-- Demo Pages -->
          <li>
            <router-link
              :to="getLocalizedPath('/demo')"
              :class="{ 'menu-active': isRoute('/demo') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              {{ t('app.demo') }}
            </router-link>
          </li>

          <li>
            <router-link
              :to="getLocalizedPath('/theme-demo')"
              :class="{ 'menu-active': isRoute('/theme-demo') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
              {{ t('app.themeDemo') }}
            </router-link>
          </li>

          <li>
            <router-link
              :to="getLocalizedPath('/routing-demo')"
              :class="{ 'menu-active': isRoute('/routing-demo') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {{ t('app.localeRouting') }}
            </router-link>
          </li>

          <li>
            <router-link
              :to="getLocalizedPath('/safenaboom')"
              :class="{ 'menu-active': isRoute('/safenaboom') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              {{ t('app.safenaboom') }}
            </router-link>
          </li>

          <li>
            <router-link
              :to="getLocalizedPath('/store-demo')"
              :class="{ 'menu-active': isRoute('/store-demo') }"
              class="flex items-center gap-3"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              {{ t('app.storeDemo') }}
            </router-link>
          </li>

          <div class="divider my-2"></div>

          <!-- Locale Switcher -->
          <li>
            <div class="menu-title">
              <span>{{ t('app.language') }}</span>
            </div>
            <div class="dropdown dropdown-end w-full">
              <div tabindex="0" role="button" class="btn btn-ghost w-full justify-start">
                <span class="text-lg">{{ currentLocaleIcon }}</span>
                <span>{{ currentLocaleLabel }}</span>
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
          </li>

          <!-- Theme Switcher -->
          <li>
            <div class="menu-title">
              <span>{{ t('app.theme') }}</span>
            </div>
            <div class="dropdown dropdown-end w-full">
              <div tabindex="0" role="button" class="btn btn-ghost w-full justify-start">
                <div class="text-lg">{{ themeIcon }}</div>
                <span>{{ themeLabel }}</span>
              </div>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg"
              >
                <li class="menu-title">
                  <span>{{ t('app.theme') }}</span>
                </li>
                <li
                  @click="changeTheme('light')"
                  :class="{ 'menu-active': currentTheme === 'light' }"
                >
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
          </li>

          <div class="divider my-2"></div>

          <!-- Auth Actions -->
          <template v-if="isAuthenticated">
            <li>
              <router-link :to="getLocalizedPath('/profile')" class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {{ t('app.profile') }}
              </router-link>
            </li>
            <li>
              <button @click="logout" class="flex items-center gap-3 text-error">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {{ t('app.logout') }}
              </button>
            </li>
          </template>

          <template v-else>
            <li>
              <router-link :to="getLocalizedPath('/login')" class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                {{ t('app.login') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/register')" class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                {{ t('app.register') }}
              </router-link>
            </li>
          </template>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/plugins/i18n'

const { t, locale } = useI18n()
const route = useRoute()
const { currentTheme, setTheme } = useTheme()
const { switchLocale, getLocalizedPath } = useLocaleRouter()
const authStore = useAuthStore()

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

const themeIcon = computed(() => {
  return currentTheme.value === 'light' ? '💡' : '🏢'
})

const themeLabel = computed(() => {
  return currentTheme.value === 'light' ? t('app.light') : t('app.dark')
})

const isAuthenticated = computed(() => {
  return authStore.accessToken && authStore.accessToken.length > 0
})

const changeTheme = (theme: string) => {
  setTheme(theme as 'light' | 'business')
}

const isRoute = (path: string) => {
  return route.path.includes(path)
}

const logout = async () => {
  // Clear auth state
  authStore.accessToken = ''
  authStore.refreshToken = ''
  // Redirect to login page
  window.location.href = getLocalizedPath('/login')
}

const logoUrl = '/logo.png'
</script>
