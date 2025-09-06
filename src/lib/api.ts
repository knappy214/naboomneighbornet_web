import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/plugins/i18n'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_V2_BASE ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_BASE ||
    '/api/v2',
})

// Debug the API configuration
console.log('API Configuration:', {
  VITE_API_V2_BASE: import.meta.env.VITE_API_V2_BASE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  finalBaseURL: api.defaults.baseURL,
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const t = authStore.accessToken

  // Debug logging
  console.log('API Request - Auth Token:', t ? 'Present' : 'Missing')
  console.log('API Request - URL:', config.url)
  console.log('API Request - Full URL:', (config.baseURL || '') + (config.url || ''))

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
      const { data } = await axios.post(
        (import.meta.env.VITE_API_BASE || '/api') + '/auth/jwt/refresh',
        {
          refresh: store.refreshToken,
        },
      )
      store.setAccessToken(data.access)
      error.config.headers.Authorization = `Bearer ${data.access}`
      return api.request(error.config)
    } catch {}
  }
  return Promise.reject(error)
})

export default api
