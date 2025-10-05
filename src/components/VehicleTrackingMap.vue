<template>
  <div ref="mapContainer" class="vehicle-tracking-map">
    <div v-if="!ready" class="map-loader">
      <span class="loading loading-spinner loading-md" />
      <span>{{ $t('monitor.loading') }}</span>
    </div>

    <!-- Vehicle controls -->
    <div v-if="ready" class="vehicle-controls">
      <div class="control-group">
        <button
          @click="toggleVehicles"
          :class="['btn', 'btn-sm', showVehicles ? 'btn-primary' : 'btn-outline']"
        >
          {{ showVehicles ? $t('vehicles.hide') : $t('vehicles.show') }}
        </button>
        <button
          @click="toggleTracks"
          :class="['btn', 'btn-sm', showTracks ? 'btn-primary' : 'btn-outline']"
        >
          {{ showTracks ? $t('vehicles.hideTracks') : $t('vehicles.showTracks') }}
        </button>
        <button @click="refreshVehicles" class="btn btn-sm btn-outline" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner loading-xs" />
          {{ $t('common.refresh') }}
        </button>
      </div>

      <div class="control-group">
        <select v-model="selectedVehicle" class="select select-sm">
          <option value="">{{ $t('vehicles.allVehicles') }}</option>
          <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
            {{ vehicle.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { StyleSpecification } from 'maplibre-gl'
import { loadMapLibre, type MapInstance, type MapLibreModule } from '@/lib/maplibre'
import { useVehiclesStore } from '@/stores/vehicles'
import type { Vehicle, VehicleTrack } from '@/types/panic.d'

const props = defineProps({
  center: {
    type: Array as () => [number, number],
    default: () => [28.188, -25.5],
  },
  zoom: {
    type: Number,
    default: 6.5,
  },
  showVehicles: {
    type: Boolean,
    default: true,
  },
  showTracks: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (event: 'vehicle-select', vehicle: Vehicle | null): void
  (event: 'ready', map: MapInstance): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<MapInstance | null>(null)
const ready = ref(false)

const vehiclesStore = useVehiclesStore()
const { vehicles, tracks, isLoading, fetchVehicles, fetchTracks } = vehiclesStore

let maplibre: MapLibreModule | null = null
const selectedVehicle = ref<string>('')

const VEHICLE_SOURCE = 'vehicle-source'
const VEHICLE_LAYER = 'vehicle-circles'
const VEHICLE_LABEL_LAYER = 'vehicle-labels'
const TRACK_SOURCE = 'track-source'
const TRACK_LAYER = 'track-lines'

const FALLBACK_STYLE_URL: StyleSpecification = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
}

onMounted(async () => {
  if (!mapContainer.value) {
    return
  }

  try {
    maplibre = await loadMapLibre()
  } catch (error) {
    console.error('[vehicles] Failed to load MapLibre', error)
    return
  }

  const styleInput = import.meta.env.VITE_MAP_STYLE || FALLBACK_STYLE_URL
  const mapStyle = typeof styleInput === 'string' ? styleInput : FALLBACK_STYLE_URL

  map.value = new maplibre.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: props.center,
    zoom: props.zoom,
    minZoom: 3,
    maxZoom: 18,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    cooperativeGestures: true,
  })

  map.value?.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right')
  map.value?.addControl(new maplibre.FullscreenControl(), 'top-right')
  map.value?.addControl(new maplibre.ScaleControl({ maxWidth: 140, unit: 'metric' }), 'bottom-left')

  map.value?.on('load', () => {
    setupSources()
    setupLayers()
    bindInteractions()
    ready.value = true
    updateVehicles()
    updateTracks()
    emit('ready', map.value as MapInstance)
  })

  // Load initial data
  await fetchVehicles()
  await fetchTracks()
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
})

watch(
  () => vehicles.value,
  () => {
    updateVehicles()
  },
  { deep: true },
)

watch(
  () => tracks.value,
  () => {
    updateTracks()
  },
  { deep: true },
)

watch(
  () => props.showVehicles,
  () => {
    updateVehicleVisibility()
  },
)

watch(
  () => props.showTracks,
  () => {
    updateTrackVisibility()
  },
)

watch(
  () => selectedVehicle.value,
  () => {
    updateVehicleSelection()
  },
)

function setupSources() {
  if (!map.value || !maplibre) {
    return
  }

  if (!map.value.getSource(VEHICLE_SOURCE)) {
    map.value.addSource(VEHICLE_SOURCE, {
      type: 'geojson',
      data: buildVehicleCollection(vehicles.value),
    })
  }

  if (!map.value.getSource(TRACK_SOURCE)) {
    map.value.addSource(TRACK_SOURCE, {
      type: 'geojson',
      data: buildTrackCollection(tracks.value),
    })
  }
}

function setupLayers() {
  if (!map.value) {
    return
  }

  // Vehicle circles
  if (!map.value.getLayer(VEHICLE_LAYER)) {
    map.value.addLayer({
      id: VEHICLE_LAYER,
      type: 'circle',
      source: VEHICLE_SOURCE,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 8, 10, 12, 16, 16],
        'circle-color': 'hsl(var(--p))',
        'circle-stroke-color': 'hsl(var(--b1))',
        'circle-stroke-width': 2,
        'circle-opacity': 0.8,
      },
    })
  }

  // Vehicle labels
  if (!map.value.getLayer(VEHICLE_LABEL_LAYER)) {
    map.value.addLayer({
      id: VEHICLE_LABEL_LAYER,
      type: 'symbol',
      source: VEHICLE_SOURCE,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Arial Unicode MS Bold', 'Arial', 'sans-serif'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 16, 14],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-optional': true,
      },
      paint: {
        'text-color': 'hsl(var(--bc))',
        'text-halo-color': 'hsl(var(--b1))',
        'text-halo-width': 1,
      },
    })
  }

  // Track lines
  if (!map.value.getLayer(TRACK_LAYER)) {
    map.value.addLayer({
      id: TRACK_LAYER,
      type: 'line',
      source: TRACK_SOURCE,
      paint: {
        'line-color': 'hsl(var(--su))',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 4, 16, 6],
        'line-opacity': 0.7,
      },
    })
  }
}

function bindInteractions() {
  if (!map.value) {
    return
  }

  map.value.on('click', VEHICLE_LAYER, (event: any) => {
    const feature = event.features?.[0]
    if (!feature) {
      return
    }
    const vehicleId = feature.properties?.id
    const vehicle = vehicles.value.find((v) => v.id === vehicleId)
    emit('vehicle-select', vehicle || null)
  })

  map.value.on('mouseenter', VEHICLE_LAYER, () => {
    if (map.value) {
      map.value.getCanvas().style.cursor = 'pointer'
    }
  })

  map.value.on('mouseleave', VEHICLE_LAYER, () => {
    if (map.value) {
      map.value.getCanvas().style.cursor = ''
    }
  })
}

function updateVehicles() {
  if (!map.value) {
    return
  }

  const source = map.value.getSource(VEHICLE_SOURCE) as any
  if (source && typeof source.setData === 'function') {
    source.setData(buildVehicleCollection(vehicles.value))
  }
}

function updateTracks() {
  if (!map.value) {
    return
  }

  const source = map.value.getSource(TRACK_SOURCE) as any
  if (source && typeof source.setData === 'function') {
    source.setData(buildTrackCollection(tracks.value))
  }
}

function updateVehicleVisibility() {
  if (!map.value) {
    return
  }

  const visibility = props.showVehicles ? 'visible' : 'none'
  map.value.setLayoutProperty(VEHICLE_LAYER, 'visibility', visibility)
  map.value.setLayoutProperty(VEHICLE_LABEL_LAYER, 'visibility', visibility)
}

function updateTrackVisibility() {
  if (!map.value) {
    return
  }

  const visibility = props.showTracks ? 'visible' : 'none'
  map.value.setLayoutProperty(TRACK_LAYER, 'visibility', visibility)
}

function updateVehicleSelection() {
  if (!map.value) {
    return
  }

  if (selectedVehicle.value) {
    const vehicle = vehicles.value.find((v) => v.id === selectedVehicle.value)
    if (vehicle && vehicle.lastPosition) {
      map.value?.flyTo({
        center: [vehicle.lastPosition.longitude, vehicle.lastPosition.latitude],
        zoom: 15,
        speed: 1.6,
      })
    }
  }
}

function buildVehicleCollection(vehicles: Vehicle[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: vehicles
      .filter((vehicle) => vehicle.lastPosition)
      .map((vehicle) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [vehicle.lastPosition!.longitude, vehicle.lastPosition!.latitude],
        },
        properties: {
          id: vehicle.id,
          name: vehicle.name,
          isActive: vehicle.isActive,
          lastPing: vehicle.lastPing,
          speedKph: vehicle.lastPosition?.speedKph,
          headingDeg: vehicle.lastPosition?.headingDeg,
        },
      })),
  }
}

function buildTrackCollection(
  tracks: VehicleTrack[],
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: 'FeatureCollection',
    features: tracks.map((track) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: track.points.map((point) => [point.longitude, point.latitude]),
      },
      properties: {
        vehicleId: track.vehicleId,
      },
    })),
  }
}

function toggleVehicles() {
  emit('update:showVehicles', !props.showVehicles)
}

function toggleTracks() {
  emit('update:showTracks', !props.showTracks)
}

async function refreshVehicles() {
  await fetchVehicles()
  await fetchTracks()
}

defineExpose({ refreshVehicles })
</script>

<style scoped>
.vehicle-tracking-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 18rem;
  border-radius: 1rem;
  overflow: hidden;
  background: hsl(var(--b1));
  box-shadow: 0 30px 55px hsl(var(--b1) / 0.14);
}

.map-loader {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  background: linear-gradient(135deg, hsl(var(--p) / 0.12), hsl(var(--su) / 0.12));
  color: hsl(var(--bc));
  backdrop-filter: blur(6px);
}

.vehicle-controls {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.control-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: hsl(var(--p));
  color: hsl(var(--pc));
}

.btn-outline {
  background-color: transparent;
  color: hsl(var(--bc));
  border-color: hsl(var(--b3));
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--b3));
  background-color: hsl(var(--b1));
  color: hsl(var(--bc));
  font-size: 0.875rem;
}

:deep(.maplibregl-control-container) {
  pointer-events: none;
}

:deep(.maplibregl-ctrl-top-right),
:deep(.maplibregl-ctrl-bottom-left) {
  pointer-events: auto;
  padding: 0.75rem;
}
</style>
