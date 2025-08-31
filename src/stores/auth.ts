import axios from 'axios'
import { defineStore } from 'pinia'

interface User {
  [key: string]: any
}

interface Credentials {
  [key: string]: any
}

interface ProfileData {
  [key: string]: any
}

// Initialize axios auth header from local storage token if available
const existingToken = localStorage.getItem('token')
if (existingToken) {
  axios.defaults.headers.common['Authorization'] = `Token ${existingToken}`
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: existingToken as string | null,
    isAuthenticated: !!existingToken,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(credentials: Credentials) {
      try {
        const response = await axios.post('/api/v2/auth/login/', credentials)
        this.token = response.data.token
        this.user = response.data.user
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        axios.defaults.headers.common['Authorization'] = `Token ${this.token}`
        return response.data
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await axios.post('/api/v2/auth/logout/')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    },

    async fetchProfile() {
      try {
        const response = await axios.get('/api/v2/auth/profile/')
        this.user = response.data
        return response.data
      } catch (error) {
        throw error
      }
    },

    async updateProfile(profileData: ProfileData) {
      try {
        const response = await axios.patch('/api/v2/auth/profile/', profileData)
        this.user = response.data
        return response.data
      } catch (error) {
        throw error
      }
    },
  },
})
