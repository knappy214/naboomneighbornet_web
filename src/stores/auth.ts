import { defineStore } from 'pinia'
import { login as authLogin, type LoginCredentials } from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    isAuthenticated: !!localStorage.getItem('accessToken'),
  }),
  getters: {
    hasValidToken: (state) => !!state.accessToken,
  },
  actions: {
    setAccessToken(t: string) {
      this.accessToken = t
      this.isAuthenticated = true
      localStorage.setItem('accessToken', t)
    },
    setRefreshToken(t: string) {
      this.refreshToken = t
      localStorage.setItem('refreshToken', t)
    },
    clear() {
      this.accessToken = ''
      this.refreshToken = ''
      this.isAuthenticated = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    async login(credentials: LoginCredentials) {
      try {
        const response = await authLogin(credentials)
        this.setAccessToken(response.access)
        this.setRefreshToken(response.refresh)
        return response
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
  },
  persist: [
    {
      key: 'auth',
      paths: ['accessToken', 'refreshToken', 'isAuthenticated'],
    },
  ],
})
