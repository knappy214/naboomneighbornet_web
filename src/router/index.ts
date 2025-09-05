import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SUPPORT_LOCALES, type AppLocale } from '@/plugins/i18n'

// Route meta interface for TypeScript support
export interface CustomRouteMeta {
  requiresAuth?: boolean
  requiresGuest?: boolean
  locale?: AppLocale
  title?: string
  description?: string
}

// Extend RouteRecordRaw with our custom meta
declare module 'vue-router' {
  interface RouteMeta extends CustomRouteMeta {}
}

// Lazy-loaded components with improved loading
const Home = () => import('@/pages/Home.vue')
const Login = () => import('@/pages/auth/Login.vue')
const Register = () => import('@/pages/auth/Register.vue')
const Forgot = () => import('@/pages/auth/Forgot.vue')
const Reset = () => import('@/pages/auth/Reset.vue')
const VuetifyI18nDemo = () => import('@/components/VuetifyI18nDemo.vue')
const ThemeLocaleSwitcher = () => import('@/components/ThemeLocaleSwitcher.vue')
const LocaleRoutingDemo = () => import('@/pages/LocaleRoutingDemo.vue')
const SafeNaboom = () => import('@/pages/SafeNaboom.vue')
const StoreDemo = () => import('@/components/StoreDemo.vue')

// Generate locale-prefixed routes
const createLocaleRoutes = (): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = []

  SUPPORT_LOCALES.forEach((locale) => {
    routes.push({
      path: `/${locale}`,
      children: [
        {
          path: '',
          redirect: `/${locale}/dashboard`,
        },
        {
          path: 'dashboard',
          name: `dashboard-${locale}`,
          component: Home,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Dashboard',
            description: 'Main dashboard page',
          },
        },
        {
          path: 'login',
          name: `login-${locale}`,
          component: Login,
          meta: {
            requiresGuest: true,
            locale,
            title: 'Login',
            description: 'User login page',
          },
        },
        {
          path: 'register',
          name: `register-${locale}`,
          component: Register,
          meta: {
            requiresGuest: true,
            locale,
            title: 'Register',
            description: 'User registration page',
          },
        },
        {
          path: 'forgot',
          name: `forgot-${locale}`,
          component: Forgot,
          meta: {
            requiresGuest: true,
            locale,
            title: 'Forgot Password',
            description: 'Password reset request page',
          },
        },
        {
          path: 'reset',
          name: `reset-${locale}`,
          component: Reset,
          meta: {
            requiresGuest: true,
            locale,
            title: 'Reset Password',
            description: 'Password reset page',
          },
        },
        {
          path: 'demo',
          name: `demo-${locale}`,
          component: VuetifyI18nDemo,
          meta: {
            locale,
            title: 'Vuetify i18n Demo',
            description: 'Demo page for Vuetify internationalization',
          },
        },
        {
          path: 'theme-demo',
          name: `theme-demo-${locale}`,
          component: ThemeLocaleSwitcher,
          meta: {
            locale,
            title: 'Theme & Locale Demo',
            description: 'Demo page for theme and locale switching',
          },
        },
        {
          path: 'routing-demo',
          name: `routing-demo-${locale}`,
          component: LocaleRoutingDemo,
          meta: {
            locale,
            title: 'Locale Routing Demo',
            description: 'Demo page for locale-based routing',
          },
        },
        {
          path: 'safenaboom',
          name: `safenaboom-${locale}`,
          component: SafeNaboom,
          meta: {
            requiresAuth: true,
            locale,
            title: 'SafeNaboom',
            description: 'Agricultural community security platform',
          },
        },
        {
          path: 'store-demo',
          name: `store-demo-${locale}`,
          component: StoreDemo,
          meta: {
            locale,
            title: 'Store Demo',
            description: 'Pinia store management demonstration',
          },
        },
      ],
    })
  })

  return routes
}

// Create router with locale-prefixed routes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Root redirect to default locale
    {
      path: '/',
      redirect: () => {
        const savedLocale = localStorage.getItem('locale') as AppLocale
        const browserLocale = navigator.language.split('-')[0] as AppLocale
        const defaultLocale = SUPPORT_LOCALES.includes(savedLocale)
          ? savedLocale
          : SUPPORT_LOCALES.includes(browserLocale)
            ? browserLocale
            : 'en'
        return `/${defaultLocale}/dashboard`
      },
    },
    // Locale-prefixed routes
    ...createLocaleRoutes(),
    // Fallback for invalid locales
    {
      path: '/:pathMatch(.*)*',
      redirect: '/en/dashboard',
    },
  ],
  // Enhanced scroll behavior
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash }
    }
    return { top: 0 }
  },
})

// Locale detection and redirection logic
const detectLocale = (path: string): AppLocale | null => {
  const segments = path.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (SUPPORT_LOCALES.includes(firstSegment as AppLocale)) {
    return firstSegment as AppLocale
  }

  return null
}

// Enhanced navigation guards with async locale loading
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.accessToken && authStore.accessToken.length > 0

  // Extract locale from path
  const routeLocale = detectLocale(to.path)

  // If no locale in path, redirect to default locale
  if (!routeLocale) {
    const savedLocale = localStorage.getItem('locale') as AppLocale
    const browserLocale = navigator.language.split('-')[0] as AppLocale
    const defaultLocale = SUPPORT_LOCALES.includes(savedLocale)
      ? savedLocale
      : SUPPORT_LOCALES.includes(browserLocale)
        ? browserLocale
        : 'en'

    // Preserve the original path without locale
    const pathWithoutLocale = to.path.startsWith('/') ? to.path.slice(1) : to.path
    const newPath = `/${defaultLocale}/${pathWithoutLocale}`

    return next(newPath)
  }

  // Set locale in localStorage if it's different
  const currentLocale = localStorage.getItem('locale')
  if (currentLocale !== routeLocale) {
    localStorage.setItem('locale', routeLocale)
  }

  // Check authentication requirements
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      const loginPath = `/${routeLocale}/login`
      next({
        path: loginPath,
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  // Check guest requirements
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      next(`/${routeLocale}/dashboard`)
      return
    }
  }

  // Update document title based on route meta
  if (to.meta.title) {
    document.title = `${to.meta.title} - Naboom NeighborNet`
  }

  next()
})

// After navigation guard for locale synchronization
router.afterEach(async (to) => {
  const routeLocale = detectLocale(to.path)
  if (routeLocale) {
    // Sync with vue-i18n locale
    const { i18n } = await import('@/plugins/i18n')
    if (i18n.global.locale.value !== routeLocale) {
      i18n.global.locale.value = routeLocale
    }
  }
})

export default router
