import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { SUPPORT_LOCALES, type AppLocale } from '@/plugins/i18n'
import { detectLocale } from '@/utils/localeDetection'

// TypeScript interfaces
export interface LocaleState {
  currentLocale: AppLocale
  fallbackLocale: AppLocale
  availableLocales: AppLocale[]
  isLocaleChanging: boolean
  lastLocaleChange: Date | null
  userPreference: AppLocale | null
}

export interface LocaleDetectionResult {
  locale: AppLocale
  confidence: 'high' | 'medium' | 'low' | 'default'
  source: 'url' | 'localStorage' | 'navigator' | 'fallback'
}

export interface LocaleChangeEvent {
  from: AppLocale
  to: AppLocale
  timestamp: Date
  source: 'user' | 'system' | 'detection'
}

// Store definition
export const useI18nStore = defineStore('i18n', () => {
  // Reactive state
  const state = ref<LocaleState>({
    currentLocale: 'en',
    fallbackLocale: 'en',
    availableLocales: [...SUPPORT_LOCALES],
    isLocaleChanging: false,
    lastLocaleChange: null,
    userPreference: null,
  })

  // Composables - will be initialized lazily
  let i18nInstance: any = null
  let routerInstance: any = null

  const getI18nInstance = () => {
    if (!i18nInstance) {
      try {
        i18nInstance = useI18n()
      } catch (error) {
        console.warn('useI18n not available yet, using fallback')
        return null
      }
    }
    return i18nInstance
  }

  const getRouterInstance = () => {
    if (!routerInstance) {
      try {
        routerInstance = useRouter()
      } catch (error) {
        console.warn('useRouter not available yet, using fallback')
        return null
      }
    }
    return routerInstance
  }

  // Computed properties
  const currentLocale = computed({
    get: () => state.value.currentLocale,
    set: (newLocale: AppLocale) => {
      if (newLocale !== state.value.currentLocale) {
        changeLocale(newLocale, 'user')
      }
    },
  })

  const isRTL = computed(() => {
    // Add RTL language support if needed
    const rtlLocales = ['ar', 'he', 'fa']
    return rtlLocales.includes(state.value.currentLocale)
  })

  const localeInfo = computed(() => {
    const locale = state.value.currentLocale
    return {
      code: locale,
      name: getLocaleName(locale),
      nativeName: getNativeLocaleName(locale),
      flag: getLocaleFlag(locale),
      direction: isRTL.value ? 'rtl' : 'ltr',
    }
  })

  const availableLocaleInfo = computed(() => {
    return state.value.availableLocales.map((locale) => ({
      code: locale,
      name: getLocaleName(locale),
      nativeName: getNativeLocaleName(locale),
      flag: getLocaleFlag(locale),
      direction: ['ar', 'he', 'fa'].includes(locale) ? 'rtl' : 'ltr',
    }))
  })

  // Actions
  const initializeLocale = async (): Promise<LocaleDetectionResult> => {
    try {
      // Detect locale from various sources
      const detection = detectLocale()
      const i18nInstance = getI18nInstance()

      // Set initial state
      state.value.currentLocale = detection.locale
      state.value.fallbackLocale = i18nInstance?.fallbackLocale?.value || 'en'

      // Load user preference from localStorage
      const savedPreference = localStorage.getItem('locale') as AppLocale | null
      if (savedPreference && SUPPORT_LOCALES.includes(savedPreference)) {
        state.value.userPreference = savedPreference
        if (savedPreference !== detection.locale) {
          state.value.currentLocale = savedPreference
        }
      }

      // Update i18n locale if available
      if (i18nInstance?.locale) {
        i18nInstance.locale.value = state.value.currentLocale
      }

      // Save to localStorage
      localStorage.setItem('locale', state.value.currentLocale)

      return {
        locale: state.value.currentLocale,
        confidence: detection.confidence,
        source: savedPreference ? 'localStorage' : 'navigator',
      }
    } catch (error) {
      console.error('Failed to initialize locale:', error)
      return {
        locale: 'en',
        confidence: 'default',
        source: 'fallback',
      }
    }
  }

  const changeLocale = async (
    newLocale: AppLocale,
    source: 'user' | 'system' | 'detection' = 'user',
  ): Promise<void> => {
    if (newLocale === state.value.currentLocale) return

    const oldLocale = state.value.currentLocale
    state.value.isLocaleChanging = true

    try {
      // Update state
      state.value.currentLocale = newLocale
      state.value.lastLocaleChange = new Date()

      // Update i18n locale if available
      const i18nInstance = getI18nInstance()
      if (i18nInstance?.locale) {
        i18nInstance.locale.value = newLocale
      }

      // Save to localStorage
      localStorage.setItem('locale', newLocale)
      state.value.userPreference = newLocale

      // Emit locale change event
      const changeEvent: LocaleChangeEvent = {
        from: oldLocale,
        to: newLocale,
        timestamp: new Date(),
        source,
      }

      // Notify other stores about locale change
      await notifyLocaleChange(changeEvent)

      // Update document attributes
      updateDocumentAttributes(newLocale)

      console.log(`Locale changed from ${oldLocale} to ${newLocale}`)
    } catch (error) {
      console.error('Failed to change locale:', error)
      // Revert on error
      state.value.currentLocale = oldLocale
      const i18nInstance = getI18nInstance()
      if (i18nInstance?.locale) {
        i18nInstance.locale.value = oldLocale
      }
    } finally {
      state.value.isLocaleChanging = false
    }
  }

  const detectAndSetLocale = async (path?: string): Promise<LocaleDetectionResult> => {
    const detection = detectLocale()

    if (detection.locale !== state.value.currentLocale) {
      await changeLocale(detection.locale, 'detection')
    }

    return {
      locale: detection.locale,
      confidence: detection.confidence,
      source: 'url',
    }
  }

  const resetToUserPreference = async (): Promise<void> => {
    if (state.value.userPreference) {
      await changeLocale(state.value.userPreference, 'user')
    }
  }

  const resetToSystemDefault = async (): Promise<void> => {
    await changeLocale(state.value.fallbackLocale, 'system')
  }

  // Helper functions
  const getLocaleName = (locale: AppLocale): string => {
    const names: Record<AppLocale, string> = {
      en: 'English',
      af: 'Afrikaans',
    }
    return names[locale] || locale.toUpperCase()
  }

  const getNativeLocaleName = (locale: AppLocale): string => {
    const nativeNames: Record<AppLocale, string> = {
      en: 'English',
      af: 'Afrikaans',
    }
    return nativeNames[locale] || locale.toUpperCase()
  }

  const getLocaleFlag = (locale: AppLocale): string => {
    const flags: Record<AppLocale, string> = {
      en: '🇺🇸',
      af: '🇿🇦',
    }
    return flags[locale] || '🌐'
  }

  const updateDocumentAttributes = (locale: AppLocale): void => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'
  }

  const notifyLocaleChange = async (changeEvent: LocaleChangeEvent): Promise<void> => {
    // This will be used to notify other stores about locale changes
    // We'll implement this when we create the cache store
    console.log('Locale change event:', changeEvent)
  }

  // Watchers
  watch(
    () => state.value.currentLocale,
    (newLocale) => {
      // Update document title based on locale
      const title = document.title
      const baseTitle = title.split(' | ')[0] || 'Naboom NeighborNet'
      document.title = `${baseTitle} | ${getLocaleName(newLocale)}`
    },
    { immediate: true },
  )

  // Getters
  const isLocaleSupported = (locale: string): locale is AppLocale => {
    return SUPPORT_LOCALES.includes(locale as AppLocale)
  }

  const getLocaleFromPath = (path: string): AppLocale | null => {
    const segments = path.split('/').filter(Boolean)
    const firstSegment = segments[0]
    return firstSegment && isLocaleSupported(firstSegment) ? firstSegment : null
  }

  const getLocalizedPath = (path: string, targetLocale?: AppLocale): string => {
    const locale = targetLocale || state.value.currentLocale
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    // Remove existing locale prefix
    const pathWithoutLocale = cleanPath.replace(
      new RegExp(`^/(${SUPPORT_LOCALES.join('|')})(/|$)`),
      '/',
    )

    return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
  }

  return {
    // State
    state,

    // Computed
    currentLocale,
    isRTL,
    localeInfo,
    availableLocaleInfo,

    // Actions
    initializeLocale,
    changeLocale,
    detectAndSetLocale,
    resetToUserPreference,
    resetToSystemDefault,

    // Getters
    isLocaleSupported,
    getLocaleFromPath,
    getLocalizedPath,
  }
})
