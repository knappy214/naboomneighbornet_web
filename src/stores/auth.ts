import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
  }),
  actions: {
    setAccessToken(t: string) {
      this.accessToken = t
      localStorage.setItem('accessToken', t)
    },
    setRefreshToken(t: string) {
      this.refreshToken = t
      localStorage.setItem('refreshToken', t)
    },
    clear() {
      this.accessToken = ''
      this.refreshToken = ''
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
})
