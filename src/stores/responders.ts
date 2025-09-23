import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchResponders } from '@/services/panic'
import type { Responder } from '@/types/panic.d'

interface FetchOptions {
  silent?: boolean
}

export const useRespondersStore = defineStore('responders', () => {
  const responders = ref<Responder[]>([])
  const isLoading = ref(false)
  const lastError = ref<Error | null>(null)
  const lastFetch = ref<Date | null>(null)
  const selectedProvince = ref<string | null>(null)

  const activeResponders = computed(() => responders.value?.filter((r) => r.isActive) || [])
  const respondersByProvince = computed(() => {
    const grouped: Record<string, Responder[]> = {}
    if (responders.value) {
      responders.value.forEach((responder) => {
        const province = responder.province
        if (!grouped[province]) {
          grouped[province] = []
        }
        grouped[province].push(responder)
      })
    }
    return grouped
  })

  const filteredResponders = computed(() => {
    if (!selectedProvince.value) {
      return responders.value || []
    }
    return responders.value?.filter((r) => r.province === selectedProvince.value) || []
  })

  const provinces = computed(() => {
    if (!responders.value) return []
    const uniqueProvinces = new Set(responders.value.map((r) => r.province))
    return Array.from(uniqueProvinces).sort()
  })

  async function loadResponders(province?: string, options: FetchOptions = {}): Promise<void> {
    if (isLoading.value && !options.silent) {
      return
    }

    isLoading.value = true
    lastError.value = null
    selectedProvince.value = province || null

    try {
      const data = await fetchResponders(province)
      responders.value = data
      lastFetch.value = new Date()
    } catch (error) {
      lastError.value = error as Error
      console.error('[responders] Failed to fetch responders:', error)
    } finally {
      isLoading.value = false
    }
  }

  function setProvinceFilter(province: string | null): void {
    selectedProvince.value = province
  }

  function getResponder(responderId: string): Responder | undefined {
    return responders.value.find((r) => r.id === responderId)
  }

  function getRespondersByProvince(province: string): Responder[] {
    return responders.value.filter((r) => r.province === province)
  }

  function clearError(): void {
    lastError.value = null
  }

  return {
    // State
    responders,
    isLoading,
    lastError,
    lastFetch,
    selectedProvince,

    // Computed
    activeResponders,
    respondersByProvince,
    filteredResponders,
    provinces,

    // Actions
    fetchResponders: loadResponders,
    setProvinceFilter,
    getResponder,
    getRespondersByProvince,
    clearError,
  }
})
