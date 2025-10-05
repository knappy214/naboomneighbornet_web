import { defineStore } from 'pinia'

export type ThemeName = 'light' | 'business'

export interface Theme {
  name: ThemeName
  label: string
  icon: string
  isDark: boolean
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'light' as ThemeName,
    themes: [
      { name: 'light', label: 'Light', icon: '💡', isDark: false },
      { name: 'business', label: 'Business', icon: '🏢', isDark: true },
    ] as Theme[],
  }),

  getters: {
    currentThemeData: (state) => {
      return state.themes.find((theme) => theme.name === state.currentTheme) || state.themes[0]
    },
    isDarkMode: (state) => {
      return state.currentThemeData?.isDark || false
    },
  },

  actions: {
    setTheme(themeName: ThemeName) {
      this.currentTheme = themeName
      this.applyTheme()
      this.saveToStorage()
    },

    toggleTheme() {
      const currentIndex = this.themes.findIndex((theme) => theme.name === this.currentTheme)
      const nextIndex = (currentIndex + 1) % this.themes.length
      this.setTheme(this.themes[nextIndex].name)
    },

    applyTheme() {
      const themeData = this.currentThemeData
      if (themeData) {
        // Apply DaisyUI theme
        document.documentElement.setAttribute('data-theme', themeData.name)
        document.documentElement.classList.toggle('dark', themeData.isDark)
      }
    },

    loadFromStorage() {
      const savedTheme = localStorage.getItem('theme') as ThemeName
      if (savedTheme && this.themes.some((theme) => theme.name === savedTheme)) {
        this.currentTheme = savedTheme
        this.applyTheme()
      } else {
        // Default to light theme
        this.setTheme('light')
      }
    },

    saveToStorage() {
      localStorage.setItem('theme', this.currentTheme)
    },

    initializeTheme() {
      this.loadFromStorage()
    },
  },

  persist: [
    {
      key: 'theme',
      paths: ['currentTheme'],
    },
  ],
})
