import { defineStore } from 'pinia'
export const useAuthStore = defineStore('auth', {
  state: () => ({ accessToken: '', refreshToken: '' }),
  actions: {
    setAccessToken(t: string) {
      this.accessToken = t
    },
    setRefreshToken(t: string) {
      this.refreshToken = t
    },
    clear() {
      this.accessToken = ''
      this.refreshToken = ''
    },
  },
})
