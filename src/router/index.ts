import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateAndRefreshToken } from '@/services/auth'
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
const Dashboard = () => import('@/pages/Dashboard.vue')
const Login = () => import('@/pages/auth/Login.vue')
const Register = () => import('@/pages/auth/Register.vue')
const Forgot = () => import('@/pages/auth/Forgot.vue')
const Reset = () => import('@/pages/auth/Reset.vue')
const ThemeDemo = () => import('@/pages/ThemeDemo.vue')
const LocaleRoutingDemo = () => import('@/pages/LocaleRoutingDemo.vue')
const SafeNaboom = () => import('@/pages/SafeNaboom.vue')
const Monitor = () => import('@/pages/Monitor.vue')
const PanicDashboard = () => import('@/pages/PanicDashboard.vue')
const StoreDemo = () => import('@/components/StoreDemo.vue')
const Profile = () => import('@/pages/Profile.vue')
const ChannelsHub = () => import('@/pages/hub/Channels.vue')
const ChannelThreads = () => import('@/pages/hub/ChannelThreads.vue')
const ThreadView = () => import('@/pages/hub/ThreadView.vue')
const NotificationSettings = () => import('@/pages/hub/NotificationSettings.vue')
const Events = () => import('@/pages/hub/Events.vue')
const Alerts = () => import('@/pages/hub/Alerts.vue')
const Reports = () => import('@/pages/hub/Reports.vue')
const JoinRequests = () => import('@/pages/hub/JoinRequests.vue')
const Invites = () => import('@/pages/hub/Invites.vue')
const Search = () => import('@/pages/hub/Search.vue')

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
          component: Dashboard,
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
          path: 'theme-demo',
          name: `theme-demo-${locale}`,
          component: ThemeDemo,
          meta: {
            locale,
            title: 'Theme Demo',
            description: 'Comprehensive DaisyUI theme demonstration',
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
          path: 'channels',
          name: `channels-${locale}`,
          component: ChannelsHub,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Channels',
            description: 'Browse Community Hub channels',
          },
        },
        {
          path: 'channels/:id',
          name: `channel-threads-${locale}`,
          component: ChannelThreads,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Channel Threads',
            description: 'Explore discussions within a channel',
          },
        },
        {
          path: 'threads/:id',
          name: `thread-view-${locale}`,
          component: ThreadView,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Thread View',
            description: 'Read and reply to community discussions',
          },
        },
        {
          path: 'settings/notifications',
          name: `notification-settings-${locale}`,
          component: NotificationSettings,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Notification Settings',
            description: 'Configure hub notifications and push alerts',
          },
        },
        {
          path: 'events',
          name: `events-${locale}`,
          component: Events,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Events',
            description: 'Community events and RSVP management',
          },
        },
        {
          path: 'alerts',
          name: `alerts-${locale}`,
          component: Alerts,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Alerts',
            description: 'Community alerts and urgent notifications',
          },
        },
        {
          path: 'reports',
          name: `reports-${locale}`,
          component: Reports,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Reports',
            description: 'Content moderation and reports management',
          },
        },
        {
          path: 'join-requests',
          name: `join-requests-${locale}`,
          component: JoinRequests,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Join Requests',
            description: 'Manage channel join requests',
          },
        },
        {
          path: 'invites',
          name: `invites-${locale}`,
          component: Invites,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Invites',
            description: 'Send and manage channel invitations',
          },
        },
        {
          path: 'search',
          name: `search-${locale}`,
          component: Search,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Search',
            description: 'Search community content with advanced filters',
          },
        },
        {
          path: 'monitor',
          name: `monitor-${locale}`,
          component: Monitor,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Panic Monitor',
            description: 'Live panic and patrol incident monitor',
          },
        },
        {
          path: 'panic-dashboard',
          name: `panic-dashboard-${locale}`,
          component: PanicDashboard,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Panic Dashboard',
            description: 'Comprehensive panic management dashboard',
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
        {
          path: 'profile',
          name: `profile-${locale}`,
          component: Profile,
          meta: {
            requiresAuth: true,
            locale,
            title: 'Profile',
            description: 'User profile management',
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

// Enhanced navigation guards with async locale loading and token validation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

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
    // Validate and refresh token if user appears to be authenticated
    const isAuthenticated = await validateAndRefreshToken()

    if (!isAuthenticated) {
      console.log('🚫 [ROUTER] User not authenticated, redirecting to login')
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
    // For guest routes, just check if tokens exist (don't validate them)
    const hasTokens = authStore.accessToken && authStore.accessToken.length > 0
    if (hasTokens) {
      console.log('🚫 [ROUTER] Authenticated user accessing guest route, redirecting to dashboard')
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
