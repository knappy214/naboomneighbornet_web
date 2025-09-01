import { defineStore } from 'pinia'
export const useAuthStore = defineStore('auth', {
  state: () => ({ accessToken: '', refreshToken: '' }),
  actions: {
<<<<<<< HEAD
    setAccessToken(t: string) {
      this.accessToken = t
=======
    async login(credentials: Credentials) {
      try {
        const response = await axios.post('/api/v2/auth/login/', credentials)
        this.token = response.data.token
        this.user = response.data.user
        this.isAuthenticated = true

        if (this.token) {
          localStorage.setItem('token', this.token)
          axios.defaults.headers.common['Authorization'] = `Token ${this.token}`
        }

        return response.data
      } catch (error) {
        throw error
      }
>>>>>>> 538ed48 (Try to Merge changes)
    },
    setRefreshToken(t: string) {
      this.refreshToken = t
    },
  },
})
