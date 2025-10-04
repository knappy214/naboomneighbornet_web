import { computed } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { useThemeStore, type ThemeName } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()
  const vuetifyTheme = useVuetifyTheme()

  const currentTheme = computed(() => themeStore.currentTheme)
  const currentThemeData = computed(() => themeStore.currentThemeData)
  const isDarkMode = computed(() => themeStore.isDarkMode)
  const themes = computed(() => themeStore.themes)

  const setTheme = (themeName: ThemeName) => {
    themeStore.setTheme(themeName)
    // Sync with Vuetify
    vuetifyTheme.global.name.value = themeName
  }

  const toggleTheme = () => {
    themeStore.toggleTheme()
    // Sync with Vuetify
    vuetifyTheme.global.name.value = themeStore.currentTheme
  }

  const initializeTheme = () => {
    themeStore.initializeTheme()
    // Sync with Vuetify
    vuetifyTheme.global.name.value = themeStore.currentTheme
  }

  return {
    currentTheme,
    currentThemeData,
    isDarkMode,
    themes,
    setTheme,
    toggleTheme,
    initializeTheme,
  }
}
