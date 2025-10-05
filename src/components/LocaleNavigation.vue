<template>
  <div class="min-h-screen bg-base-100">
    <!-- Clean Navbar -->
    <div class="navbar bg-base-100 shadow-sm">
      <!-- Left: Hamburger Dropdown Menu -->
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <!-- Main Navigation -->
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {{ t('app.panicDashboard') }}
              </router-link>
            </li>

            <li>
              <router-link
                :to="getLocalizedPath('/community-hub')"
                :class="{ 'menu-active': isRoute('/community-hub') }"
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
                {{ t('app.communityHub') }}
              </router-link>
            </li>

            <div class="divider my-2"></div>

            <!-- Demo/Feature Links -->
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {{ t('app.themeDemo') }}
              </router-link>
            </li>

            <li>
              <router-link
                :to="getLocalizedPath('/locale-routing')"
                :class="{ 'menu-active': isRoute('/locale-routing') }"
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
          </ul>
        </div>
      </div>

      <!-- Center: Title -->
      <div class="navbar-center">
        <router-link
          :to="getLocalizedPath('/dashboard')"
          class="btn btn-ghost text-xl font-bold text-primary flex items-center gap-3"
        >
          <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-8 h-8 object-contain" />
          <span class="hidden sm:inline">Naboom NeighborNet</span>
          <span class="sm:hidden">Naboom</span>
        </router-link>
      </div>

      <!-- Right: Profile Dropdown and Toggles -->
      <div class="navbar-end">
        <!-- Theme Toggle -->
        <ThemeSwitcher />

        <!-- Language Toggle -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <span class="text-lg">{{ currentLocaleIcon }}</span>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li v-for="localeItem in supportedLocales" :key="localeItem.code">
              <button
                @click="switchLocale(localeItem.code as 'en' | 'af')"
                :class="{ 'menu-active': localeItem.code === locale }"
                class="flex items-center gap-3"
              >
                <span class="text-lg">{{ localeItem.flag }}</span>
                {{ localeItem.nativeName }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Profile Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div
              class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
            >
              <span class="text-lg font-bold">{{ userInitials }}</span>
            </div>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
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
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="min-h-screen">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
// Theme functionality is handled by ThemeSwitcher component
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/plugins/i18n'
import ThemeSwitcher from './ThemeSwitcher.vue'

const { t, locale } = useI18n()
const route = useRoute()
// Theme functionality is handled by ThemeSwitcher component
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
  const current = supportedLocales.value.find((l) => l.code === locale.value)
  return current?.flag || '🌐'
})

const userInitials = computed(() => {
  // For now, return a default initial since user object structure may vary
  return 'U'
})

const isRoute = (path: string) => {
  return route.path.includes(path)
}

const logout = () => {
  authStore.clear()
  // Navigate to login page
  window.location.href = '/login'
}
</script>
