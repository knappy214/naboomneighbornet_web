import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useI18nStore } from './i18n'
import { useCacheStore } from './cache'
import { api } from '@/services/api'
import type { AppLocale } from '@/plugins/i18n'
import type { ApiResponse } from '@/services/api'

// TypeScript interfaces
export interface DataState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
  locale: AppLocale
  cacheKey: string
}

export interface DataStoreConfig {
  cacheEnabled: boolean
  cacheTTL: number
  autoRefresh: boolean
  refreshInterval: number
  retryAttempts: number
  retryDelay: number
}

export interface FetchOptions {
  force?: boolean
  cache?: boolean
  cacheTTL?: number
  locale?: AppLocale
  retry?: boolean
}

// Generic data store factory
export function createDataStore<T = any>(
  storeName: string,
  apiEndpoint: string,
  config: Partial<DataStoreConfig> = {},
) {
  return defineStore(storeName, () => {
    // Default configuration
    const defaultConfig: DataStoreConfig = {
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      autoRefresh: false,
      refreshInterval: 60000, // 1 minute
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    }

    // Reactive state
    const state = ref<DataState<T>>({
      data: null,
      loading: false,
      error: null,
      lastFetched: null,
      locale: 'en',
      cacheKey: '',
    })

    const configRef = ref<DataStoreConfig>(defaultConfig)

    // Composables
    const i18nStore = useI18nStore()
    const cacheStore = useCacheStore()

    // Computed properties
    const isLoading = computed(() => state.value.loading)
    const hasError = computed(() => !!state.value.error)
    const hasData = computed(() => state.value.data !== null)
    const isStale = computed(() => {
      if (!state.value.lastFetched) return true
      return Date.now() - state.value.lastFetched.getTime() > configRef.value.cacheTTL
    })

    const cacheKey = computed(() => {
      const locale = state.value.locale
      return `${storeName}:${locale}:${apiEndpoint}`
    })

    // Actions
    const fetch = async (options: FetchOptions = {}): Promise<T | null> => {
      const {
        force = false,
        cache = configRef.value.cacheEnabled,
        cacheTTL = configRef.value.cacheTTL,
        locale = i18nStore.currentLocale,
        retry = true,
      } = options

      // Update locale if changed
      if (locale !== state.value.locale) {
        state.value.locale = locale
        state.value.cacheKey = cacheKey.value
      }

      // Check cache first
      if (cache && !force) {
        const cachedData = cacheStore.getCache<T>(cacheKey.value)
        if (cachedData) {
          state.value.data = cachedData as any
          state.value.error = null
          state.value.lastFetched = new Date()
          return cachedData
        }
      }

      // Set loading state
      state.value.loading = true
      state.value.error = null

      try {
        // Make API request
        const response: ApiResponse<T> = await api.get<T>(apiEndpoint, {
          cache: cache,
          cacheKey: cacheKey.value,
          cacheTTL: cacheTTL,
          locale: locale,
        })

        // Update state
        state.value.data = response.data as any
        state.value.lastFetched = new Date()
        state.value.error = null

        // Cache the data
        if (cache) {
          cacheStore.setCache(cacheKey.value, response.data, cacheTTL, locale)
        }

        return response.data
      } catch (error: any) {
        state.value.error = error.message || 'Failed to fetch data'

        // Retry logic
        if (retry && configRef.value.retryAttempts > 0) {
          await new Promise((resolve) => setTimeout(resolve, configRef.value.retryDelay))
          return fetch({ ...options, retry: false })
        }

        throw error
      } finally {
        state.value.loading = false
      }
    }

    const refresh = async (): Promise<T | null> => {
      return fetch({ force: true })
    }

    const clear = (): void => {
      state.value.data = null
      state.value.error = null
      state.value.lastFetched = null
    }

    const invalidate = (): void => {
      cacheStore.invalidateCache(cacheKey.value)
      clear()
    }

    const updateData = (newData: T): void => {
      state.value.data = newData as any
      state.value.lastFetched = new Date()

      // Update cache
      if (configRef.value.cacheEnabled) {
        cacheStore.setCache(cacheKey.value, newData, configRef.value.cacheTTL, state.value.locale)
      }
    }

    const setError = (error: string): void => {
      state.value.error = error
      state.value.loading = false
    }

    const updateConfig = (newConfig: Partial<DataStoreConfig>): void => {
      configRef.value = { ...configRef.value, ...newConfig }
    }

    // Auto-refresh logic
    let refreshInterval: ReturnType<typeof setInterval> | null = null

    const startAutoRefresh = (): void => {
      if (refreshInterval || !configRef.value.autoRefresh) return

      refreshInterval = setInterval(() => {
        if (isStale.value) {
          fetch()
        }
      }, configRef.value.refreshInterval)
    }

    const stopAutoRefresh = (): void => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }

    // Watchers
    watch(
      () => i18nStore.currentLocale,
      (newLocale) => {
        if (newLocale !== state.value.locale) {
          // Invalidate cache for old locale
          cacheStore.invalidateByLocale(state.value.locale)

          // Fetch data for new locale
          fetch({ locale: newLocale })
        }
      },
    )

    watch(
      () => configRef.value.autoRefresh,
      (enabled) => {
        if (enabled) {
          startAutoRefresh()
        } else {
          stopAutoRefresh()
        }
      },
    )

    // Initialize
    const initialize = async (): Promise<void> => {
      if (configRef.value.autoRefresh) {
        startAutoRefresh()
      }

      // Initial fetch
      await fetch()
    }

    const destroy = (): void => {
      stopAutoRefresh()
    }

    return {
      // State
      state,
      config: configRef,

      // Computed
      isLoading,
      hasError,
      hasData,
      isStale,
      cacheKey,

      // Actions
      fetch,
      refresh,
      clear,
      invalidate,
      updateData,
      setError,
      updateConfig,

      // Lifecycle
      initialize,
      destroy,
    }
  })
}

// Specific data stores - COMMENTED OUT FOR NOW (only auth APIs are available)
// export const useFarmsStore = createDataStore('farms', '/farms', {
//   cacheEnabled: true,
//   cacheTTL: 300000, // 5 minutes
//   autoRefresh: true,
//   refreshInterval: 300000, // 5 minutes
// })

// export const useAlertsStore = createDataStore('alerts', '/alerts', {
//   cacheEnabled: true,
//   cacheTTL: 60000, // 1 minute
//   autoRefresh: true,
//   refreshInterval: 60000, // 1 minute
// })

// export const useEquipmentStore = createDataStore('equipment', '/equipment', {
//   cacheEnabled: true,
//   cacheTTL: 300000, // 5 minutes
//   autoRefresh: false,
// })

// export const useWeatherStore = createDataStore('weather', '/weather', {
//   cacheEnabled: true,
//   cacheTTL: 300000, // 5 minutes
//   autoRefresh: true,
//   refreshInterval: 600000, // 10 minutes
// })

// export const useNeighborsStore = createDataStore('neighbors', '/neighbors', {
//   cacheEnabled: true,
//   cacheTTL: 180000, // 3 minutes
//   autoRefresh: true,
//   refreshInterval: 180000, // 3 minutes
// })

// Temporary mock stores for development
export const useFarmsStore = () => ({
  state: { data: null, loading: false, error: null, lastFetched: null, locale: 'en', cacheKey: '' },
  isLoading: false,
  hasError: false,
  hasData: false,
  isStale: false,
  cacheKey: '',
  fetch: async () => null,
  refresh: async () => null,
  clear: () => {},
  invalidate: () => {},
  updateData: () => {},
  setError: () => {},
  updateConfig: () => {},
  initialize: async () => {},
  destroy: () => {},
})
export const useAlertsStore = () => ({
  state: { data: null, loading: false, error: null, lastFetched: null, locale: 'en', cacheKey: '' },
  isLoading: false,
  hasError: false,
  hasData: false,
  isStale: false,
  cacheKey: '',
  fetch: async () => null,
  refresh: async () => null,
  clear: () => {},
  invalidate: () => {},
  updateData: () => {},
  setError: () => {},
  updateConfig: () => {},
  initialize: async () => {},
  destroy: () => {},
})
export const useEquipmentStore = () => ({
  state: { data: null, loading: false, error: null, lastFetched: null, locale: 'en', cacheKey: '' },
  isLoading: false,
  hasError: false,
  hasData: false,
  isStale: false,
  cacheKey: '',
  fetch: async () => null,
  refresh: async () => null,
  clear: () => {},
  invalidate: () => {},
  updateData: () => {},
  setError: () => {},
  updateConfig: () => {},
  initialize: async () => {},
  destroy: () => {},
})
export const useWeatherStore = () => ({
  state: { data: null, loading: false, error: null, lastFetched: null, locale: 'en', cacheKey: '' },
  isLoading: false,
  hasError: false,
  hasData: false,
  isStale: false,
  cacheKey: '',
  fetch: async () => null,
  refresh: async () => null,
  clear: () => {},
  invalidate: () => {},
  updateData: () => {},
  setError: () => {},
  updateConfig: () => {},
  initialize: async () => {},
  destroy: () => {},
})
export const useNeighborsStore = () => ({
  state: { data: null, loading: false, error: null, lastFetched: null, locale: 'en', cacheKey: '' },
  isLoading: false,
  hasError: false,
  hasData: false,
  isStale: false,
  cacheKey: '',
  fetch: async () => null,
  refresh: async () => null,
  clear: () => {},
  invalidate: () => {},
  updateData: () => {},
  setError: () => {},
  updateConfig: () => {},
  initialize: async () => {},
  destroy: () => {},
})
