<template>
  <div class="monitor-page">
    <header class="monitor-header">
      <div>
        <h1 class="text-2xl font-semibold text-base-content">{{ t('monitor.title') }}</h1>
        <p class="text-sm text-base-content/70">
          {{ lastUpdatedLabel }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          :class="isStreamConnected ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'"
        >
          <span
            class="inline-block h-2 w-2 rounded-full"
            :class="isStreamConnected ? 'bg-success' : 'bg-warning'"
          ></span>
          {{ connectionLabel }}
        </span>
        <button class="btn btn-sm btn-outline" @click="refreshIncidents()" :disabled="loading">
          {{ t('monitor.refresh') }}
        </button>
      </div>
    </header>

    <section class="monitor-filters">
      <div class="filter-group">
        <label class="label-text">{{ t('monitor.filters.status') }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="btn btn-xs"
            :class="activeStatuses.has(option.value) ? 'btn-primary' : 'btn-outline'"
            type="button"
            @click="handleStatusToggle(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="label-text">{{ t('monitor.filters.dateRange') }}</label>
        <div class="flex flex-wrap items-center gap-2">
          <input v-model="fromDate" type="date" class="input input-sm input-bordered" />
          <span class="text-xs text-base-content/60">{{ t('monitor.filters.to') }}</span>
          <input v-model="toDate" type="date" class="input input-sm input-bordered" />
        </div>
      </div>

      <div class="filter-group">
        <label class="label-text">{{ t('monitor.filters.search') }}</label>
        <input
          v-model="searchTerm"
          type="search"
          class="input input-sm input-bordered w-full"
          :placeholder="t('monitor.filters.searchPlaceholder')"
        />
      </div>

      <div class="filter-group flex items-center gap-2">
        <input id="map-filter" v-model="limitToMap" type="checkbox" class="checkbox checkbox-sm" />
        <label class="label-text cursor-pointer" for="map-filter">
          {{ t('monitor.filters.limitToMap') }}
        </label>
      </div>

      <div class="filter-actions">
        <button class="btn btn-sm btn-ghost" type="button" @click="clearFilters">
          {{ t('monitor.filters.clear') }}
        </button>
      </div>
    </section>

    <section class="monitor-content">
      <div class="incident-list">
        <header class="list-header">
          <div>
            <h2 class="text-lg font-semibold text-base-content">{{ incidentCountLabel }}</h2>
            <p class="text-xs text-base-content/60" v-if="filters.search">
              {{ t('monitor.activeFilters.search', { query: filters.search }) }}
            </p>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="incidentStore.loadWaypoints()">
            {{ t('monitor.filters.refreshWaypoints') }}
          </button>
        </header>

        <div class="list-body" :class="loading ? 'opacity-70 pointer-events-none' : ''">
          <div v-if="loading" class="list-state">
            <span class="loading loading-spinner" />
            <span>{{ t('monitor.loading') }}</span>
          </div>

          <div v-else-if="error" class="list-state text-error">
            <p>{{ error }}</p>
            <button class="btn btn-xs btn-outline" type="button" @click="refreshIncidents()">
              {{ t('monitor.retry') }}
            </button>
          </div>

          <ul v-else-if="filteredIncidents.length > 0" class="incident-items">
            <li v-for="incident in filteredIncidents" :key="incident.id">
              <button
                type="button"
                class="incident-item"
                :class="selectedIncident?.id === incident.id ? 'incident-item--active' : ''"
                @click="handleSelectIncident(incident)"
              >
                <div class="incident-item__header">
                  <span class="incident-item__title">{{ incident.summary }}</span>
                  <span class="badge badge-sm" :class="statusBadgeClass(incident.status)">
                    {{ statusLabel(incident.status) }}
                  </span>
                </div>
                <div class="incident-item__meta">
                  <span>{{ formatRelativeTime(incident.reportedAt) }}</span>
                  <span v-if="incident.priority" class="badge badge-ghost badge-xs">
                    {{ incident.priority.toUpperCase() }}
                  </span>
                </div>
                <p v-if="incident.description" class="incident-item__description">
                  {{ incident.description }}
                </p>
                <div class="incident-item__footer">
                  <span v-if="incident.reporter?.name">
                    {{ incident.reporter.name }}
                  </span>
                  <span v-if="incident.responder?.name" class="text-xs text-base-content/60">
                    {{ t('monitor.assignedTo', { name: incident.responder.name }) }}
                  </span>
                </div>
              </button>
            </li>
          </ul>

          <div v-else class="list-state">
            <p>{{ t('monitor.noIncidents') }}</p>
          </div>
        </div>
      </div>

      <div class="map-pane">
        <IncidentMap
          ref="mapRef"
          :incidents="filteredIncidents"
          :selected-incident-id="selectedIncident?.id ?? undefined"
          :highlight-incident-id="highlightIncidentId ?? undefined"
          :waypoints="waypoints"
          @select="handleIncidentSelectedFromMap"
          @bbox-change="handleBboxChange"
        />
      </div>
    </section>

    <Transition name="drawer">
      <aside v-if="selectedIncident" class="incident-drawer">
        <header class="drawer-header">
          <div>
            <h2 class="drawer-title">{{ selectedIncident.summary }}</h2>
            <p class="drawer-subtitle">
              {{ formatExactTime(selectedIncident.reportedAt) }} ·
              {{ formatRelativeTime(selectedIncident.reportedAt) }}
            </p>
          </div>
          <button
            class="btn btn-sm btn-ghost"
            type="button"
            @click="incidentStore.selectIncident(null)"
          >
            {{ t('monitor.close') }}
          </button>
        </header>

        <section class="drawer-section">
          <div class="drawer-status">
            <span class="badge" :class="statusBadgeClass(selectedIncident.status)">
              {{ statusLabel(selectedIncident.status) }}
            </span>
            <span v-if="selectedIncident.priority" class="badge badge-outline">
              {{ selectedIncident.priority.toUpperCase() }}
            </span>
          </div>
          <p v-if="selectedIncident.description" class="drawer-description">
            {{ selectedIncident.description }}
          </p>
        </section>

        <section class="drawer-section drawer-grid">
          <div>
            <h3 class="drawer-heading">{{ t('monitor.details.reporter') }}</h3>
            <p v-if="selectedIncident.reporter?.name" class="drawer-text">
              {{ selectedIncident.reporter.name }}
            </p>
            <p v-if="selectedIncident.reporter?.phone" class="drawer-text">
              {{ selectedIncident.reporter.phone }}
            </p>
          </div>
          <div>
            <h3 class="drawer-heading">{{ t('monitor.details.responder') }}</h3>
            <p v-if="selectedIncident.responder?.name" class="drawer-text">
              {{ selectedIncident.responder.name }}
            </p>
            <p v-if="selectedIncident.responder?.phone" class="drawer-text">
              {{ selectedIncident.responder.phone }}
            </p>
          </div>
          <div>
            <h3 class="drawer-heading">{{ t('monitor.details.location') }}</h3>
            <p class="drawer-text">
              {{ formatLocation(selectedIncident) }}
            </p>
          </div>
        </section>

        <footer class="drawer-footer">
          <div class="flex gap-2">
            <button class="btn btn-sm btn-outline" type="button" @click="viewSelectedOnMap">
              {{ t('monitor.viewOnMap') }}
            </button>
            <button
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!canAcknowledge"
              @click="selectedIncident && handleAcknowledge(selectedIncident)"
            >
              {{ t('monitor.acknowledge') }}
            </button>
            <button
              class="btn btn-sm btn-secondary"
              type="button"
              :disabled="!canResolve"
              @click="selectedIncident && handleResolve(selectedIncident)"
            >
              {{ t('monitor.resolve') }}
            </button>
          </div>
        </footer>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import IncidentMap from '@/components/IncidentMap.vue'
import { useIncidentStore } from '@/stores/incidents'
import { useIncidentStream, isIncidentEnvelope } from '@/composables/useIncidentStream'
import { useToasts } from '@/composables/useToasts'
import { mapIncident } from '@/services/panic'
import type {
  Incident,
  IncidentStatus,
  IncidentStreamEnvelope,
  PatrolAlertPayload,
} from '@/types/panic'

const incidentStore = useIncidentStore()
const {
  filteredIncidents,
  filters,
  loading,
  error,
  lastUpdated,
  selectedIncident,
  waypoints,
  activeStatuses,
} = storeToRefs(incidentStore)

const { t, locale } = useI18n()
const { push: pushToast } = useToasts()

const mapRef = ref<InstanceType<typeof IncidentMap> | null>(null)
const highlightIncidentId = ref<string | null>(null)
const searchTerm = ref(filters.value.search ?? '')
const fromDate = ref(filters.value.dateRange.from ?? '')
const toDate = ref(filters.value.dateRange.to ?? '')
const limitToMap = ref(false)
const lastKnownBbox = ref<[number, number, number, number] | null>(filters.value.bbox ?? null)

if (filters.value.bbox) {
  limitToMap.value = true
}

const stream = useIncidentStream({ autoConnect: true })
const isStreamConnected = stream.isConnected

const relativeTimeFormatter = computed(
  () => new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' }),
)

const absoluteTimeFormatter = computed(
  () => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }),
)

const statusOptions = computed(() => [
  { value: 'open' as IncidentStatus, label: t('monitor.statuses.open') },
  { value: 'acknowledged' as IncidentStatus, label: t('monitor.statuses.acknowledged') },
  { value: 'resolved' as IncidentStatus, label: t('monitor.statuses.resolved') },
])

const incidentCountLabel = computed(() =>
  t('monitor.listCount', { count: filteredIncidents.value.length }),
)
const connectionLabel = computed(() =>
  isStreamConnected.value ? t('monitor.sseConnected') : t('monitor.sseDisconnected'),
)
const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) {
    return t('monitor.loading')
  }
  return t('monitor.lastUpdated', { time: formatRelativeTime(lastUpdated.value) })
})

const canAcknowledge = computed(() => selectedIncident.value?.status === 'open')
const canResolve = computed(
  () =>
    selectedIncident.value?.status === 'open' || selectedIncident.value?.status === 'acknowledged',
)

let pollingHandle: ReturnType<typeof setInterval> | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null
let dateTimer: ReturnType<typeof setTimeout> | null = null
let bboxTimer: ReturnType<typeof setTimeout> | null = null
let highlightTimer: ReturnType<typeof setTimeout> | null = null
let initialStreamCheck = true

onMounted(async () => {
  await refreshIncidents()
  await incidentStore.loadWaypoints()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
  if (searchTimer) clearTimeout(searchTimer)
  if (dateTimer) clearTimeout(dateTimer)
  if (bboxTimer) clearTimeout(bboxTimer)
  if (highlightTimer) clearTimeout(highlightTimer)
})

watch(
  () => filters.value.search,
  (value) => {
    if ((value ?? '') !== searchTerm.value) {
      searchTerm.value = value ?? ''
    }
  },
)

watch(
  () => filters.value.dateRange.from,
  (value) => {
    if ((value ?? '') !== fromDate.value) {
      fromDate.value = value ?? ''
    }
  },
)

watch(
  () => filters.value.dateRange.to,
  (value) => {
    if ((value ?? '') !== toDate.value) {
      toDate.value = value ?? ''
    }
  },
)

watch(searchTerm, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    incidentStore.setSearch(value)
  }, 250)
})

watch(
  () => [fromDate.value, toDate.value],
  () => {
    if (dateTimer) {
      clearTimeout(dateTimer)
    }
    dateTimer = setTimeout(() => {
      incidentStore.setDateRange(fromDate.value || null, toDate.value || null)
      refreshIncidents(true)
    }, 350)
  },
)

watch(limitToMap, (enabled) => {
  if (!enabled) {
    incidentStore.setBoundingBox(null)
    refreshIncidents(true)
    return
  }

  if (lastKnownBbox.value) {
    incidentStore.setBoundingBox(lastKnownBbox.value)
    refreshIncidents(true)
  }
})

watch(isStreamConnected, (connected) => {
  if (initialStreamCheck) {
    initialStreamCheck = false
    return
  }

  pushToast({
    variant: connected ? 'success' : 'warning',
    title: connected ? t('monitor.streamRestored') : t('monitor.streamLost'),
    message: connectionLabel.value,
  })
})

stream.on('incident', (event) => {
  const envelope = normalizeEnvelope(event.data, 'incident')
  if (!envelope) {
    return
  }

  const incident = mapIncident(envelope.payload)
  incidentStore.upsertIncident(incident)
})

stream.on('incident_updated', (event) => {
  const envelope = normalizeEnvelope(event.data, 'incident_updated')
  if (!envelope) {
    return
  }
  const incident = mapIncident(envelope.payload)
  incidentStore.upsertIncident(incident)
})

stream.on('incident_resolved', (event) => {
  const envelope = normalizeEnvelope(event.data, 'incident_resolved')
  if (!envelope) {
    return
  }
  const incident = mapIncident(envelope.payload)
  incidentStore.upsertIncident(incident)
})

stream.on('incident_removed', (event) => {
  const envelope = normalizeEnvelope(event.data, 'incident_removed')
  if (envelope?.payload) {
    const id = getIncidentId(envelope.payload)
    if (id) {
      incidentStore.removeIncident(id)
    }
  }
})

stream.on('patrol_alert', (event) => {
  const envelope = normalizeEnvelope<PatrolAlertPayload | Incident>(event.data, 'patrol_alert')
  if (!envelope) {
    return
  }

  const payload = envelope.payload
  const incidentData = isPatrolPayload(payload) ? payload.incident : (payload as Incident)
  const incident = mapIncident(incidentData)
  incidentStore.upsertIncident(incident)

  pushToast({
    variant: 'warning',
    title: t('monitor.patrolAlertTitle'),
    message: formatPatrolAlertMessage(incident, payload),
    action: {
      label: t('monitor.viewOnMap'),
      handler: () => {
        incidentStore.selectIncident(incident.id)
        focusIncidentOnMap(incident)
      },
    },
  })

  focusIncidentOnMap(incident)
})

function startPolling() {
  if (typeof window === 'undefined') {
    return
  }
  stopPolling()
  pollingHandle = setInterval(() => {
    refreshIncidents(true)
  }, 60000)
}

function stopPolling() {
  if (pollingHandle) {
    clearInterval(pollingHandle)
    pollingHandle = null
  }
}

async function refreshIncidents(silent = false) {
  await incidentStore.fetchIncidents({ silent })
}

function handleStatusToggle(status: IncidentStatus) {
  incidentStore.toggleStatus(status)
  refreshIncidents(true)
}

function clearFilters() {
  incidentStore.resetFilters()
  searchTerm.value = ''
  fromDate.value = ''
  toDate.value = ''
  limitToMap.value = false
  lastKnownBbox.value = null
  refreshIncidents()
}

function handleSelectIncident(incident: Incident) {
  incidentStore.selectIncident(incident.id)
  focusIncidentOnMap(incident)
}

function handleIncidentSelectedFromMap(incidentId: string | null) {
  incidentStore.selectIncident(incidentId)
}

function viewSelectedOnMap() {
  if (!selectedIncident.value) {
    return
  }
  focusIncidentOnMap(selectedIncident.value)
}

function focusIncidentOnMap(incident: Incident) {
  nextTick(() => {
    mapRef.value?.flyToIncident(incident)
    pulseHighlight(incident.id)
  })
}

function handleBboxChange(bbox: [number, number, number, number]) {
  lastKnownBbox.value = bbox
  if (!limitToMap.value) {
    return
  }

  incidentStore.setBoundingBox(bbox)
  if (bboxTimer) {
    clearTimeout(bboxTimer)
  }
  bboxTimer = setTimeout(() => {
    refreshIncidents(true)
  }, 500)
}

function pulseHighlight(id: string) {
  highlightIncidentId.value = id
  if (highlightTimer) {
    clearTimeout(highlightTimer)
  }
  highlightTimer = setTimeout(() => {
    if (highlightIncidentId.value === id) {
      highlightIncidentId.value = null
    }
  }, 2200)
}

async function handleAcknowledge(incident: Incident) {
  try {
    await incidentStore.acknowledge(incident.id)
    pushToast({
      variant: 'success',
      title: t('common.success'),
      message: t('monitor.acknowledgedToast'),
    })
  } catch (err) {
    pushToast({
      variant: 'error',
      title: t('monitor.actionFailed'),
      message: err instanceof Error ? err.message : t('monitor.actionFailed'),
    })
  }
}

async function handleResolve(incident: Incident) {
  try {
    await incidentStore.resolve(incident.id)
    pushToast({
      variant: 'success',
      title: t('common.success'),
      message: t('monitor.resolvedToast'),
    })
  } catch (err) {
    pushToast({
      variant: 'error',
      title: t('monitor.actionFailed'),
      message: err instanceof Error ? err.message : t('monitor.actionFailed'),
    })
  }
}

function statusLabel(status: IncidentStatus) {
  switch (status) {
    case 'acknowledged':
      return t('monitor.statuses.acknowledged')
    case 'resolved':
      return t('monitor.statuses.resolved')
    default:
      return t('monitor.statuses.open')
  }
}

function statusBadgeClass(status: IncidentStatus) {
  switch (status) {
    case 'acknowledged':
      return 'badge-info'
    case 'resolved':
      return 'badge-success'
    default:
      return 'badge-warning'
  }
}

function formatRelativeTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const diff = date.getTime() - Date.now()
  const absDiff = Math.abs(diff)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ]

  for (const [unit, unitMs] of units) {
    if (absDiff >= unitMs || unit === 'second') {
      const value = Math.round(diff / unitMs)
      return relativeTimeFormatter.value.format(value, unit)
    }
  }

  return t('monitor.updatedNow')
}

function formatExactTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  return absoluteTimeFormatter.value.format(date)
}

function formatLocation(incident: Incident) {
  if (incident.location.address) {
    return incident.location.address
  }
  return `${incident.location.latitude.toFixed(3)}, ${incident.location.longitude.toFixed(3)}`
}

function formatPatrolAlertMessage(
  incident: Incident,
  payload: PatrolAlertPayload | Incident,
): string {
  const responderName = isPatrolPayload(payload)
    ? (payload.responder?.name ?? incident.responder?.name)
    : incident.responder?.name
  const locationLabel = incident.location.address
    ? incident.location.address
    : `${incident.location.latitude.toFixed(3)}, ${incident.location.longitude.toFixed(3)}`

  if (responderName) {
    return t('monitor.patrolAlertBodyWithResponder', {
      name: responderName,
      location: locationLabel,
    })
  }

  return t('monitor.patrolAlertBody', {
    location: locationLabel,
  })
}

function normalizeEnvelope<T = Incident | PatrolAlertPayload>(
  value: unknown,
  fallbackType: string,
): IncidentStreamEnvelope<T> | null {
  if (isIncidentEnvelope(value)) {
    return value as IncidentStreamEnvelope<T>
  }

  if (!value) {
    return null
  }

  return {
    type: fallbackType,
    payload: value as T,
    receivedAt: new Date().toISOString(),
  }
}

function getIncidentId(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate =
    (value as Record<string, unknown>).id ??
    (value as Record<string, unknown>).incidentId ??
    (value as Record<string, unknown>).incident_id
  return candidate ? String(candidate) : null
}

function isPatrolPayload(value: unknown): value is PatrolAlertPayload {
  return Boolean(
    value && typeof value === 'object' && 'incident' in (value as Record<string, unknown>),
  )
}
</script>

<style scoped>
.monitor-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.08), transparent 65%);
}

.monitor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.monitor-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  background: var(--color-base-100, #fff);
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.monitor-content {
  display: grid;
  grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
  height: 60vh;
}

.incident-list {
  display: flex;
  flex-direction: column;
  background: var(--color-base-100, #fff);
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.list-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  text-align: center;
}

.incident-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 0.5rem 0.75rem;
}

.incident-item {
  width: 100%;
  text-align: left;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.85rem;
  border: 1px solid transparent;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.incident-item:hover {
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
}

.incident-item--active {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 18px 30px rgba(59, 130, 246, 0.18);
}

.incident-item__header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.incident-item__title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-base-content, #1f2937);
}

.incident-item__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.65);
}

.incident-item__description {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.75);
}

.incident-item__footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(15, 23, 42, 0.6);
}

.map-pane {
  background: var(--color-base-100, #fff);
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  position: relative;
  min-height: 400px;
  height: 100%;
}

.incident-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: min(420px, 90vw);
  height: 100%;
  background: var(--color-base-100, #fff);
  box-shadow: -10px 0 40px rgba(15, 23, 42, 0.15);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  z-index: 40;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.drawer-subtitle {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.drawer-status {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.drawer-description {
  font-size: 0.95rem;
  line-height: 1.45;
  color: rgba(15, 23, 42, 0.8);
}

.drawer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.drawer-heading {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.75);
}

.drawer-text {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.8);
}

.drawer-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

@media (max-width: 1024px) {
  .monitor-content {
    grid-template-columns: 1fr;
  }

  .incident-list {
    order: 2;
  }

  .map-pane {
    order: 1;
    min-height: 320px;
  }
}
</style>
