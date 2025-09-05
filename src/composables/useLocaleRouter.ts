import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { SUPPORT_LOCALES, type AppLocale } from '@/plugins/i18n'

export function useLocaleRouter() {
  const router = useRouter()
  const route = useRoute()
  const { locale } = useI18n()

  // Get current locale from route
  const currentLocale = computed(() => {
    const pathSegments = route.path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    return SUPPORT_LOCALES.includes(firstSegment as AppLocale) ? (firstSegment as AppLocale) : 'en'
  })

  // Navigate to a route with specific locale
  const navigateToLocale = async (
    locale: AppLocale,
    path: string,
    options?: {
      replace?: boolean
      query?: Record<string, any>
      hash?: string
    },
  ) => {
    const fullPath = `/${locale}${path.startsWith('/') ? path : `/${path}`}`

    if (options?.replace) {
      await router.replace({
        path: fullPath,
        query: options.query,
        hash: options.hash,
      })
    } else {
      await router.push({
        path: fullPath,
        query: options?.query,
        hash: options?.hash,
      })
    }
  }

  // Navigate to the same route in a different locale
  const switchLocale = async (newLocale: AppLocale) => {
    const currentPath = route.path
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, '')
    await navigateToLocale(newLocale, pathWithoutLocale, {
      replace: true,
      query: route.query,
      hash: route.hash,
    })
  }

  // Navigate to dashboard in current locale
  const goToDashboard = () => {
    navigateToLocale(currentLocale.value, '/dashboard')
  }

  // Navigate to login in current locale
  const goToLogin = (redirect?: string) => {
    navigateToLocale(currentLocale.value, '/login', {
      query: redirect ? { redirect } : undefined,
    })
  }

  // Navigate to register in current locale
  const goToRegister = () => {
    navigateToLocale(currentLocale.value, '/register')
  }

  // Navigate to forgot password in current locale
  const goToForgot = () => {
    navigateToLocale(currentLocale.value, '/forgot')
  }

  // Navigate to reset password in current locale
  const goToReset = () => {
    navigateToLocale(currentLocale.value, '/reset')
  }

  // Navigate to demo pages in current locale
  const goToDemo = () => {
    navigateToLocale(currentLocale.value, '/demo')
  }

  const goToThemeDemo = () => {
    navigateToLocale(currentLocale.value, '/theme-demo')
  }

  // Get route name for current locale
  const getLocalizedRouteName = (baseName: string) => {
    return `${baseName}-${currentLocale.value}`
  }

  // Check if current route matches a pattern
  const isRoute = (pattern: string | RegExp) => {
    if (typeof pattern === 'string') {
      return route.path.includes(pattern)
    }
    return pattern.test(route.path)
  }

  // Get localized path for external links
  const getLocalizedPath = (path: string) => {
    return `/${currentLocale.value}${path.startsWith('/') ? path : `/${path}`}`
  }

  // Navigate back with locale preservation
  const goBack = () => {
    router.back()
  }

  // Navigate forward with locale preservation
  const goForward = () => {
    router.forward()
  }

  return {
    // Router instance
    router,
    route,

    // Locale information
    currentLocale,

    // Navigation methods
    navigateToLocale,
    switchLocale,
    goToDashboard,
    goToLogin,
    goToRegister,
    goToForgot,
    goToReset,
    goToDemo,
    goToThemeDemo,
    goBack,
    goForward,

    // Utility methods
    getLocalizedRouteName,
    isRoute,
    getLocalizedPath,
  }
}
