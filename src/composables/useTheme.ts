import { computed } from 'vue'
import { useThemeStore, type ThemeName } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()

  const currentTheme = computed(() => themeStore.currentTheme)
  const currentThemeData = computed(() => themeStore.currentThemeData)
  const isDarkMode = computed(() => themeStore.isDarkMode)
  const themes = computed(() => themeStore.themes)
  const availableThemes = computed(() => ['light', 'business'])

  const setTheme = (themeName: ThemeName) => {
    themeStore.setTheme(themeName)
    // Apply theme to HTML element for daisyUI
    document.documentElement.setAttribute('data-theme', themeName)
  }

  const toggleTheme = () => {
    themeStore.toggleTheme()
    // Apply theme to HTML element for daisyUI
    document.documentElement.setAttribute('data-theme', themeStore.currentTheme)
  }

  const initializeTheme = () => {
    themeStore.initializeTheme()
    // Apply theme to HTML element for daisyUI
    document.documentElement.setAttribute('data-theme', themeStore.currentTheme)
  }

  return {
    currentTheme,
    currentThemeData,
    isDarkMode,
    themes,
    availableThemes,
    setTheme,
    toggleTheme,
    initializeTheme,
  }
}
