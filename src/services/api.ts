/**
 * API Service
 * Centralized HTTP client configuration
 * Part of User Story 1: Real-Time Discussion Channels
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp
    config.metadata = { startTime: Date.now() }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Add response time
    if (response.config.metadata) {
      const responseTime = Date.now() - response.config.metadata.startTime
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${responseTime}ms)`)
    }

    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden')
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data)
    }

    return Promise.reject(error)
  }
)

export { api }
export default api
