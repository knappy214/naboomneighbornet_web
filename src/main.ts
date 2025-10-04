import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './app.css'
import { i18n } from './plugins/i18n'
import { vuetify } from './plugins/vuetify'
import { useI18nStore } from './stores/i18n'
import { useCacheStore } from './stores/cache'
import { usePrefsStore } from './stores/hub/prefs'
import { useThemeStore } from './stores/theme'
import { piniaPluginPersistedstate } from './plugins/persistedState'
// Import auth debugging utilities
import './utils/authDebug'
// COMMENTED OUT: Data stores - only auth APIs are available for now
// import {
//   useFarmsStore,
//   useAlertsStore,
//   useEquipmentStore,
//   useWeatherStore,
//   useNeighborsStore,
// } from './stores/data'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// Register plugins in correct order
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(vuetify)

// Initialize stores after pinia is installed
const i18nStore = useI18nStore()
const cacheStore = useCacheStore()
const prefsStore = usePrefsStore()
const themeStore = useThemeStore()

// Initialize stores
Promise.all([
  i18nStore.initializeLocale(),
  cacheStore.initialize(),
  prefsStore.initialize(),
  themeStore.initializeTheme(),
])
  .then(async () => {
    // COMMENTED OUT: Initialize data stores after i18n is ready
    // Only auth APIs are available for now
    // const farmsStore = useFarmsStore()
    // const alertsStore = useAlertsStore()
    // const equipmentStore = useEquipmentStore()
    // const weatherStore = useWeatherStore()
    // const neighborsStore = useNeighborsStore()

    // COMMENTED OUT: Initialize data stores
    // await Promise.all([
    //   farmsStore.initialize(),
    //   alertsStore.initialize(),
    //   equipmentStore.initialize(),
    //   weatherStore.initialize(),
    //   neighborsStore.initialize(),
    // ])

    // Mount the app
    app.mount('#app')

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const { initializePush } = await import('./lib/push')
        await initializePush(registration)
      } catch (error) {
        console.warn('Service worker registration failed', error)
      }
    }
  })
  .catch((error) => {
    console.error('Failed to initialize stores:', error)
    // Mount the app anyway
    app.mount('#app')
  })
