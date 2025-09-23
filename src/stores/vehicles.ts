import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchLiveVehicles, fetchVehicleTracks, pingVehicle } from '@/services/panic'
import type { Vehicle, VehicleTrack } from '@/types/panic.d'

interface FetchOptions {
  silent?: boolean
}

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref<Vehicle[]>([])
  const tracks = ref<VehicleTrack[]>([])
  const isLoading = ref(false)
  const lastError = ref<Error | null>(null)
  const lastFetch = ref<Date | null>(null)

  const activeVehicles = computed(() => vehicles.value?.filter((v) => v.isActive) || [])
  const vehiclesWithPositions = computed(() => vehicles.value?.filter((v) => v.lastPosition) || [])

  async function fetchVehicles(options: FetchOptions = {}): Promise<void> {
    if (isLoading.value && !options.silent) {
      return
    }

    isLoading.value = true
    lastError.value = null

    try {
      const data = await fetchLiveVehicles()
      vehicles.value = data
      lastFetch.value = new Date()
    } catch (error) {
      lastError.value = error as Error
      console.error('[vehicles] Failed to fetch vehicles:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTracks(
    minutes = 60,
    vehicleId?: string,
    options: FetchOptions = {},
  ): Promise<void> {
    if (isLoading.value && !options.silent) {
      return
    }

    isLoading.value = true
    lastError.value = null

    try {
      const data = await fetchVehicleTracks(minutes, vehicleId)
      if (vehicleId) {
        // Replace tracks for specific vehicle
        tracks.value = tracks.value.filter((t) => t.vehicleId !== vehicleId).concat(data)
      } else {
        // Replace all tracks
        tracks.value = data
      }
    } catch (error) {
      lastError.value = error as Error
      console.error('[vehicles] Failed to fetch tracks:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function pingVehiclePosition(
    token: string,
    lat: number,
    lng: number,
    speedKph?: number,
    headingDeg?: number,
    timestamp?: string,
  ): Promise<void> {
    try {
      await pingVehicle(token, lat, lng, speedKph, headingDeg, timestamp)
      // Refresh vehicles after successful ping
      await fetchVehicles({ silent: true })
    } catch (error) {
      lastError.value = error as Error
      console.error('[vehicles] Failed to ping vehicle:', error)
      throw error
    }
  }

  function getVehicleTracks(vehicleId: string): VehicleTrack | undefined {
    return tracks.value.find((t) => t.vehicleId === vehicleId)
  }

  function getVehicle(vehicleId: string): Vehicle | undefined {
    return vehicles.value.find((v) => v.id === vehicleId)
  }

  function clearError(): void {
    lastError.value = null
  }

  return {
    // State
    vehicles,
    tracks,
    isLoading,
    lastError,
    lastFetch,

    // Computed
    activeVehicles,
    vehiclesWithPositions,

    // Actions
    fetchVehicles,
    fetchTracks,
    pingVehiclePosition,
    getVehicleTracks,
    getVehicle,
    clearError,
  }
})
