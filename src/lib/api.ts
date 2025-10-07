import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/plugins/i18n'

// Determine the correct API base URL
const getApiBaseUrl = () => {
  // If environment variables are set, use them
  if (import.meta.env.VITE_API_V2_BASE) return import.meta.env.VITE_API_V2_BASE
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE

  // Check if we're in development mode - prioritize import.meta.env.DEV
  if (import.meta.env.DEV) return '/api/v2'

  // Check if we're running on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '/api/v2'
  }

  // Check if we're running on production domain
  if (typeof window !== 'undefined' && window.location.hostname === 'naboomneighbornet.net.za') {
    return 'https://naboomneighbornet.net.za/api/v2'
  }

  // Fallback to production v2
  return 'https://naboomneighbornet.net.za/api/v2'
}

// Get the base URL
const baseURL = getApiBaseUrl()

const api = axios.create({
  baseURL,
})

// Debug the API configuration
console.log('API Configuration:', {
  VITE_API_V2_BASE: import.meta.env.VITE_API_V2_BASE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  isDevelopment:
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'),
  isProduction:
    typeof window !== 'undefined' && window.location.hostname === 'naboomneighbornet.net.za',
  finalBaseURL: baseURL,
  apiBaseURL: api.defaults.baseURL,
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const t = authStore.accessToken

  // Debug logging
  console.log('API Request - Auth Token:', t ? 'Present' : 'Missing')
  console.log('API Request - URL:', config.url)
  console.log('API Request - Base URL:', config.baseURL)
  console.log('API Request - Full URL:', (config.baseURL || '') + (config.url || ''))
  console.log(
    'API Request - Is Development:',
    import.meta.env.DEV ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost'),
  )
  console.log(
    'API Request - Window Location:',
    typeof window !== 'undefined' ? window.location.hostname : 'undefined',
  )

  if (t) {
    config.headers.Authorization = `Bearer ${t}`
    console.log('API Request - Authorization header set')
    console.log('API Request - Headers:', config.headers)
  } else {
    console.warn('API Request - No auth token available')
  }

  config.headers['Accept-Language'] = i18n.global.locale.value === 'af' ? 'af-ZA' : 'en'
  return config
})

api.interceptors.response.use(undefined, async (error) => {
  const store = useAuthStore()
  if (error.response?.status === 401 && store.refreshToken) {
    try {
      console.log('🔄 [API] Attempting token refresh...')
      // Use the same base URL as the main API instance
      const refreshUrl = (api.defaults.baseURL || '/api/v2') + '/../auth/jwt/refresh/'
      console.log('🔄 [API] Refresh URL:', refreshUrl)

      const { data } = await axios.post(refreshUrl, {
        refresh: store.refreshToken,
      })

      console.log('✅ [API] Token refresh successful')
      store.setAccessToken(data.access)
      error.config.headers.Authorization = `Bearer ${data.access}`
      return api.request(error.config)
    } catch (refreshError) {
      console.error('❌ [API] Token refresh failed:', refreshError)
      // Clear tokens if refresh fails
      store.clear()
      // Redirect to login page with proper locale
      const currentPath = window.location.pathname
      const localeMatch = currentPath.match(/^\/([a-z]{2})\//)
      const locale = localeMatch ? localeMatch[1] : 'en'
      window.location.href = `/${locale}/login`
    }
  }
  return Promise.reject(error)
})

export default api
