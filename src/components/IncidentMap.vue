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
import type { StyleSpecification } from 'maplibre-gl'
import { loadMapLibre, type MapInstance, type MapLibreModule } from '@/lib/maplibre'
import type { Incident, Waypoint } from '@/types/panic.d'

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
const WAYPOINT_LABEL_LAYER = 'waypoint-labels'

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

interface MapPalette {
  accent: string
  accentStrong: string
  accentSoft: string
  background: string
  backgroundMuted: string
  emphasis: string
  text: string
  success: string
  info: string
  warning: string
}

const DEFAULT_PALETTE: MapPalette = {
  accent: '#570df8', // DaisyUI primary color
  accentStrong: '#4506cb', // Darker primary
  accentSoft: '#f0ebff', // Light primary
  background: '#ffffff', // DaisyUI base-100
  backgroundMuted: '#f8fafc', // Light gray
  emphasis: '#1f2937', // DaisyUI base-content
  text: '#1f2937', // DaisyUI base-content
  success: '#10b981', // DaisyUI success
  info: '#3b82f6', // DaisyUI info
  warning: '#f59e0b', // DaisyUI warning
}

let palette: MapPalette = DEFAULT_PALETTE

const featureCollection = computed(() => buildIncidentCollection(props.incidents))
const waypointCollection = computed(() => buildWaypointCollection(props.waypoints))

onMounted(async () => {
  if (!mapContainer.value) {
    return
  }

  palette = createMapPalette()

  try {
    maplibre = await loadMapLibre()
  } catch (error) {
    console.error('[panic] Failed to load MapLibre', error)
    return
  }

  const styleInput = import.meta.env.VITE_MAP_STYLE || FALLBACK_STYLE_URL
  const mapStyle = await resolveMapStyle(styleInput, palette)

  map.value = new maplibre.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: [28.188, -25.5],
    zoom: 6.5,
    minZoom: 3,
    maxZoom: 18,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    cooperativeGestures: true,
  })

  map.value?.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right')
  map.value?.addControl(new maplibre.FullscreenControl(), 'top-right')
  map.value?.addControl(
    new maplibre.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: false,
      showUserHeading: true,
    }),
    'top-left',
  )
  map.value?.addControl(new maplibre.ScaleControl({ maxWidth: 140, unit: 'metric' }), 'bottom-left')

  map.value?.on('load', () => {
    applyAtmosphere(map.value as MapInstance, palette)
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

function createClusterColorExpression() {
  return [
    'interpolate',
    ['linear'],
    ['get', 'point_count'],
    0,
    palette.accentSoft,
    8,
    mixHexColors(palette.accent, palette.accentSoft, 0.45, palette.accent),
    20,
    palette.accentStrong,
  ]
}

function createClusterRadiusExpression() {
  return ['interpolate', ['linear'], ['get', 'point_count'], 0, 16, 8, 22, 20, 28]
}

function createPointRadiusExpression() {
  return ['interpolate', ['linear'], ['zoom'], 4, 7, 10, 10, 16, 16]
}

function createWaypointRadiusExpression() {
  return ['interpolate', ['linear'], ['zoom'], 4, 8, 10, 10, 16, 18]
}

function createStatusColorExpression() {
  return [
    'match',
    ['get', 'status'],
    'resolved',
    palette.success,
    'acknowledged',
    palette.info,
    'open',
    palette.warning,
    palette.emphasis,
  ]
}

function createMapPalette(): MapPalette {
  if (typeof window === 'undefined') {
    return DEFAULT_PALETTE
  }

  const styles = getComputedStyle(document.documentElement)
  const readColor = (name: string, fallback: string) => {
    const value = styles.getPropertyValue(name).trim()
    if (!value) return fallback
    // Convert CSS custom properties to actual color values
    return resolveColorValue(value) ?? fallback
  }

  // Read DaisyUI CSS custom properties
  const background = readColor('--b1', DEFAULT_PALETTE.background)
  const text = readColor('--bc', DEFAULT_PALETTE.text)
  const accent = readColor('--p', DEFAULT_PALETTE.accent)
  const info = readColor('--in', DEFAULT_PALETTE.info)
  const success = readColor('--su', DEFAULT_PALETTE.success)
  const warning = readColor('--wa', DEFAULT_PALETTE.warning)
  const emphasis = readColor('--s', DEFAULT_PALETTE.emphasis)

  return {
    accent,
    accentStrong: mixHexColors(accent, text, 0.25, DEFAULT_PALETTE.accentStrong),
    accentSoft: mixHexColors(accent, background, 0.65, DEFAULT_PALETTE.accentSoft),
    background,
    backgroundMuted: mixHexColors(background, text, 0.08, DEFAULT_PALETTE.backgroundMuted),
    emphasis,
    text,
    success,
    info,
    warning,
  }
}

async function resolveMapStyle(
  styleInput: string | StyleSpecification,
  theme: MapPalette,
): Promise<string | StyleSpecification> {
  if (typeof window === 'undefined') {
    return styleInput
  }

  // If it's already an object, return it
  if (typeof styleInput === 'object') {
    return styleInput
  }

  const shouldFetch =
    styleInput.startsWith('http://') ||
    styleInput.startsWith('https://') ||
    styleInput.startsWith('/')

  if (!shouldFetch) {
    return styleInput
  }

  try {
    const resolvedUrl = styleInput.startsWith('http')
      ? styleInput
      : new URL(styleInput, window.location.origin).toString()
    const response = await fetch(resolvedUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch style: ${response.status}`)
    }
    const baseStyle = (await response.json()) as StyleSpecification
    return enhanceBaseStyle(baseStyle, theme)
  } catch (error) {
    console.warn('[panic] Unable to fetch enhanced map style, using fallback', error)
    return FALLBACK_STYLE_URL
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function enhanceBaseStyle(style: StyleSpecification, theme: MapPalette): StyleSpecification {
  const cloned = JSON.parse(JSON.stringify(style)) as StyleSpecification
  cloned.transition = { duration: 300, delay: 0 }
  cloned.metadata = { ...(cloned.metadata ?? {}), 'naboomneighbornet:enhanced': true }

  // Ensure glyphs are available for text rendering
  if (!cloned.glyphs) {
    cloned.glyphs = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
  }

  if (Array.isArray(cloned.layers)) {
    cloned.layers = cloned.layers.map((layer) => {
      if (!layer) {
        return layer
      }

      const nextLayer = { ...layer } as any
      if (layer.paint) {
        nextLayer.paint = { ...layer.paint } as any
      }
      if (layer.layout) {
        nextLayer.layout = { ...layer.layout } as any
      }

      const layerId = (layer.id ?? '').toLowerCase()

      if (layer.type === 'background') {
        nextLayer.paint = nextLayer.paint || {}
        ;(nextLayer.paint as any)['background-color'] = theme.background
      }

      if (layer.type === 'fill' && layerId.includes('water')) {
        nextLayer.paint = nextLayer.paint || {}
        ;(nextLayer.paint as any)['fill-color'] = mixHexColors(
          theme.accentSoft,
          theme.background,
          0.2,
          theme.accentSoft,
        )
        ;(nextLayer.paint as any)['fill-opacity'] = 0.9
      }

      if (layer.type === 'fill' && (layerId.includes('landcover') || layerId.includes('park'))) {
        nextLayer.paint = nextLayer.paint || {}
        ;(nextLayer.paint as any)['fill-color'] = mixHexColors(
          theme.success,
          theme.background,
          0.7,
          theme.success,
        )
        ;(nextLayer.paint as any)['fill-opacity'] = 0.2
      }

      if (layer.type === 'fill' && layerId.includes('building')) {
        nextLayer.paint = nextLayer.paint || {}
        ;(nextLayer.paint as any)['fill-color'] = mixHexColors(
          theme.accentSoft,
          theme.backgroundMuted,
          0.4,
          theme.accentSoft,
        )
        ;(nextLayer.paint as any)['fill-opacity'] = 0.6
      }

      if (
        layer.type === 'line' &&
        (layerId.includes('road') ||
          layerId.includes('street') ||
          layerId.includes('highway') ||
          layerId.includes('bridge') ||
          layerId.includes('tunnel'))
      ) {
        nextLayer.paint = nextLayer.paint || {}
        ;(nextLayer.paint as any)['line-color'] = mixHexColors(
          theme.backgroundMuted,
          theme.accentSoft,
          0.35,
          theme.backgroundMuted,
        )
        ;(nextLayer.paint as any)['line-width'] = [
          'interpolate',
          ['linear'],
          ['zoom'],
          5,
          0.3,
          12,
          1.6,
          16,
          3.2,
        ]
        nextLayer.layout = nextLayer.layout || {}
        ;(nextLayer.layout as any)['line-cap'] = 'round'
        ;(nextLayer.layout as any)['line-join'] = 'round'
      }

      const hasTextField = Boolean(nextLayer.layout && 'text-field' in nextLayer.layout)
      if (layer.type === 'symbol' && hasTextField) {
        nextLayer.paint = nextLayer.paint || {}
        ;(nextLayer.paint as any)['text-color'] = theme.text
        ;(nextLayer.paint as any)['text-halo-color'] = colorWithOpacity(theme.background, 0.95)
        ;(nextLayer.paint as any)['text-halo-width'] = 1.2
        ;(nextLayer.paint as any)['text-halo-blur'] = 0.4

        nextLayer.layout = nextLayer.layout || {}
        ;(nextLayer.layout as any)['text-font'] = ['Arial Unicode MS Bold', 'Arial', 'sans-serif']
        ;(nextLayer.layout as any)['text-letter-spacing'] = [
          'interpolate',
          ['linear'],
          ['zoom'],
          10,
          0.02,
          14,
          0.05,
        ]
      }

      return nextLayer
    })
  }

  return cloned
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function applyAtmosphere(instance: MapInstance, theme: MapPalette) {
  if (typeof instance.setLight === 'function') {
    instance.setLight({
      anchor: 'viewport',
      color: mixHexColors(theme.backgroundMuted, theme.accentSoft, 0.25, theme.backgroundMuted),
      intensity: 0.45,
    })
  }

  if (typeof instance.setFog === 'function') {
    // Get additional colors from CSS custom properties
    const styles = getComputedStyle(document.documentElement)
    const b3Color = resolveColorValue(styles.getPropertyValue('--b3').trim()) ?? theme.background
    const pColor = resolveColorValue(styles.getPropertyValue('--p').trim()) ?? theme.accent
    const b1Color = resolveColorValue(styles.getPropertyValue('--b1').trim()) ?? theme.background
    instance.setFog({
      range: [0.5, 8],
      color: mixHexColors(theme.background, colorWithOpacity(pColor, 0.1), 0.15, theme.background),
      'high-color': mixHexColors(theme.accentSoft, b1Color, 0.35, theme.accentSoft),
      'space-color': b3Color,
      'horizon-blend': 0.08,
    })
  }
}

function coerceHex(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  // Handle hex colors
  if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  }

  if (/^#?[0-9a-fA-F]{3}$/.test(trimmed)) {
    const hex = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed
    return `#${hex
      .split('')
      .map((char) => char.repeat(2))
      .join('')}`
  }

  return null
}

function resolveColorValue(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  // Handle hex colors
  const hex = coerceHex(trimmed)
  if (hex) {
    return hex
  }

  // Handle CSS custom properties like "hsl(var(--p))"
  if (trimmed.includes('hsl(var(')) {
    // Extract the CSS variable name
    const match = trimmed.match(/hsl\(var\(--([^)]+)\)\)/)
    if (match) {
      const varName = match[1]
      const styles = getComputedStyle(document.documentElement)
      const cssValue = styles.getPropertyValue(`--${varName}`).trim()
      if (cssValue) {
        // Convert HSL to hex
        return hslToHex(cssValue)
      }
    }
  }

  // Handle direct HSL values
  if (trimmed.startsWith('hsl(')) {
    return hslToHex(trimmed)
  }

  // Handle RGB values
  if (trimmed.startsWith('rgb(')) {
    return rgbToHex(trimmed)
  }

  return null
}

function hslToHex(hsl: string): string | null {
  // Parse HSL string like "210 100% 50%" or "210, 100%, 50%"
  const match = hsl.match(
    /hsl\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*[,\s]\s*(\d+(?:\.\d+)?)%\s*\)/,
  )
  if (!match) {
    return null
  }

  const h = parseFloat(match[1]!) / 360
  const s = parseFloat(match[2]!) / 100
  const l = parseFloat(match[3]!) / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) {
    return null
  }

  const r = parseInt(match[1]!, 10)
  const g = parseInt(match[2]!, 10)
  const b = parseInt(match[3]!, 10)

  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixHexColors(colorA: string, colorB: string, ratio: number, fallback?: string): string {
  const rgbA = hexToRgb(colorA)
  const rgbB = hexToRgb(colorB)

  if (!rgbA || !rgbB) {
    return fallback ?? colorA
  }

  const clampRatio = Math.min(Math.max(ratio, 0), 1)
  const [rA, gA, bA] = rgbA
  const [rB, gB, bB] = rgbB

  const mixChannel = (a: number, b: number) => Math.round(a * (1 - clampRatio) + b * clampRatio)

  return `#${[mixChannel(rA, rB), mixChannel(gA, gB), mixChannel(bA, bB)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`
}

function colorWithOpacity(color: string, alpha: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    return color
  }
  const normalizedAlpha = Math.min(Math.max(alpha, 0), 1)
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${normalizedAlpha})`
}

function hexToRgb(color: string): [number, number, number] | null {
  const normalized = coerceHex(color)
  if (!normalized) {
    return null
  }

  const hex = normalized.slice(1)
  if (hex.length !== 6) {
    return null
  }

  const value = Number.parseInt(hex, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
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
        'circle-color': createClusterColorExpression(),
        'circle-radius': createClusterRadiusExpression(),
        'circle-opacity': 0.88,
        'circle-stroke-color': palette.background,
        'circle-stroke-width': 2,
        'circle-blur': 0.12,
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
        'text-font': ['Arial Unicode MS Bold', 'Arial', 'sans-serif'],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': palette.text,
        'text-halo-color': palette.background,
        'text-halo-width': 1.2,
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
        'circle-radius': createPointRadiusExpression(),
        'circle-stroke-width': 2,
        'circle-stroke-color': palette.background,
        'circle-color': createStatusColorExpression(),
        'circle-opacity': 0.95,
        'circle-blur': 0.05,
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
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 16, 10, 22, 16, 28],
        'circle-color': colorWithOpacity(palette.warning, 0.18),
        'circle-opacity': 1,
        'circle-stroke-color': palette.warning,
        'circle-stroke-width': 2,
        'circle-blur': 0.25,
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
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 22, 10, 30, 16, 38],
        'circle-color': colorWithOpacity(palette.accent, 0.18),
        'circle-opacity': 1,
        'circle-stroke-color': palette.accentStrong,
        'circle-stroke-width': 1.2,
        'circle-blur': 0.4,
      },
    })
  }

  if (!map.value.getLayer(WAYPOINT_LAYER)) {
    map.value.addLayer({
      id: WAYPOINT_LAYER,
      type: 'circle',
      source: WAYPOINT_SOURCE,
      paint: {
        'circle-radius': createWaypointRadiusExpression(),
        'circle-color': colorWithOpacity(palette.info, 0.25),
        'circle-opacity': 0.9,
        'circle-stroke-color': palette.info,
        'circle-stroke-width': 2,
        'circle-blur': 0.15,
      },
    })
  }

  if (!map.value.getLayer(WAYPOINT_LABEL_LAYER)) {
    map.value.addLayer({
      id: WAYPOINT_LABEL_LAYER,
      type: 'symbol',
      source: WAYPOINT_SOURCE,
      layout: {
        'text-field': ['coalesce', ['get', 'name'], ''],
        'text-font': ['Arial Unicode MS Bold', 'Arial', 'sans-serif'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 16, 14],
        'text-offset': [0, 1.3],
        'text-anchor': 'top',
        'text-max-width': 10,
        'text-optional': true,
      },
      paint: {
        'text-color': palette.text,
        'text-halo-color': colorWithOpacity(palette.background, 0.9),
        'text-halo-width': 1.1,
        'text-halo-blur': 0.4,
      },
    })
  }
}

function bindInteractions() {
  if (!map.value) {
    return
  }

  map.value.on('click', CLUSTER_LAYER, (event: maplibregl.MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature) {
      return
    }

    const clusterId = feature.properties?.cluster_id
    const coordinates = (feature.geometry as GeoJSON.Point)?.coordinates
    const source = map.value!.getSource(INCIDENT_SOURCE) as maplibregl.GeoJSONSource
    if (source?.getClusterExpansionZoom && clusterId != null) {
      source
        .getClusterExpansionZoom(clusterId)
        .then((zoom: number) => {
          map.value?.easeTo({ center: coordinates, zoom })
        })
        .catch((error: unknown) => {
          console.warn('Failed to get cluster expansion zoom:', error)
        })
    }
  })

  map.value.on('click', POINT_LAYER, (event: maplibregl.MapLayerMouseEvent) => {
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

  const source = map.value.getSource(INCIDENT_SOURCE) as maplibregl.GeoJSONSource
  if (source && typeof source.setData === 'function') {
    source.setData(featureCollection.value)
  }
}

function updateWaypoints() {
  if (!map.value) {
    return
  }

  const source = map.value.getSource(WAYPOINT_SOURCE) as maplibregl.GeoJSONSource
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
  min-height: 18rem;
  border-radius: 1rem;
  overflow: hidden;
  background:
    radial-gradient(140% 140% at 85% 15%, hsl(var(--p) / 0.08), transparent),
    radial-gradient(120% 120% at 15% 90%, hsl(var(--in) / 0.08), transparent), hsl(var(--b1));
  box-shadow: 0 30px 55px hsl(var(--b1) / 0.14);
  transition:
    box-shadow 200ms ease,
    transform 200ms ease;
}

.incident-map:hover {
  box-shadow: 0 38px 72px hsl(var(--b1) / 0.18);
  transform: translateY(-2px);
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

:deep(.maplibregl-control-container) {
  pointer-events: none;
}

:deep(.maplibregl-ctrl-top-right),
:deep(.maplibregl-ctrl-top-left),
:deep(.maplibregl-ctrl-bottom-left) {
  pointer-events: auto;
  padding: 0.75rem;
}

:deep(.maplibregl-ctrl-group) {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 12px 32px hsl(var(--b1) / 0.18);
  background: hsl(var(--b1) / 0.9);
  backdrop-filter: blur(8px);
}

:deep(.maplibregl-ctrl-group button) {
  width: 2.4rem;
  height: 2.4rem;
  border: none;
  color: hsl(var(--bc));
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

:deep(.maplibregl-ctrl-group button:hover),
:deep(.maplibregl-ctrl-group button:focus-visible) {
  background: hsl(var(--p) / 0.12);
  color: hsl(var(--p));
}

:deep(.maplibregl-ctrl-scale) {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Arial,
    sans-serif;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  background: hsl(var(--b3) / 0.7);
  color: hsl(var(--b1));
  border: none;
  box-shadow: 0 10px 30px hsl(var(--b3) / 0.25);
}

:deep(.maplibregl-user-location-dot),
:deep(.maplibregl-user-location-accuracy-circle) {
  transition: transform 200ms ease;
}

@media (max-width: 960px) {
  .incident-map {
    border-radius: 0.85rem;
    min-height: 16rem;
  }
}

@media (max-width: 600px) {
  .incident-map {
    border-radius: 0.75rem;
    min-height: 14rem;
  }

  :deep(.maplibregl-ctrl-group) {
    box-shadow: 0 10px 24px hsl(var(--b1) / 0.16);
  }
}
</style>
