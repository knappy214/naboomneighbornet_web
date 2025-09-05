import { SUPPORT_LOCALES, type AppLocale } from '@/plugins/i18n'

// Re-export AppLocale for external use
export type { AppLocale }

export interface LocaleDetectionOptions {
  fallbackLocale?: AppLocale
  useLocalStorage?: boolean
  useNavigator?: boolean
  useQueryParam?: boolean
  queryParamName?: string
}

export interface LocaleDetectionResult {
  locale: AppLocale
  source: 'localStorage' | 'navigator' | 'query' | 'fallback'
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Detect user's preferred locale from various sources
 */
export function detectLocale(options: LocaleDetectionOptions = {}): LocaleDetectionResult {
  const {
    fallbackLocale = 'en',
    useLocalStorage = true,
    useNavigator = true,
    useQueryParam = true,
    queryParamName = 'locale',
  } = options

  // 1. Check localStorage (highest confidence)
  if (useLocalStorage) {
    const storedLocale = localStorage.getItem('locale') as AppLocale
    if (storedLocale && SUPPORT_LOCALES.includes(storedLocale)) {
      return {
        locale: storedLocale,
        source: 'localStorage',
        confidence: 'high',
      }
    }
  }

  // 2. Check URL query parameter (high confidence)
  if (useQueryParam && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const queryLocale = urlParams.get(queryParamName) as AppLocale
    if (queryLocale && SUPPORT_LOCALES.includes(queryLocale)) {
      return {
        locale: queryLocale,
        source: 'query',
        confidence: 'high',
      }
    }
  }

  // 3. Check browser navigator (medium confidence)
  if (useNavigator && typeof navigator !== 'undefined') {
    const browserLocale = navigator.language.split('-')[0] as AppLocale
    if (SUPPORT_LOCALES.includes(browserLocale)) {
      return {
        locale: browserLocale,
        source: 'navigator',
        confidence: 'medium',
      }
    }

    // Check navigator.languages for additional locales
    if (navigator.languages) {
      for (const lang of navigator.languages) {
        const locale = lang.split('-')[0] as AppLocale
        if (SUPPORT_LOCALES.includes(locale)) {
          return {
            locale,
            source: 'navigator',
            confidence: 'medium',
          }
        }
      }
    }
  }

  // 4. Fallback to default (low confidence)
  return {
    locale: fallbackLocale,
    source: 'fallback',
    confidence: 'low',
  }
}

/**
 * Get locale from current URL path
 */
export function getLocaleFromPath(path: string): AppLocale | null {
  const segments = path.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (SUPPORT_LOCALES.includes(firstSegment as AppLocale)) {
    return firstSegment as AppLocale
  }

  return null
}

/**
 * Remove locale from path
 */
export function removeLocaleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (SUPPORT_LOCALES.includes(firstSegment as AppLocale)) {
    return '/' + segments.slice(1).join('/')
  }

  return path
}

/**
 * Add locale to path
 */
export function addLocaleToPath(path: string, locale: AppLocale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const pathWithoutLocale = removeLocaleFromPath(cleanPath)
  return `/${locale}${pathWithoutLocale}`
}

/**
 * Check if path has locale prefix
 */
export function hasLocalePrefix(path: string): boolean {
  return getLocaleFromPath(path) !== null
}

/**
 * Get all supported locales with their display names
 */
export function getSupportedLocales(): Array<{
  code: AppLocale
  name: string
  nativeName: string
  flag: string
}> {
  return [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    },
    {
      code: 'af',
      name: 'Afrikaans',
      nativeName: 'Afrikaans',
      flag: '🇿🇦',
    },
  ]
}

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is AppLocale {
  return SUPPORT_LOCALES.includes(locale as AppLocale)
}

/**
 * Get locale-specific route name
 */
export function getLocalizedRouteName(baseName: string, locale: AppLocale): string {
  return `${baseName}-${locale}`
}

/**
 * Extract base route name from localized route name
 */
export function getBaseRouteName(localizedName: string): string {
  return localizedName.replace(/^(.+)-[a-z]{2}$/, '$1')
}
