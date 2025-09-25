<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
    <v-list-item
      :prepend-avatar="logoUrl"
      :title="t('app.title')"
      :subtitle="currentLocale.toUpperCase()"
      nav
    >
      <template #append>
        <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail" />
      </template>
    </v-list-item>

    <v-divider />

    <v-list density="compact" nav>
      <!-- Dashboard -->
      <v-list-item
        :prepend-icon="'mdi-view-dashboard'"
        :title="t('app.dashboard')"
        :value="'dashboard'"
        :to="getLocalizedPath('/dashboard')"
        :active="isRoute('/dashboard')"
      />

      <v-list-item
        :prepend-icon="'mdi-map-marker-alert'"
        :title="t('app.monitor')"
        :value="'monitor'"
        :to="getLocalizedPath('/monitor')"
        :active="isRoute('/monitor')"
      />

      <v-list-item
        :prepend-icon="'mdi-view-dashboard-variant'"
        :title="t('app.panicDashboard')"
        :value="'panic-dashboard'"
        :to="getLocalizedPath('/panic-dashboard')"
        :active="isRoute('/panic-dashboard')"
      />

      <v-list-item
        :prepend-icon="'mdi-forum'"
        :title="t('hub.nav.channels')"
        :value="'channels'"
        :to="getLocalizedPath('/channels')"
        :active="isRoute('/channels')"
      />

      <!-- Demo Pages -->
      <v-list-item
        :prepend-icon="'mdi-translate'"
        :title="t('app.demo')"
        :value="'demo'"
        :to="getLocalizedPath('/demo')"
        :active="isRoute('/demo')"
      />

      <v-list-item
        :prepend-icon="'mdi-palette'"
        :title="t('app.themeDemo')"
        :value="'theme-demo'"
        :to="getLocalizedPath('/theme-demo')"
        :active="isRoute('/theme-demo')"
      />

      <v-list-item
        :prepend-icon="'mdi-routes'"
        :title="t('app.localeRouting')"
        :value="'routing-demo'"
        :to="getLocalizedPath('/routing-demo')"
        :active="isRoute('/routing-demo')"
      />

      <v-list-item
        :prepend-icon="'mdi-shield-check'"
        :title="t('app.safenaboom')"
        :value="'safenaboom'"
        :to="getLocalizedPath('/safenaboom')"
        :active="isRoute('/safenaboom')"
      />

      <v-list-item
        :prepend-icon="'mdi-database'"
        :title="t('app.storeDemo')"
        :value="'store-demo'"
        :to="getLocalizedPath('/store-demo')"
        :active="isRoute('/store-demo')"
      />

      <v-divider class="my-2" />

      <!-- Locale Switcher -->
      <v-list-item :prepend-icon="'mdi-translate'" :title="t('app.language')" :value="'language'">
        <template #append>
          <v-menu>
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="text" size="small" :prepend-icon="currentLocaleIcon">
                {{ currentLocaleLabel }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="locale in supportedLocales"
                :key="locale.code"
                :value="locale.code"
                @click="switchLocale(locale.code)"
                :active="locale.code === currentLocale"
              >
                <template #prepend>
                  <span class="text-lg">{{ locale.flag }}</span>
                </template>
                <v-list-item-title>{{ locale.nativeName }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>

      <!-- Theme Switcher -->
      <v-list-item :prepend-icon="'mdi-palette'" :title="t('app.theme')" :value="'theme'">
        <template #append>
          <v-btn-toggle
            v-model="currentTheme"
            mandatory
            @update:model-value="changeTheme"
            size="small"
            density="compact"
          >
            <v-btn value="light" size="small">
              <v-icon size="small">mdi-weather-sunny</v-icon>
            </v-btn>
            <v-btn value="business" size="small">
              <v-icon size="small">mdi-weather-night</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
      </v-list-item>

      <v-divider class="my-2" />

      <!-- Auth Actions -->
      <template v-if="isAuthenticated">
        <v-list-item
          :prepend-icon="'mdi-logout'"
          :title="t('app.logout')"
          :value="'logout'"
          @click="handleLogout"
        />
        <v-list-item
          :prepend-icon="'mdi-bell-ring'"
          :title="t('hub.nav.notifications')"
          :value="'notification-settings'"
          :to="getLocalizedPath('/settings/notifications')"
          :active="isRoute('/settings/notifications')"
        />
      </template>
      <template v-else>
        <v-list-item
          :prepend-icon="'mdi-login'"
          :title="t('app.login')"
          :value="'login'"
          :to="getLocalizedPath('/login')"
          :active="isRoute('/login')"
        />
        <v-list-item
          :prepend-icon="'mdi-account-plus'"
          :title="t('app.register')"
          :value="'register'"
          :to="getLocalizedPath('/register')"
          :active="isRoute('/register')"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { getSupportedLocales } from '@/utils/localeDetection'

const { t } = useI18n()
const theme = useTheme()
const authStore = useAuthStore()
const { currentLocale, switchLocale, getLocalizedPath, isRoute, goToLogin } = useLocaleRouter()

const drawer = ref(true)
const rail = ref(false)
const supportedLocales = getSupportedLocales()

const isAuthenticated = computed(() => authStore.accessToken && authStore.accessToken.length > 0)

const currentTheme = ref(theme.current.value.dark ? 'business' : 'light')

const currentLocaleIcon = computed(() => {
  const localeInfo = supportedLocales.find((l) => l.code === currentLocale.value)
  return localeInfo?.flag || '🌐'
})

const currentLocaleLabel = computed(() => {
  const localeInfo = supportedLocales.find((l) => l.code === currentLocale.value)
  return localeInfo?.nativeName || currentLocale.value.toUpperCase()
})

const logoUrl = '/logo.png'

const changeTheme = (newTheme: string) => {
  theme.global.name.value = newTheme
  localStorage.setItem('theme', newTheme)
  currentTheme.value = newTheme
}

const handleLogout = () => {
  authStore.clear()
  goToLogin()
}

// Watch for theme changes
watch(
  () => theme.current.value.dark,
  (isDark) => {
    currentTheme.value = isDark ? 'business' : 'light'
  },
)
</script>
