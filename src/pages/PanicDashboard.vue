<template>
  <div class="panic-dashboard">
    <!-- Development Status Banner (only shows if mock data is detected) -->
    <div v-if="isDevelopment && hasMockData" class="alert alert-warning mb-4" role="alert">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <div>
        <h3 class="font-bold">Development Mode - Fallback Data</h3>
        <div class="text-xs">
          Some API endpoints returned errors - using fallback data. Check console for details.
        </div>
      </div>
    </div>

    <!-- Success Banner for Development (when all endpoints work) -->
    <div v-if="isDevelopment && !hasMockData" class="alert alert-success mb-4" role="alert">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div>
        <h3 class="font-bold">Development Mode - All Systems Operational</h3>
        <div class="text-xs">All PANIC API endpoints are working correctly! 🎉</div>
      </div>
    </div>

    <div class="dashboard-header">
      <h1 class="text-3xl font-bold">{{ $t('panic.dashboard.title') }}</h1>
      <p class="text-base-content/70">{{ $t('panic.dashboard.subtitle') }}</p>
    </div>

    <div class="dashboard-grid">
      <!-- Real-time monitoring -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">
            <span class="badge badge-primary">{{ $t('panic.monitoring.title') }}</span>
          </h2>

          <div class="stats stats-horizontal shadow">
            <div class="stat">
              <div class="stat-title">{{ $t('incidents.open') }}</div>
              <div class="stat-value text-warning">
                {{ incidentsStore.filteredIncidents.filter((i) => i.status === 'open').length }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('incidents.acknowledged') }}</div>
              <div class="stat-value text-info">
                {{
                  incidentsStore.filteredIncidents.filter((i) => i.status === 'acknowledged').length
                }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('incidents.resolved') }}</div>
              <div class="stat-value text-success">
                {{ incidentsStore.filteredIncidents.filter((i) => i.status === 'resolved').length }}
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              @click="refreshIncidents"
              class="btn btn-primary btn-sm"
              :disabled="incidentsStore.loading"
            >
              <span v-if="incidentsStore.loading" class="loading loading-spinner loading-xs" />
              {{ $t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Vehicle tracking -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">
            <span class="badge badge-secondary">{{ $t('vehicles.title') }}</span>
          </h2>

          <div class="stats stats-horizontal shadow">
            <div class="stat">
              <div class="stat-title">{{ $t('vehicles.total') }}</div>
              <div class="stat-value text-primary">{{ vehiclesStore.vehicles?.length || 0 }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('vehicles.active') }}</div>
              <div class="stat-value text-success">
                {{ vehiclesStore.activeVehicles?.length || 0 }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('vehicles.withPosition') }}</div>
              <div class="stat-value text-info">
                {{ vehiclesStore.vehiclesWithPositions?.length || 0 }}
              </div>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              @click="refreshVehicles"
              class="btn btn-secondary btn-sm"
              :disabled="vehiclesStore.isLoading"
            >
              <span v-if="vehiclesStore.isLoading" class="loading loading-spinner loading-xs" />
              {{ $t('common.refresh') }}
            </button>
            <button @click="toggleVehicleMap" class="btn btn-outline btn-sm">
              {{ showVehicleMap ? $t('vehicles.hideMap') : $t('vehicles.showMap') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Responders -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">
            <span class="badge badge-accent">{{ $t('responders.title') }}</span>
          </h2>

          <div class="stats stats-horizontal shadow">
            <div class="stat">
              <div class="stat-title">{{ $t('responders.total') }}</div>
              <div class="stat-value text-primary">
                {{ respondersStore.responders?.length || 0 }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('responders.active') }}</div>
              <div class="stat-value text-success">
                {{ respondersStore.activeResponders?.length || 0 }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('responders.provinces') }}</div>
              <div class="stat-value text-info">{{ respondersStore.provinces?.length || 0 }}</div>
            </div>
          </div>

          <div class="mt-4">
            <select
              v-model="selectedProvince"
              @change="filterResponders"
              class="select select-bordered select-sm w-full"
            >
              <option value="">{{ $t('responders.allProvinces') }}</option>
              <option
                v-for="province in respondersStore.provinces"
                :key="province"
                :value="province"
              >
                {{ province }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Patrol alerts -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">
            <span class="badge badge-warning">{{ $t('patrolAlerts.title') }}</span>
          </h2>

          <div class="stats stats-horizontal shadow">
            <div class="stat">
              <div class="stat-title">{{ $t('patrolAlerts.open') }}</div>
              <div class="stat-value text-warning">
                {{ patrolAlertsStore.openAlerts?.length || 0 }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('patrolAlerts.acknowledged') }}</div>
              <div class="stat-value text-info">
                {{ patrolAlertsStore.acknowledgedAlerts?.length || 0 }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('patrolAlerts.resolved') }}</div>
              <div class="stat-value text-success">
                {{ patrolAlertsStore.resolvedAlerts?.length || 0 }}
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              @click="refreshPatrolAlerts"
              class="btn btn-warning btn-sm"
              :disabled="patrolAlertsStore.isLoading"
            >
              <span v-if="patrolAlertsStore.isLoading" class="loading loading-spinner loading-xs" />
              {{ $t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Incident map with vehicle tracking -->
    <div v-if="showIncidentMap" class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h2 class="card-title">
          <span class="badge badge-primary">{{ $t('monitor.map.title') }}</span>
        </h2>

        <div class="h-96 rounded-lg overflow-hidden">
          <IncidentMap
            :incidents="incidentsStore.incidents"
            :waypoints="incidentsStore.waypoints"
            :selected-incident-id="selectedIncidentId || undefined"
            @select="onIncidentSelect"
            @ready="onMapReady"
          />
        </div>
      </div>
    </div>

    <!-- Vehicle tracking map -->
    <div v-if="showVehicleMap" class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h2 class="card-title">
          <span class="badge badge-secondary">{{ $t('vehicles.map.title') }}</span>
        </h2>

        <div class="h-96 rounded-lg overflow-hidden">
          <VehicleTrackingMap
            :show-vehicles="true"
            :show-tracks="showVehicleTracks"
            @vehicle-select="onVehicleSelect"
            @ready="onVehicleMapReady"
          />
        </div>
      </div>
    </div>

    <!-- Incident submission form -->
    <div class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h2 class="card-title">
          <span class="badge badge-info">{{ $t('panic.submit.title') }}</span>
        </h2>

        <form @submit.prevent="submitIncident" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('panic.submit.description') }}</span>
              </label>
              <textarea
                v-model="incidentForm.description"
                class="textarea textarea-bordered"
                :placeholder="$t('panic.submit.descriptionPlaceholder')"
                rows="3"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('panic.submit.priority') }}</span>
              </label>
              <select v-model="incidentForm.priority" class="select select-bordered">
                <option value="low">{{ $t('incidents.priority.low') }}</option>
                <option value="medium">{{ $t('incidents.priority.medium') }}</option>
                <option value="high">{{ $t('incidents.priority.high') }}</option>
                <option value="critical">{{ $t('incidents.priority.critical') }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('panic.submit.location') }}</span>
              </label>
              <input
                v-model="incidentForm.address"
                type="text"
                class="input input-bordered"
                :placeholder="$t('panic.submit.locationPlaceholder')"
              />
            </div>

            <!-- Location Services Section -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">📍 Current Location</span>
              </label>
              <div class="flex gap-2 items-center">
                <button
                  type="button"
                  @click="getLocation"
                  :disabled="isGettingLocation || !geolocationSupported"
                  class="btn btn-outline btn-sm"
                >
                  <span v-if="isGettingLocation" class="loading loading-spinner loading-xs" />
                  <span v-else>📍</span>
                  {{ isGettingLocation ? 'Getting Location...' : 'Get My Location' }}
                </button>

                <button
                  v-if="currentLocation"
                  type="button"
                  @click="clearLocation"
                  class="btn btn-ghost btn-sm"
                >
                  ✕
                </button>
              </div>

              <!-- Location Display -->
              <div v-if="currentLocation" class="mt-2 p-2 bg-success/10 rounded-lg">
                <div class="text-sm text-success font-medium">✅ Location obtained</div>
                <div class="text-xs text-success/70">
                  {{ formatCoordinates(currentLocation.latitude, currentLocation.longitude) }}
                </div>
                <div class="text-xs text-success/70">
                  Accuracy: ±{{ Math.round(currentLocation.accuracy) }}m
                </div>
              </div>

              <!-- Location Error -->
              <div v-if="locationError" class="mt-2 p-2 bg-error/10 rounded-lg">
                <div class="text-sm text-error font-medium">❌ Location Error</div>
                <div class="text-xs text-error/70">
                  {{ locationError }}
                </div>
              </div>

              <!-- Geolocation Not Supported -->
              <div v-if="!geolocationSupported" class="mt-2 p-2 bg-warning/10 rounded-lg">
                <div class="text-sm text-warning font-medium">
                  ⚠️ Location services not available
                </div>
                <div class="text-xs text-warning/70">
                  Please enter your location manually in the address field above.
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('panic.submit.province') }}</span>
              </label>
              <select v-model="incidentForm.province" class="select select-bordered">
                <option value="">{{ $t('common.select') }}</option>
                <option
                  v-for="province in southAfricanProvinces"
                  :key="province.key"
                  :value="province.value"
                >
                  {{ $t(`provinces.${province.key}`) }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-control">
            <button type="submit" class="btn btn-primary" :disabled="panicStore.isSubmitting">
              <span v-if="panicStore.isSubmitting" class="loading loading-spinner loading-xs" />
              {{ $t('panic.submit.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useIncidentStore } from '@/stores/incidents'
import { useVehiclesStore } from '@/stores/vehicles'
import { useRespondersStore } from '@/stores/responders'
import { usePatrolAlertsStore } from '@/stores/patrolAlerts'
import { usePanicStore } from '@/stores/panic'
import IncidentMap from '@/components/IncidentMap.vue'
import VehicleTrackingMap from '@/components/VehicleTrackingMap.vue'
import {
  getCurrentLocation,
  checkGeolocationAvailability,
  formatCoordinates,
  type LocationData,
  type GeolocationError,
} from '@/services/geolocation'
import type { IncidentPriority, Vehicle, Responder, PatrolAlert } from '@/types/panic.d'
import type { MapInstance } from '@/lib/maplibre'

const incidentsStore = useIncidentStore()
const vehiclesStore = useVehiclesStore()
const respondersStore = useRespondersStore()
const patrolAlertsStore = usePatrolAlertsStore()
const panicStore = usePanicStore()

// Standard list of South African provinces for incident reporting
const southAfricanProvinces = [
  { key: 'easternCape', value: 'Eastern Cape' },
  { key: 'freeState', value: 'Free State' },
  { key: 'gauteng', value: 'Gauteng' },
  { key: 'kwazuluNatal', value: 'KwaZulu-Natal' },
  { key: 'limpopo', value: 'Limpopo' },
  { key: 'mpumalanga', value: 'Mpumalanga' },
  { key: 'northernCape', value: 'Northern Cape' },
  { key: 'northWest', value: 'North West' },
  { key: 'westernCape', value: 'Western Cape' },
]

const selectedIncidentId = ref<string | null>(null)
const selectedProvince = ref<string>('')
const showIncidentMap = ref(true)
const showVehicleMap = ref(false)
const showVehicleTracks = ref(false)

const incidentForm = ref({
  description: '',
  priority: 'medium' as IncidentPriority,
  address: '',
  province: '',
})

// Location-related state
const currentLocation = ref<LocationData | null>(null)
const isGettingLocation = ref(false)
const locationError = ref<string | null>(null)
const geolocationSupported = ref(false)

const onIncidentSelect = (incidentId: string | null) => {
  selectedIncidentId.value = incidentId
}

const onMapReady = (map: MapInstance) => {
  console.log('Incident map ready', map)
}

const onVehicleSelect = (vehicle: Vehicle | null) => {
  console.log('Vehicle selected', vehicle)
}

const onVehicleMapReady = (map: MapInstance) => {
  console.log('Vehicle map ready', map)
}

const refreshIncidents = async () => {
  await incidentsStore.fetchIncidents()
}

const refreshVehicles = async () => {
  await vehiclesStore.fetchVehicles()
  await vehiclesStore.fetchTracks()
}

const refreshPatrolAlerts = async () => {
  await patrolAlertsStore.fetchAlerts()
}

const filterResponders = async () => {
  await respondersStore.fetchResponders(selectedProvince.value || undefined)
}

const toggleVehicleMap = () => {
  showVehicleMap.value = !showVehicleMap.value
}

// Geolocation functions
const getLocation = async () => {
  isGettingLocation.value = true
  locationError.value = null

  try {
    const location = await getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    })

    currentLocation.value = location
    console.log('📍 [LOCATION] Current location obtained:', location)
  } catch (error) {
    const geoError = error as GeolocationError
    locationError.value = geoError.userMessage
    console.error('❌ [LOCATION] Failed to get location:', geoError)
  } finally {
    isGettingLocation.value = false
  }
}

const clearLocation = () => {
  currentLocation.value = null
  locationError.value = null
}

// Check geolocation availability on mount
const checkLocationSupport = async () => {
  const { supported, permission } = await checkGeolocationAvailability()
  geolocationSupported.value = supported

  if (supported) {
    console.log('🌍 [LOCATION] Geolocation supported, permission:', permission)
  } else {
    console.warn('🌍 [LOCATION] Geolocation not supported')
  }
}

const submitIncident = async () => {
  try {
    const result = await panicStore.submitNewIncident({
      description: incidentForm.value.description,
      priority: incidentForm.value.priority,
      address: incidentForm.value.address,
      province: incidentForm.value.province,
      source: 'dashboard',
      // Include location data if available
      ...(currentLocation.value && {
        lat: currentLocation.value.latitude,
        lng: currentLocation.value.longitude,
      }),
    })

    console.log('Incident submitted:', result)

    // Show success message
    alert('Incident submitted successfully!')

    // Reset form
    incidentForm.value = {
      description: '',
      priority: 'medium',
      address: '',
      province: '',
    }

    // Clear location data
    clearLocation()

    // Refresh incidents
    await refreshIncidents()
  } catch (error: unknown) {
    console.error('Failed to submit incident:', error)

    // Show user-friendly error message
    const errorMessage = (error as Error)?.message || 'Failed to submit incident. Please try again.'
    alert(`Error: ${errorMessage}`)
  }
}

// Development mode detection
const isDevelopment = computed(() => import.meta.env.DEV)

// Mock data detection (should now always be false since endpoints are implemented)
const hasMockData = computed(() => {
  // Keep the detection logic in case of fallbacks, but endpoints should now work
  const respondersData = respondersStore.responders
  const alertsData = patrolAlertsStore.alerts

  return (
    (respondersData && (respondersData as unknown as { _isMockData?: boolean })._isMockData) ||
    (alertsData && (alertsData as unknown as { _isMockData?: boolean })._isMockData) ||
    (respondersData && respondersData.some?.((r: Responder) => r.name?.includes('(Mock)'))) ||
    (alertsData && alertsData.some?.((a: PatrolAlert) => a.message?.includes('(Mock Data)')))
  )
})

onMounted(async () => {
  // Check geolocation support first
  await checkLocationSupport()

  // Load initial data
  await Promise.all([
    incidentsStore.fetchIncidents(),
    vehiclesStore.fetchVehicles(),
    respondersStore.fetchResponders(),
    patrolAlertsStore.fetchAlerts(),
  ])
})
</script>

<style scoped>
.panic-dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  border-radius: 1rem;
}

.stats {
  border-radius: 0.5rem;
}

.stat {
  padding: 1rem;
}

.stat-title {
  font-size: 0.875rem;
  color: hsl(var(--bc) / 0.7);
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
}

.btn-secondary {
  background-color: hsl(var(--s));
  color: hsl(var(--sc));
}

.btn-accent {
  background-color: hsl(var(--a));
  color: hsl(var(--ac));
}

.btn-warning {
  background-color: hsl(var(--wa));
  color: hsl(var(--wac));
}

.btn-outline {
  background-color: transparent;
  border: 1px solid hsl(var(--b3));
  color: hsl(var(--bc));
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-text {
  font-weight: 500;
  color: hsl(var(--bc));
}

.input,
.textarea,
.select {
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--b3));
  background-color: hsl(var(--b1));
  color: hsl(var(--bc));
  transition: border-color 0.2s;
}

.input:focus,
.textarea:focus,
.select:focus {
  outline: none;
  border-color: hsl(var(--p));
}

.textarea {
  resize: vertical;
  min-height: 6rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.h-96 {
  height: 24rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-base-content\/70 {
  color: hsl(var(--bc) / 0.7);
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.min-h-screen {
  min-height: 100vh;
}

.max-w-7xl {
  max-width: 80rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.p-6 {
  padding: 1.5rem;
}

.shadow-xl {
  box-shadow:
    0 20px 25px -5px hsl(var(--b3) / 0.1),
    0 10px 10px -5px hsl(var(--b3) / 0.04);
}

.bg-base-100 {
  background-color: hsl(var(--b1));
}

.bg-primary {
  background-color: hsl(var(--p));
}

.bg-secondary {
  background-color: hsl(var(--s));
}

.bg-accent {
  background-color: hsl(var(--a));
}

.bg-warning {
  background-color: hsl(var(--wa));
}

.text-primary {
  color: hsl(var(--p));
}

.text-secondary {
  color: hsl(var(--s));
}

.text-accent {
  color: hsl(var(--a));
}

.text-warning {
  color: hsl(var(--wa));
}

.text-success {
  color: hsl(var(--su));
}

.text-info {
  color: hsl(var(--in));
}

.text-white {
  color: white;
}

.border {
  border-width: 1px;
}

.border-primary {
  border-color: hsl(var(--p));
}

.border-base-300 {
  border-color: hsl(var(--b3));
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow {
  box-shadow:
    0 1px 3px 0 hsl(var(--b3) / 0.1),
    0 1px 2px 0 hsl(var(--b3) / 0.06);
}

.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.hover\:bg-opacity-80:hover {
  background-color: hsl(var(--p) / 0.8);
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px hsl(var(--p));
}

.focus\:ring-primary:focus {
  box-shadow: 0 0 0 2px hsl(var(--p));
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

.loading {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-xs {
  width: 0.75rem;
  height: 0.75rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
