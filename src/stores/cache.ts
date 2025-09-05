import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useI18nStore } from './i18n'
import type { AppLocale } from '@/plugins/i18n'

// TypeScript interfaces
export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  locale: AppLocale
  key: string
  hits: number
  lastAccessed: number
}

export interface CacheStats {
  totalEntries: number
  totalHits: number
  totalMisses: number
  hitRate: number
  memoryUsage: number
  entriesByLocale: Record<AppLocale, number>
  oldestEntry: number
  newestEntry: number
}

export interface CacheConfig {
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
  enableCompression: boolean
  enablePersistence: boolean
}

// Store definition
export const useCacheStore = defineStore('cache', () => {
  // Reactive state
  const cache = ref<Map<string, CacheEntry>>(new Map())
  const stats = ref<CacheStats>({
    totalEntries: 0,
    totalHits: 0,
    totalMisses: 0,
    hitRate: 0,
    memoryUsage: 0,
    entriesByLocale: { en: 0, af: 0 },
    oldestEntry: 0,
    newestEntry: 0,
  })

  const config = ref<CacheConfig>({
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    cleanupInterval: 60000, // 1 minute
    enableCompression: false,
    enablePersistence: true,
  })

  // Composables
  const i18nStore = useI18nStore()

  // Computed properties
  const currentLocale = computed(() => i18nStore.currentLocale)

  const cacheSize = computed(() => cache.value.size)

  const isFull = computed(() => cacheSize.value >= config.value.maxSize)

  const memoryUsage = computed(() => {
    let totalSize = 0
    for (const entry of cache.value.values()) {
      totalSize += JSON.stringify(entry.data).length
    }
    return totalSize
  })

  const hitRate = computed(() => {
    const total = stats.value.totalHits + stats.value.totalMisses
    return total > 0 ? (stats.value.totalHits / total) * 100 : 0
  })

  // Actions
  const setCache = <T = any>(
    key: string,
    data: T,
    ttl: number = config.value.defaultTTL,
    locale?: AppLocale,
  ): void => {
    const entryLocale = locale || currentLocale.value
    const timestamp = Date.now()

    // Check if cache is full
    if (isFull.value) {
      evictOldestEntry()
    }

    // Create cache entry
    const entry: CacheEntry<T> = {
      data,
      timestamp,
      ttl,
      locale: entryLocale,
      key,
      hits: 0,
      lastAccessed: timestamp,
    }

    // Store in cache
    cache.value.set(key, entry)

    // Update stats
    updateStats()
  }

  const getCache = <T = any>(key: string): T | null => {
    const entry = cache.value.get(key)

    if (!entry) {
      stats.value.totalMisses++
      updateStats()
      return null
    }

    // Check if entry is expired
    if (isExpired(entry)) {
      cache.value.delete(key)
      stats.value.totalMisses++
      updateStats()
      return null
    }

    // Update entry stats
    entry.hits++
    entry.lastAccessed = Date.now()
    stats.value.totalHits++
    updateStats()

    return entry.data as T
  }

  const hasCache = (key: string): boolean => {
    const entry = cache.value.get(key)
    return entry ? !isExpired(entry) : false
  }

  const deleteCache = (key: string): boolean => {
    const deleted = cache.value.delete(key)
    if (deleted) {
      updateStats()
    }
    return deleted
  }

  const invalidateCache = (pattern?: string): void => {
    if (!pattern) {
      clearCache()
      return
    }

    const regex = new RegExp(pattern)
    const keysToDelete: string[] = []

    for (const [key, entry] of cache.value.entries()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => cache.value.delete(key))
    updateStats()
  }

  const invalidateByLocale = (locale: AppLocale): void => {
    const keysToDelete: string[] = []

    for (const [key, entry] of cache.value.entries()) {
      if (entry.locale === locale) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => cache.value.delete(key))
    updateStats()
  }

  const clearCache = (): void => {
    cache.value.clear()
    resetStats()
  }

  const getAllCache = (): Map<string, CacheEntry> => {
    return new Map(cache.value)
  }

  const getCacheByLocale = (locale: AppLocale): Map<string, CacheEntry> => {
    const filtered = new Map<string, CacheEntry>()

    for (const [key, entry] of cache.value.entries()) {
      if (entry.locale === locale) {
        filtered.set(key, entry)
      }
    }

    return filtered
  }

  const cleanupExpired = (): void => {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of cache.value.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => cache.value.delete(key))
    updateStats()
  }

  const evictOldestEntry = (): void => {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of cache.value.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      cache.value.delete(oldestKey)
    }
  }

  const evictLeastUsed = (): void => {
    let leastUsedKey = ''
    let leastHits = Infinity

    for (const [key, entry] of cache.value.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      cache.value.delete(leastUsedKey)
    }
  }

  // Helper functions
  const isExpired = (entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp > entry.ttl
  }

  const updateStats = (): void => {
    const entries = Array.from(cache.value.values())

    stats.value.totalEntries = entries.length
    stats.value.memoryUsage = memoryUsage.value
    stats.value.hitRate = hitRate.value

    // Count entries by locale
    stats.value.entriesByLocale = { en: 0, af: 0 }
    entries.forEach((entry) => {
      stats.value.entriesByLocale[entry.locale]++
    })

    // Find oldest and newest entries
    if (entries.length > 0) {
      const timestamps = entries.map((entry) => entry.timestamp)
      stats.value.oldestEntry = Math.min(...timestamps)
      stats.value.newestEntry = Math.max(...timestamps)
    } else {
      stats.value.oldestEntry = 0
      stats.value.newestEntry = 0
    }
  }

  const resetStats = (): void => {
    stats.value = {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      memoryUsage: 0,
      entriesByLocale: { en: 0, af: 0 },
      oldestEntry: 0,
      newestEntry: 0,
    }
  }

  const getStats = (): CacheStats => {
    return { ...stats.value }
  }

  const getConfig = (): CacheConfig => {
    return { ...config.value }
  }

  const updateConfig = (newConfig: Partial<CacheConfig>): void => {
    config.value = { ...config.value, ...newConfig }
  }

  // Persistence
  const saveToStorage = (): void => {
    if (!config.value.enablePersistence) return

    try {
      const cacheData = Array.from(cache.value.entries())
      localStorage.setItem('api-cache', JSON.stringify(cacheData))
    } catch (error) {
      console.error('Failed to save cache to storage:', error)
    }
  }

  const loadFromStorage = (): void => {
    if (!config.value.enablePersistence) return

    try {
      const stored = localStorage.getItem('api-cache')
      if (stored) {
        const cacheData = JSON.parse(stored) as [string, CacheEntry][]

        // Filter out expired entries
        const now = Date.now()
        const validEntries = cacheData.filter(([_, entry]) => now - entry.timestamp <= entry.ttl)

        cache.value = new Map(validEntries)
        updateStats()
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error)
    }
  }

  // Watchers
  watch(
    () => i18nStore.currentLocale,
    (newLocale, oldLocale) => {
      if (oldLocale && newLocale !== oldLocale) {
        // Optionally invalidate cache for old locale
        // This can be configured based on requirements
        console.log(`Locale changed from ${oldLocale} to ${newLocale}`)
      }
    },
  )

  // Auto-cleanup interval
  let cleanupInterval: ReturnType<typeof setInterval> | null = null

  const startCleanup = (): void => {
    if (cleanupInterval) return

    cleanupInterval = setInterval(() => {
      cleanupExpired()
    }, config.value.cleanupInterval)
  }

  const stopCleanup = (): void => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
  }

  // Initialize
  const initialize = (): void => {
    loadFromStorage()
    startCleanup()
  }

  const destroy = (): void => {
    stopCleanup()
    saveToStorage()
  }

  return {
    // State
    cache,
    stats,
    config,

    // Computed
    cacheSize,
    isFull,
    memoryUsage,
    hitRate,

    // Actions
    setCache,
    getCache,
    hasCache,
    deleteCache,
    invalidateCache,
    invalidateByLocale,
    clearCache,
    getAllCache,
    getCacheByLocale,
    cleanupExpired,
    evictOldestEntry,
    evictLeastUsed,

    // Stats and config
    getStats,
    getConfig,
    updateConfig,

    // Persistence
    saveToStorage,
    loadFromStorage,

    // Lifecycle
    initialize,
    destroy,
  }
})
