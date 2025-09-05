import { computed } from 'vue'
import { useI18nStore as useI18nStoreBase } from '@/stores/i18n'
import { useCacheStore as useCacheStoreBase } from '@/stores/cache'
import {
  useFarmsStore as useFarmsStoreBase,
  useAlertsStore as useAlertsStoreBase,
  useEquipmentStore as useEquipmentStoreBase,
  useWeatherStore as useWeatherStoreBase,
  useNeighborsStore as useNeighborsStoreBase,
} from '@/stores/data'
import type { AppLocale } from '@/plugins/i18n'

// Main stores composable
export function useStores() {
  const i18nStore = useI18nStoreBase()
  const cacheStore = useCacheStoreBase()
  const farmsStore = useFarmsStoreBase()
  const alertsStore = useAlertsStoreBase()
  const equipmentStore = useEquipmentStoreBase()
  const weatherStore = useWeatherStoreBase()
  const neighborsStore = useNeighborsStoreBase()

  return {
    i18n: i18nStore,
    cache: cacheStore,
    farms: farmsStore,
    alerts: alertsStore,
    equipment: equipmentStore,
    weather: weatherStore,
    neighbors: neighborsStore,
  }
}

// I18n store composable
export function useI18nStore() {
  const store = useI18nStoreBase()

  return {
    // State
    currentLocale: computed(() => store.currentLocale),
    isRTL: computed(() => store.isRTL),
    localeInfo: computed(() => store.localeInfo),
    availableLocaleInfo: computed(() => store.availableLocaleInfo),
    isLocaleChanging: computed(() => store.state.isLocaleChanging),

    // Actions
    changeLocale: store.changeLocale,
    detectAndSetLocale: store.detectAndSetLocale,
    resetToUserPreference: store.resetToUserPreference,
    resetToSystemDefault: store.resetToSystemDefault,

    // Getters
    isLocaleSupported: store.isLocaleSupported,
    getLocaleFromPath: store.getLocaleFromPath,
    getLocalizedPath: store.getLocalizedPath,
  }
}

// Cache store composable
export function useCacheStore() {
  const store = useCacheStoreBase()

  return {
    // State
    cacheSize: computed(() => store.cacheSize),
    isFull: computed(() => store.isFull),
    memoryUsage: computed(() => store.memoryUsage),
    hitRate: computed(() => store.hitRate),
    stats: computed(() => store.getStats()),

    // Actions
    setCache: store.setCache,
    getCache: store.getCache,
    hasCache: store.hasCache,
    deleteCache: store.deleteCache,
    invalidateCache: store.invalidateCache,
    invalidateByLocale: store.invalidateByLocale,
    clearCache: store.clearCache,
    cleanupExpired: store.cleanupExpired,

    // Config
    getConfig: store.getConfig,
    updateConfig: store.updateConfig,
  }
}

// Data store composable
export function useDataStore<T = any>(storeName: string) {
  const stores = useStores()
  const store = stores[storeName as keyof typeof stores] as any

  if (!store) {
    throw new Error(`Store ${storeName} not found`)
  }

  return {
    // State
    data: computed(() => store.state.data),
    loading: computed(() => store.isLoading),
    error: computed(() => store.state.error),
    hasData: computed(() => store.hasData),
    hasError: computed(() => store.hasError),
    isStale: computed(() => store.isStale),

    // Actions
    fetch: store.fetch,
    refresh: store.refresh,
    clear: store.clear,
    invalidate: store.invalidate,
    updateData: store.updateData,
    setError: store.setError,
    updateConfig: store.updateConfig,
  }
}

// Specific store composables
export function useFarmsStore() {
  return useDataStore('farms')
}

export function useAlertsStore() {
  return useDataStore('alerts')
}

export function useEquipmentStore() {
  return useDataStore('equipment')
}

export function useWeatherStore() {
  return useDataStore('weather')
}

export function useNeighborsStore() {
  return useDataStore('neighbors')
}

// Locale-aware data fetching composable
export function useLocaleAwareData<T = any>(
  storeName: string,
  options: {
    autoFetch?: boolean
    cache?: boolean
    cacheTTL?: number
  } = {},
) {
  const { autoFetch = true, cache = true, cacheTTL = 300000 } = options

  const store = useDataStore<T>(storeName)
  const i18nStore = useI18nStore()

  // Auto-fetch when locale changes
  const fetchForCurrentLocale = async () => {
    await store.fetch({
      locale: i18nStore.currentLocale.value,
      cache,
      cacheTTL,
    })
  }

  // Initial fetch
  if (autoFetch) {
    fetchForCurrentLocale()
  }

  return {
    ...store,
    fetchForCurrentLocale,
  }
}

// Cache management composable
export function useCacheManagement() {
  const cacheStore = useCacheStore()
  const i18nStore = useI18nStore()

  const clearCacheForLocale = (locale: AppLocale) => {
    cacheStore.invalidateByLocale(locale)
  }

  const clearAllCache = () => {
    cacheStore.clearCache()
  }

  const getCacheStats = () => {
    return cacheStore.stats.value
  }

  const optimizeCache = () => {
    // Remove expired entries
    cacheStore.cleanupExpired()

    // If still full, remove least used entries
    if (cacheStore.isFull.value) {
      // This would need to be implemented in the cache store
      console.log('Cache is full, consider implementing LRU eviction')
    }
  }

  return {
    clearCacheForLocale,
    clearAllCache,
    getCacheStats,
    optimizeCache,
    cacheSize: cacheStore.cacheSize,
    memoryUsage: cacheStore.memoryUsage,
    hitRate: cacheStore.hitRate,
  }
}

// Export types
export type { AppLocale }
