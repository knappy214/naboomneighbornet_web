import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// Extend Axios config to include cache options
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    cache?: boolean
    cacheKey?: string
    cacheTTL?: number
  }
}
import { useI18nStore } from '@/stores/i18n'
import { useCacheStore } from '@/stores/cache'
import type { AppLocale } from '@/plugins/i18n'

// TypeScript interfaces
export interface ApiRequestConfig extends AxiosRequestConfig {
  cache?: boolean
  cacheKey?: string
  cacheTTL?: number
  locale?: AppLocale
  skipCache?: boolean
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  cached: boolean
  cacheKey?: string
  timestamp: Date
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
  timestamp: Date
}

export interface CacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
  keyGenerator: (config: ApiRequestConfig) => string
}

// API Service class
class ApiService {
  private instance: AxiosInstance
  private i18nStore: ReturnType<typeof useI18nStore> | null = null
  private cacheStore: ReturnType<typeof useCacheStore> | null = null

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private getStores() {
    if (!this.i18nStore || !this.cacheStore) {
      this.i18nStore = useI18nStore()
      this.cacheStore = useCacheStore()
    }
    return { i18nStore: this.i18nStore, cacheStore: this.cacheStore }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add locale header
        const { i18nStore } = this.getStores()
        const locale = i18nStore.currentLocale
        config.headers['Accept-Language'] = locale
        config.headers['X-Locale'] = locale

        // Add cache configuration
        if (config.cache !== false) {
          config.cache = true
          config.cacheKey = this.generateCacheKey(config)
          config.cacheTTL = config.cacheTTL || 300000 // 5 minutes default
        }

        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      },
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Handle caching
        if (response.config.cache && response.config.cacheKey) {
          const { cacheStore } = this.getStores()
          cacheStore.setCache(
            response.config.cacheKey,
            response.data,
            response.config.cacheTTL || 300000,
          )
        }

        return response
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      },
    )
  }

  private generateCacheKey(config: ApiRequestConfig): string {
    const { i18nStore } = this.getStores()
    const locale = config.locale || i18nStore.currentLocale
    const method = config.method?.toUpperCase() || 'GET'
    const url = config.url || ''
    const params = config.params ? JSON.stringify(config.params) : ''
    const data = config.data ? JSON.stringify(config.data) : ''

    return `api:${locale}:${method}:${url}:${params}:${data}`.replace(/[^a-zA-Z0-9:]/g, '_')
  }

  private handleError(error: any): ApiError {
    const apiError: ApiError = {
      message: error.message || 'An unknown error occurred',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
      timestamp: new Date(),
    }

    console.error('API Error:', apiError)
    return apiError
  }

  // Public methods
  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestConfig: ApiRequestConfig = {
      method: 'GET',
      url,
      ...config,
    }

    return this.request<T>(requestConfig)
  }

  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestConfig: ApiRequestConfig = {
      method: 'POST',
      url,
      data,
      cache: false, // POST requests are not cached by default
      ...config,
    }

    return this.request<T>(requestConfig)
  }

  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestConfig: ApiRequestConfig = {
      method: 'PUT',
      url,
      data,
      cache: false, // PUT requests are not cached by default
      ...config,
    }

    return this.request<T>(requestConfig)
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestConfig: ApiRequestConfig = {
      method: 'DELETE',
      url,
      cache: false, // DELETE requests are not cached by default
      ...config,
    }

    return this.request<T>(requestConfig)
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    const requestConfig: ApiRequestConfig = {
      method: 'PATCH',
      url,
      data,
      cache: false, // PATCH requests are not cached by default
      ...config,
    }

    return this.request<T>(requestConfig)
  }

  private async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check cache first
      if (config.cache && config.cacheKey && !config.skipCache) {
        const { cacheStore } = this.getStores()
        const cachedData = cacheStore.getCache<T>(config.cacheKey)
        if (cachedData) {
          return {
            data: cachedData,
            status: 200,
            statusText: 'OK',
            headers: {},
            cached: true,
            cacheKey: config.cacheKey,
            timestamp: new Date(),
          }
        }
      }

      // Make API request
      const response: AxiosResponse<T> = await this.instance.request(config)

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        cached: false,
        cacheKey: config.cacheKey,
        timestamp: new Date(),
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Cache management methods
  invalidateCache(pattern?: string): void {
    const { cacheStore } = this.getStores()
    cacheStore.invalidateCache(pattern)
  }

  clearCache(): void {
    const { cacheStore } = this.getStores()
    cacheStore.clearCache()
  }

  getCacheStats(): any {
    const { cacheStore } = this.getStores()
    return cacheStore.getStats()
  }

  // Locale-specific methods
  async getLocalized<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { i18nStore } = this.getStores()
    const locale = i18nStore.currentLocale
    const localizedUrl = this.localizeUrl(url, locale)

    return this.get<T>(localizedUrl, {
      ...config,
      locale,
    })
  }

  private localizeUrl(url: string, locale: AppLocale): string {
    // Add locale prefix to URL if not already present
    if (!url.startsWith(`/${locale}/`) && !url.startsWith('http')) {
      return `/${locale}${url.startsWith('/') ? url : `/${url}`}`
    }
    return url
  }

  // Batch requests
  async batch<T = any>(requests: ApiRequestConfig[]): Promise<ApiResponse<T>[]> {
    const promises = requests.map((config) => this.request<T>(config))
    return Promise.all(promises)
  }

  // Request with retry
  async requestWithRetry<T = any>(
    config: ApiRequestConfig,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<ApiResponse<T>> {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(config)
      } catch (error) {
        lastError = error

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)))
        }
      }
    }

    throw lastError
  }
}

// Create singleton instance
export const apiService = new ApiService()

// Export convenience functions
export const api = {
  get: <T = any>(url: string, config?: ApiRequestConfig) => apiService.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: ApiRequestConfig) =>
    apiService.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: ApiRequestConfig) =>
    apiService.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: ApiRequestConfig) => apiService.delete<T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: ApiRequestConfig) =>
    apiService.patch<T>(url, data, config),
  getLocalized: <T = any>(url: string, config?: ApiRequestConfig) =>
    apiService.getLocalized<T>(url, config),
  invalidateCache: (pattern?: string) => apiService.invalidateCache(pattern),
  clearCache: () => apiService.clearCache(),
  getCacheStats: () => apiService.getCacheStats(),
}
