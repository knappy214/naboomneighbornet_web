import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  acknowledgeIncident,
  fetchIncidents as fetchIncidentList,
  fetchWaypoints,
  resolveIncident,
} from '@/services/panic'
import type {
  Incident,
  IncidentFilters,
  IncidentStatus,
  Waypoint,
} from '@/types/panic'

interface FetchOptions {
  silent?: boolean
}

const defaultFilters = (): IncidentFilters => ({
  statuses: [],
  dateRange: {},
  bbox: null,
  search: '',
})

export const useIncidentStore = defineStore('incident-store', () => {
  const incidents = ref<Incident[]>([])
  const filters = reactive<IncidentFilters>(defaultFilters())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const selectedIncidentId = ref<string | null>(null)
  const waypoints = ref<Waypoint[]>([])

  const filteredIncidents = computed(() => {
    const filterStatuses = new Set(filters.statuses)
    const fromTs = filters.dateRange.from ? Date.parse(filters.dateRange.from) : null
    const toTs = filters.dateRange.to ? Date.parse(filters.dateRange.to) : null
    const term = filters.search?.toLowerCase().trim() || ''

    return incidents.value
      .filter((incident) => {
        if (filterStatuses.size > 0 && !filterStatuses.has(incident.status)) {
          return false
        }

        const incidentReportedTs = Date.parse(incident.reportedAt)
        if (Number.isFinite(fromTs) && incidentReportedTs < (fromTs as number)) {
          return false
        }

        if (Number.isFinite(toTs) && incidentReportedTs > (toTs as number)) {
          return false
        }

        if (term.length > 1) {
          const haystack = [
            incident.summary,
            incident.description,
            incident.reporter?.name,
            incident.reporter?.phone,
            incident.responder?.name,
            incident.responder?.phone,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (!haystack.includes(term)) {
            return false
          }
        }

        if (filters.bbox) {
          const [west, south, east, north] = filters.bbox
          if (
            incident.location.longitude < west ||
            incident.location.longitude > east ||
            incident.location.latitude < south ||
            incident.location.latitude > north
          ) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => Date.parse(b.reportedAt) - Date.parse(a.reportedAt))
  })

  const selectedIncident = computed<Incident | null>(() => {
    if (!selectedIncidentId.value) {
      return null
    }
    return incidents.value.find((incident) => incident.id === selectedIncidentId.value) ?? null
  })

  const activeStatuses = computed(() => new Set(filters.statuses))

  async function loadWaypoints(): Promise<void> {
    waypoints.value = await fetchWaypoints()
  }

  async function fetchIncidents(options: FetchOptions = {}): Promise<void> {
    if (!options.silent) {
      loading.value = true
    }
    error.value = null

    try {
      const items = await fetchIncidentList(filters)
      incidents.value = items
      lastUpdated.value = new Date()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function upsertIncident(incident: Incident): void {
    const index = incidents.value.findIndex((item) => item.id === incident.id)
    if (index >= 0) {
      incidents.value.splice(index, 1, incident)
    } else {
      incidents.value.unshift(incident)
    }
    lastUpdated.value = new Date()
  }

  function removeIncident(incidentId: string): void {
    incidents.value = incidents.value.filter((incident) => incident.id !== incidentId)
  }

  async function acknowledge(incidentId: string): Promise<Incident> {
    const updatedIncident = await acknowledgeIncident(incidentId)
    upsertIncident(updatedIncident)
    return updatedIncident
  }

  async function resolve(incidentId: string): Promise<Incident> {
    const updatedIncident = await resolveIncident(incidentId)
    upsertIncident(updatedIncident)
    return updatedIncident
  }

  function setStatuses(statuses: IncidentStatus[]): void {
    filters.statuses = [...new Set(statuses)]
  }

  function toggleStatus(status: IncidentStatus): void {
    if (filters.statuses.includes(status)) {
      filters.statuses = filters.statuses.filter((item) => item !== status)
    } else {
      filters.statuses = [...filters.statuses, status]
    }
  }

  function setDateRange(from: string | null, to: string | null): void {
    filters.dateRange = {
      from: from || undefined,
      to: to || undefined,
    }
  }

  function setSearch(term: string): void {
    filters.search = term
  }

  function setBoundingBox(bbox: [number, number, number, number] | null): void {
    filters.bbox = bbox
  }

  function selectIncident(incidentId: string | null): void {
    selectedIncidentId.value = incidentId
  }

  function resetFilters(): void {
    const defaults = defaultFilters()
    filters.statuses = defaults.statuses
    filters.dateRange = defaults.dateRange
    filters.bbox = defaults.bbox
    filters.search = defaults.search
  }

  return {
    incidents,
    filters,
    loading,
    error,
    lastUpdated,
    waypoints,
    filteredIncidents,
    selectedIncident,
    activeStatuses,
    fetchIncidents,
    loadWaypoints,
    upsertIncident,
    removeIncident,
    acknowledge,
    resolve,
    setStatuses,
    toggleStatus,
    setDateRange,
    setSearch,
    setBoundingBox,
    selectIncident,
    resetFilters,
  }
})
