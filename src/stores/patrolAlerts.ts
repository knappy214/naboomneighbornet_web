import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchPatrolAlerts } from '@/services/panic'
import type { PatrolAlert } from '@/types/panic.d'

interface FetchOptions {
  silent?: boolean
}

export const usePatrolAlertsStore = defineStore('patrolAlerts', () => {
  const alerts = ref<PatrolAlert[]>([])
  const isLoading = ref(false)
  const lastError = ref<Error | null>(null)
  const lastFetch = ref<Date | null>(null)
  const selectedShift = ref<string | null>(null)

  const openAlerts = computed(() => alerts.value?.filter((a) => a.status === 'open') || [])
  const acknowledgedAlerts = computed(
    () => alerts.value?.filter((a) => a.status === 'acknowledged') || [],
  )
  const resolvedAlerts = computed(() => alerts.value?.filter((a) => a.status === 'resolved') || [])

  const alertsByStatus = computed(() => ({
    open: openAlerts.value,
    acknowledged: acknowledgedAlerts.value,
    resolved: resolvedAlerts.value,
  }))

  const filteredAlerts = computed(() => {
    if (!selectedShift.value) {
      return alerts.value || []
    }
    return alerts.value?.filter((a) => a.shift === selectedShift.value) || []
  })

  const shifts = computed(() => {
    if (!alerts.value) return []
    const uniqueShifts = new Set(alerts.value.map((a) => a.shift).filter(Boolean))
    return Array.from(uniqueShifts).sort()
  })

  async function fetchAlerts(
    shift?: string,
    limit = 50,
    options: FetchOptions = {},
  ): Promise<void> {
    if (isLoading.value && !options.silent) {
      return
    }

    isLoading.value = true
    lastError.value = null
    selectedShift.value = shift || null

    try {
      const data = await fetchPatrolAlerts(shift, limit)
      alerts.value = data
      lastFetch.value = new Date()
    } catch (error) {
      lastError.value = error as Error
      console.error('[patrolAlerts] Failed to fetch alerts:', error)
    } finally {
      isLoading.value = false
    }
  }

  function setShiftFilter(shift: string | null): void {
    selectedShift.value = shift
  }

  function getAlert(alertId: string): PatrolAlert | undefined {
    return alerts.value.find((a) => a.id === alertId)
  }

  function getAlertsByWaypoint(waypointId: string): PatrolAlert[] {
    return alerts.value.filter((a) => a.waypointId === waypointId)
  }

  function clearError(): void {
    lastError.value = null
  }

  return {
    // State
    alerts,
    isLoading,
    lastError,
    lastFetch,
    selectedShift,

    // Computed
    openAlerts,
    acknowledgedAlerts,
    resolvedAlerts,
    alertsByStatus,
    filteredAlerts,
    shifts,

    // Actions
    fetchAlerts,
    setShiftFilter,
    getAlert,
    getAlertsByWaypoint,
    clearError,
  }
})
