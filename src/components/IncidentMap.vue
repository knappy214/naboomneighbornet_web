<template>
  <div ref="mapContainer" class="incident-map">
    <div v-if="!ready" class="map-loader">
      <span class="loading loading-spinner loading-md" />
      <span>{{ $t('monitor.loading') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadMapLibre, type MapInstance, type MapLibreModule } from '@/lib/maplibre'
import type { Incident, Waypoint } from '@/types/panic'

const props = defineProps({
  incidents: {
    type: Array as () => Incident[],
    default: () => [],
  },
  selectedIncidentId: {
    type: String,
    default: null,
  },
  highlightIncidentId: {
    type: String,
    default: null,
  },
  waypoints: {
    type: Array as () => Waypoint[],
    default: () => [],
  },
})

const emit = defineEmits<{
  (event: 'select', incidentId: string | null): void
  (event: 'bbox-change', bbox: [number, number, number, number]): void
  (event: 'ready', map: MapInstance): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<MapInstance | null>(null)
const ready = ref(false)

let maplibre: MapLibreModule | null = null
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const INCIDENT_SOURCE = 'incident-source'
const CLUSTER_LAYER = 'incident-clusters'
const CLUSTER_COUNT_LAYER = 'incident-cluster-count'
const POINT_LAYER = 'incident-points'
const SELECTED_LAYER = 'incident-selected'
const HIGHLIGHT_LAYER = 'incident-highlight'
const WAYPOINT_SOURCE = 'waypoint-source'
const WAYPOINT_LAYER = 'waypoint-circles'

const featureCollection = computed(() => buildIncidentCollection(props.incidents))
const waypointCollection = computed(() => buildWaypointCollection(props.waypoints))

onMounted(async () => {
  if (!mapContainer.value) {
    return
  }

  try {
    maplibre = await loadMapLibre()
  } catch (error) {
    console.error('[panic] Failed to load MapLibre', error)
    return
  }

  const style = import.meta.env.VITE_MAP_STYLE || 'https://demotiles.maplibre.org/style.json'
  map.value = new maplibre.Map({
    container: mapContainer.value,
    style,
    center: [28.188, -25.5],
    zoom: 6.5,
    minZoom: 3,
    maxZoom: 18,
  })

  map.value?.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right')

  map.value?.on('load', () => {
    setupSources()
    setupLayers()
    bindInteractions()
    ready.value = true
    updateIncidents()
    updateWaypoints()
    updateSelected(props.selectedIncidentId)
    updateHighlight(props.highlightIncidentId)
    emitBounds()
    emit('ready', map.value as MapInstance)
  })

  map.value?.on('moveend', emitBounds)
})

onBeforeUnmount(() => {
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }
  map.value?.remove()
  map.value = null
})

watch(
  () => featureCollection.value,
  () => {
    updateIncidents()
  },
  { deep: true },
)

watch(
  () => props.selectedIncidentId,
  (id) => {
    updateSelected(id)
    if (!id) {
      return
    }

    const incident = props.incidents.find((item) => item.id === id)
    if (incident) {
      flyToIncident(incident)
    }
  },
)

watch(
  () => props.highlightIncidentId,
  (id) => {
    if (id) {
      flashIncident(id)
    }
  },
)

watch(
  () => waypointCollection.value,
  () => updateWaypoints(),
  { deep: true },
)

function setupSources() {
  if (!map.value || !maplibre) {
    return
  }

  if (!map.value.getSource(INCIDENT_SOURCE)) {
    map.value.addSource(INCIDENT_SOURCE, {
      type: 'geojson',
      data: featureCollection.value,
      cluster: true,
      clusterRadius: 60,
      clusterMaxZoom: 14,
    })
  }

  if (!map.value.getSource(WAYPOINT_SOURCE)) {
    map.value.addSource(WAYPOINT_SOURCE, {
      type: 'geojson',
      data: waypointCollection.value,
    })
  }
}

function setupLayers() {
  if (!map.value) {
    return
  }

  if (!map.value.getLayer(CLUSTER_LAYER)) {
    map.value.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: INCIDENT_SOURCE,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#1d4ed8', 5, '#2563eb', 15, '#1e3a8a'],
        'circle-radius': ['step', ['get', 'point_count'], 14, 5, 18, 15, 22],
        'circle-opacity': 0.85,
      },
    })
  }

  if (!map.value.getLayer(CLUSTER_COUNT_LAYER)) {
    map.value.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: INCIDENT_SOURCE,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })
  }

  if (!map.value.getLayer(POINT_LAYER)) {
    map.value.addLayer({
      id: POINT_LAYER,
      type: 'circle',
      source: INCIDENT_SOURCE,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-color': [
          'match',
          ['get', 'status'],
          'resolved',
          '#22c55e',
          'acknowledged',
          '#38bdf8',
          'open',
          '#f97316',
          '#6366f1',
        ],
      },
    })
  }

  if (!map.value.getLayer(SELECTED_LAYER)) {
    map.value.addLayer({
      id: SELECTED_LAYER,
      type: 'circle',
      source: INCIDENT_SOURCE,
      filter: ['in', ['get', 'id'], ['literal', []]],
      paint: {
        'circle-radius': 16,
        'circle-color': '#fbbf24',
        'circle-opacity': 0.25,
        'circle-stroke-color': '#f59e0b',
        'circle-stroke-width': 2,
      },
    })
  }

  if (!map.value.getLayer(HIGHLIGHT_LAYER)) {
    map.value.addLayer({
      id: HIGHLIGHT_LAYER,
      type: 'circle',
      source: INCIDENT_SOURCE,
      filter: ['in', ['get', 'id'], ['literal', []]],
      paint: {
        'circle-radius': 22,
        'circle-color': '#fb923c',
        'circle-opacity': 0.2,
        'circle-stroke-color': '#f97316',
        'circle-stroke-width': 1,
      },
    })
  }

  if (!map.value.getLayer(WAYPOINT_LAYER)) {
    map.value.addLayer({
      id: WAYPOINT_LAYER,
      type: 'circle',
      source: WAYPOINT_SOURCE,
      paint: {
        'circle-radius': [
          'case',
          ['has', 'radius'],
          ['interpolate', ['linear'], ['zoom'], 8, 6, 16, 18],
          8,
        ],
        'circle-color': ['coalesce', ['get', 'color'], '#3b82f6'],
        'circle-opacity': 0.18,
        'circle-stroke-color': ['coalesce', ['get', 'color'], '#1d4ed8'],
        'circle-stroke-width': 2,
      },
    })
  }
}

function bindInteractions() {
  if (!map.value) {
    return
  }

  map.value.on('click', CLUSTER_LAYER, (event: any) => {
    const feature = event.features?.[0]
    if (!feature) {
      return
    }

    const clusterId = feature.properties?.cluster_id
    const coordinates = feature.geometry?.coordinates
    const source = map.value!.getSource(INCIDENT_SOURCE) as any
    if (source?.getClusterExpansionZoom && clusterId != null) {
      source.getClusterExpansionZoom(clusterId, (error: unknown, zoom: number) => {
        if (error) {
          return
        }
        map.value?.easeTo({ center: coordinates, zoom })
      })
    }
  })

  map.value.on('click', POINT_LAYER, (event: any) => {
    const feature = event.features?.[0]
    if (!feature) {
      return
    }
    const id = feature.properties?.id
    if (typeof id === 'string') {
      emit('select', id)
    }
  })

  map.value.on('mouseenter', POINT_LAYER, () => {
    if (map.value) {
      map.value.getCanvas().style.cursor = 'pointer'
    }
  })

  map.value.on('mouseleave', POINT_LAYER, () => {
    if (map.value) {
      map.value.getCanvas().style.cursor = ''
    }
  })
}

function updateIncidents() {
  if (!map.value) {
    return
  }

  const source = map.value.getSource(INCIDENT_SOURCE) as any
  if (source && typeof source.setData === 'function') {
    source.setData(featureCollection.value)
  }
}

function updateWaypoints() {
  if (!map.value) {
    return
  }

  const source = map.value.getSource(WAYPOINT_SOURCE) as any
  if (source && typeof source.setData === 'function') {
    source.setData(waypointCollection.value)
  }
}

function updateSelected(incidentId: string | null) {
  if (!map.value) {
    return
  }

  const filter = incidentId
    ? ['==', ['get', 'id'], incidentId]
    : ['in', ['get', 'id'], ['literal', []]]
  if (map.value.getLayer(SELECTED_LAYER)) {
    map.value.setFilter(SELECTED_LAYER, filter)
  }
}

function updateHighlight(incidentId: string | null) {
  if (!map.value) {
    return
  }

  const filter = incidentId
    ? ['==', ['get', 'id'], incidentId]
    : ['in', ['get', 'id'], ['literal', []]]
  if (map.value.getLayer(HIGHLIGHT_LAYER)) {
    map.value.setFilter(HIGHLIGHT_LAYER, filter)
  }
}

function emitBounds() {
  if (!map.value) {
    return
  }

  const bounds = map.value.getBounds().toArray()
  if (bounds && bounds[0] && bounds[1]) {
    emit('bbox-change', [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]])
  }
}

function flyToIncident(incident: Incident, zoom = 15) {
  if (!map.value) {
    return
  }

  map.value.flyTo({
    center: [incident.location.longitude, incident.location.latitude],
    zoom,
    speed: 1.6,
  })
}

function flashIncident(incidentId: string, duration = 1800) {
  if (!map.value) {
    return
  }

  updateHighlight(incidentId)
  if (highlightTimer) {
    clearTimeout(highlightTimer)
  }

  highlightTimer = setTimeout(() => {
    updateHighlight(null)
  }, duration)
}

function fitToIncidents() {
  if (!map.value || props.incidents.length === 0) {
    return
  }

  const coordinates = props.incidents
    .filter(
      (incident) =>
        Number.isFinite(incident.location.longitude) && Number.isFinite(incident.location.latitude),
    )
    .map(
      (incident) => [incident.location.longitude, incident.location.latitude] as [number, number],
    )

  if (coordinates.length === 0) {
    return
  }

  const bounds = coordinates.reduce(
    (acc, coord) => {
      acc[0] = Math.min(acc[0], coord[0])
      acc[1] = Math.min(acc[1], coord[1])
      acc[2] = Math.max(acc[2], coord[0])
      acc[3] = Math.max(acc[3], coord[1])
      return acc
    },
    [Infinity, Infinity, -Infinity, -Infinity] as [number, number, number, number],
  )

  if (bounds[0] === Infinity) {
    return
  }

  map.value.fitBounds(
    [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ],
    {
      padding: 60,
      maxZoom: 15,
    },
  )
}

function buildIncidentCollection(incidents: Incident[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: incidents
      .filter(
        (incident) =>
          Number.isFinite(incident.location.longitude) &&
          Number.isFinite(incident.location.latitude),
      )
      .map((incident) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [incident.location.longitude, incident.location.latitude],
        },
        properties: {
          id: incident.id,
          status: incident.status,
          summary: incident.summary,
          reportedAt: incident.reportedAt,
        },
      })),
  }
}

function buildWaypointCollection(waypoints: Waypoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: waypoints
      .filter(
        (waypoint) => Number.isFinite(waypoint.longitude) && Number.isFinite(waypoint.latitude),
      )
      .map((waypoint) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [waypoint.longitude, waypoint.latitude],
        },
        properties: {
          id: waypoint.id,
          name: waypoint.name,
          radius: waypoint.radius,
          color: waypoint.color,
        },
      })),
  }
}

function resize() {
  nextTick(() => {
    map.value?.resize()
  })
}

defineExpose({ flyToIncident, flashIncident, fitToIncidents, resize })
</script>

<style scoped>
.incident-map {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  overflow: hidden;
}

.map-loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.08));
  color: var(--color-base-content, #1f2937);
}
</style>
