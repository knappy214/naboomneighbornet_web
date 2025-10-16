/**
 * Internationalization Composable
 * Provides comprehensive i18n support for English and Afrikaans
 * Optimized for South African community communication
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserProfile, Language } from '@/types/communication'

interface I18nConfig {
  defaultLocale: Language
  fallbackLocale: Language
  enableAutoDetection: boolean
  enableRTL: boolean
  enablePluralization: boolean
  enableDateTimeFormatting: boolean
  enableNumberFormatting: boolean
  debug?: boolean
}

interface LocaleData {
  code: Language
  name: string
  nativeName: string
  flag: string
  rtl: boolean
  dateFormat: string
  timeFormat: string
  numberFormat: Intl.NumberFormatOptions
  currency: string
}

interface TranslationKey {
  key: string
  value: string
  context?: string
  plural?: string
}

export function useInternationalization(config: Partial<I18nConfig> = {}) {
  // ============================================================================
  // Configuration
  // ============================================================================

  const defaultConfig: Required<I18nConfig> = {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    enableAutoDetection: true,
    enableRTL: false,
    enablePluralization: true,
    enableDateTimeFormatting: true,
    enableNumberFormatting: true,
    debug: false,
  }

  const i18nConfig = { ...defaultConfig, ...config }

  // ============================================================================
  // State
  // ============================================================================

  const { t, locale, availableLocales, setLocaleMessage } = useI18n()
  const isInitialized = ref(false)
  const currentLocale = ref<Language>(i18nConfig.defaultLocale)
  const isRTL = ref(false)
  const isLoading = ref(false)

  const localeData = reactive<Record<Language, LocaleData>>({
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
      dateFormat: 'MM/dd/yyyy',
      timeFormat: 'h:mm a',
      numberFormat: { style: 'decimal' },
      currency: 'USD',
    },
    af: {
      code: 'af',
      name: 'Afrikaans',
      nativeName: 'Afrikaans',
      flag: '🇿🇦',
      rtl: false,
      dateFormat: 'dd/MM/yyyy',
      timeFormat: 'HH:mm',
      numberFormat: { style: 'decimal' },
      currency: 'ZAR',
    },
  })

  // ============================================================================
  // Locale Management
  // ============================================================================

  /**
   * Initialize internationalization
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    try {
      isLoading.value = true

      // Load translations
      await loadTranslations()

      // Setup locale detection
      if (i18nConfig.enableAutoDetection) {
        await detectLocale()
      }

      // Setup RTL support
      if (i18nConfig.enableRTL) {
        setupRTLSupport()
      }

      // Setup formatting
      if (i18nConfig.enableDateTimeFormatting) {
        setupDateTimeFormatting()
      }

      if (i18nConfig.enableNumberFormatting) {
        setupNumberFormatting()
      }

      isInitialized.value = true
      log('Internationalization initialized')
    } catch (error) {
      log('Internationalization initialization failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load translations for all locales
   */
  async function loadTranslations(): Promise<void> {
    try {
      // Load English translations
      const enTranslations = await import('@/locales/en.json')
      setLocaleMessage('en', enTranslations.default)

      // Load Afrikaans translations
      const afTranslations = await import('@/locales/af.json')
      setLocaleMessage('af', afTranslations.default)

      log('Translations loaded for all locales')
    } catch (error) {
      log('Failed to load translations:', error)
      throw error
    }
  }

  /**
   * Detect user's preferred locale
   */
  async function detectLocale(): Promise<void> {
    try {
      // Check localStorage first
      const savedLocale = localStorage.getItem('preferred-locale') as Language
      if (savedLocale && availableLocales.includes(savedLocale)) {
        currentLocale.value = savedLocale
        locale.value = savedLocale
        return
      }

      // Check browser language
      const browserLocale = navigator.language.split('-')[0] as Language
      if (availableLocales.includes(browserLocale)) {
        currentLocale.value = browserLocale
        locale.value = browserLocale
        return
      }

      // Check navigator.languages
      for (const lang of navigator.languages) {
        const code = lang.split('-')[0] as Language
        if (availableLocales.includes(code)) {
          currentLocale.value = code
          locale.value = code
          return
        }
      }

      // Fallback to default
      currentLocale.value = i18nConfig.defaultLocale
      locale.value = i18nConfig.defaultLocale

      log('Locale detected:', currentLocale.value)
    } catch (error) {
      log('Locale detection failed:', error)
      currentLocale.value = i18nConfig.defaultLocale
      locale.value = i18nConfig.defaultLocale
    }
  }

  /**
   * Change locale
   */
  async function changeLocale(newLocale: Language): Promise<void> {
    if (newLocale === currentLocale.value) return

    try {
      isLoading.value = true

      // Update locale
      currentLocale.value = newLocale
      locale.value = newLocale

      // Update RTL support
      if (i18nConfig.enableRTL) {
        isRTL.value = localeData[newLocale].rtl
        document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'
      }

      // Update document language
      document.documentElement.lang = newLocale

      // Save preference
      localStorage.setItem('preferred-locale', newLocale)

      // Announce change to screen readers
      const announcement = t('locale.changed', { locale: localeData[newLocale].nativeName })
      announceToScreenReader(announcement)

      log('Locale changed to:', newLocale)
    } catch (error) {
      log('Failed to change locale:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // RTL Support
  // ============================================================================

  /**
   * Setup RTL support
   */
  function setupRTLSupport(): void {
    if (!i18nConfig.enableRTL) return

    // Set initial direction
    isRTL.value = localeData[currentLocale.value].rtl
    document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'

    // Add RTL class to body
    if (isRTL.value) {
      document.body.classList.add('rtl')
    } else {
      document.body.classList.remove('rtl')
    }

    log('RTL support setup:', isRTL.value)
  }

  // ============================================================================
  // Translation Functions
  // ============================================================================

  /**
   * Translate with context
   */
  function translate(key: string, params?: Record<string, any>, context?: string): string {
    try {
      // Add context to key if provided
      const fullKey = context ? `${context}.${key}` : key

      // Translate with parameters
      const translation = t(fullKey, params)

      // Check if translation exists
      if (translation === fullKey) {
        log('Translation missing:', fullKey)
        return key
      }

      return translation
    } catch (error) {
      log('Translation failed:', error)
      return key
    }
  }

  /**
   * Translate with pluralization
   */
  function translatePlural(key: string, count: number, params?: Record<string, any>): string {
    if (!i18nConfig.enablePluralization) {
      return translate(key, { ...params, count })
    }

    try {
      // Use Vue I18n's pluralization
      return t(key, { ...params, count })
    } catch (error) {
      log('Pluralization failed:', error)
      return translate(key, { ...params, count })
    }
  }

  /**
   * Translate with gender
   */
  function translateGender(
    key: string,
    gender: 'male' | 'female' | 'other',
    params?: Record<string, any>,
  ): string {
    try {
      // Add gender to parameters
      const genderParams = { ...params, gender }

      // Try gender-specific key first
      const genderKey = `${key}.${gender}`
      let translation = t(genderKey, genderParams)

      if (translation === genderKey) {
        // Fallback to base key
        translation = t(key, genderParams)
      }

      return translation
    } catch (error) {
      log('Gender translation failed:', error)
      return translate(key, params)
    }
  }

  // ============================================================================
  // Date and Time Formatting
  // ============================================================================

  /**
   * Setup date and time formatting
   */
  function setupDateTimeFormatting(): void {
    if (!i18nConfig.enableDateTimeFormatting) return

    // This would be implemented by individual components
    log('Date and time formatting setup')
  }

  /**
   * Format date
   */
  function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      const localeCode = currentLocale.value
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }

      return new Intl.DateTimeFormat(localeCode, { ...defaultOptions, ...options }).format(date)
    } catch (error) {
      log('Date formatting failed:', error)
      return date.toLocaleDateString()
    }
  }

  /**
   * Format time
   */
  function formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      const localeCode = currentLocale.value
      const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      }

      return new Intl.DateTimeFormat(localeCode, { ...defaultOptions, ...options }).format(date)
    } catch (error) {
      log('Time formatting failed:', error)
      return date.toLocaleTimeString()
    }
  }

  /**
   * Format relative time
   */
  function formatRelativeTime(date: Date): string {
    try {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return translate('time.just_now')
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return translatePlural('time.minutes_ago', minutes, { count: minutes })
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return translatePlural('time.hours_ago', hours, { count: hours })
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400)
        return translatePlural('time.days_ago', days, { count: days })
      } else {
        return formatDate(date)
      }
    } catch (error) {
      log('Relative time formatting failed:', error)
      return formatDate(date)
    }
  }

  // ============================================================================
  // Number Formatting
  // ============================================================================

  /**
   * Setup number formatting
   */
  function setupNumberFormatting(): void {
    if (!i18nConfig.enableNumberFormatting) return

    // This would be implemented by individual components
    log('Number formatting setup')
  }

  /**
   * Format number
   */
  function formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
      const localeCode = currentLocale.value
      const defaultOptions: Intl.NumberFormatOptions = {
        style: 'decimal',
      }

      return new Intl.NumberFormat(localeCode, { ...defaultOptions, ...options }).format(number)
    } catch (error) {
      log('Number formatting failed:', error)
      return number.toString()
    }
  }

  /**
   * Format currency
   */
  function formatCurrency(amount: number, currency?: string): string {
    try {
      const localeCode = currentLocale.value
      const currencyCode = currency || localeData[currentLocale.value].currency

      return new Intl.NumberFormat(localeCode, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount)
    } catch (error) {
      log('Currency formatting failed:', error)
      return `${currency || 'USD'} ${amount.toFixed(2)}`
    }
  }

  /**
   * Format percentage
   */
  function formatPercentage(value: number, decimals: number = 0): string {
    try {
      const localeCode = currentLocale.value

      return new Intl.NumberFormat(localeCode, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100)
    } catch (error) {
      log('Percentage formatting failed:', error)
      return `${value.toFixed(decimals)}%`
    }
  }

  // ============================================================================
  // User Profile Integration
  // ============================================================================

  /**
   * Load user language preferences
   */
  function loadUserLanguagePreferences(user: UserProfile): void {
    if (user.language && availableLocales.includes(user.language)) {
      changeLocale(user.language)
    }
  }

  /**
   * Save user language preferences
   */
  function saveUserLanguagePreferences(user: UserProfile): UserProfile {
    return {
      ...user,
      language: currentLocale.value,
    }
  }

  // ============================================================================
  // Screen Reader Support
  // ============================================================================

  /**
   * Announce to screen readers
   */
  function announceToScreenReader(message: string): void {
    // Create or update live region
    let liveRegion = document.getElementById('a11y-live-region')

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'a11y-live-region'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }

    liveRegion.textContent = message

    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 1000)
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Get available locales
   */
  function getAvailableLocales(): LocaleData[] {
    return Object.values(localeData)
  }

  /**
   * Get current locale data
   */
  function getCurrentLocaleData(): LocaleData {
    return localeData[currentLocale.value]
  }

  /**
   * Check if translation exists
   */
  function hasTranslation(key: string): boolean {
    try {
      const translation = t(key)
      return translation !== key
    } catch {
      return false
    }
  }

  /**
   * Get translation key suggestions
   */
  function getTranslationSuggestions(key: string): string[] {
    // This would implement fuzzy matching for translation keys
    // For now, return empty array
    return []
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const isEnglish = computed(() => currentLocale.value === 'en')
  const isAfrikaans = computed(() => currentLocale.value === 'af')
  const currentLocaleData = computed(() => getCurrentLocaleData())

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Cleanup internationalization
   */
  function cleanup(): void {
    isInitialized.value = false
    isLoading.value = false
    currentLocale.value = i18nConfig.defaultLocale
    isRTL.value = false

    // Remove RTL class
    document.body.classList.remove('rtl')
    document.documentElement.dir = 'ltr'

    log('Internationalization cleaned up')
  }

  // ============================================================================
  // Logging
  // ============================================================================

  function log(...args: any[]): void {
    if (i18nConfig.debug) {
      console.log('[Internationalization]', ...args)
    }
  }

  // ============================================================================
  // Composable API
  // ============================================================================

  return {
    // State
    isInitialized: computed(() => isInitialized.value),
    isLoading: computed(() => isLoading.value),
    currentLocale: computed(() => currentLocale.value),
    isRTL: computed(() => isRTL.value),
    localeData: computed(() => localeData),

    // Computed
    isEnglish,
    isAfrikaans,
    currentLocaleData,

    // Functions
    initialize,
    changeLocale,
    translate,
    translatePlural,
    translateGender,
    formatDate,
    formatTime,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    formatPercentage,
    loadUserLanguagePreferences,
    saveUserLanguagePreferences,
    announceToScreenReader,
    getAvailableLocales,
    getCurrentLocaleData,
    hasTranslation,
    getTranslationSuggestions,

    // Lifecycle
    cleanup,
  }
}
