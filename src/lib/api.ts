import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/plugins/i18n'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' })

api.interceptors.request.use((config) => {
  const t = useAuthStore().accessToken
  if (t) config.headers.Authorization = `Bearer ${t}`
  config.headers['Accept-Language'] = i18n.global.locale.value === 'af' ? 'af-ZA' : 'en'
  return config
})

api.interceptors.response.use(undefined, async (error) => {
  const store = useAuthStore()
  if (error.response?.status === 401 && store.refreshToken) {
    try {
      const { data } = await axios.post((import.meta.env.VITE_API_BASE || '/api') + '/auth/jwt/refresh', {
        refresh: store.refreshToken,
      })
      store.setAccessToken(data.access)
      error.config.headers.Authorization = `Bearer ${data.access}`
      return api.request(error.config)
    } catch {}
  }
  return Promise.reject(error)
})

export default api
