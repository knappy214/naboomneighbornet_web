export interface MapLibreModule {
  Map: new (options: MapOptions) => MapInstance
  NavigationControl: new (options?: NavigationOptions) => NavigationControlInstance
  LngLatBounds: new (sw: [number, number], ne?: [number, number]) => MapBounds
}

export interface NavigationControlInstance {
  onAdd: (map: MapInstance) => HTMLElement
  onRemove: () => void
}

export interface MapBounds {
  getSouthWest: () => { lng: number; lat: number }
  getNorthEast: () => { lng: number; lat: number }
  toArray: () => [[number, number], [number, number]]
}

export interface MapInstance {
  on: (event: string, layerId: string | ((event: any) => void), listener?: (event: any) => void) => void
  off: (event: string, listener: (event: any) => void) => void
  addControl: (control: any, position?: string) => void
  addSource: (id: string, source: any) => void
  getSource: (id: string) => any
  addLayer: (layer: any, beforeId?: string) => void
  setFilter: (layerId: string, filter: any) => void
  setPaintProperty: (layerId: string, name: string, value: any) => void
  getLayer: (layerId: string) => any
  flyTo: (options: any) => void
  easeTo: (options: any) => void
  fitBounds: (bounds: any, options?: any) => void
  getBounds: () => MapBounds
  project: (lngLat: [number, number]) => { x: number; y: number }
  resize: () => void
  remove: () => void
}

export interface MapOptions {
  container: HTMLElement | string
  style: string
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  attributionControl?: boolean
}

export interface NavigationOptions {
  showCompass?: boolean
  showZoom?: boolean
  visualizePitch?: boolean
}

declare global {
  interface Window {
    maplibregl?: MapLibreModule
  }
}

const MAPLIBRE_VERSION = '3.6.2'
const SCRIPT_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`
const STYLE_URL = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`

let loader: Promise<MapLibreModule> | null = null

function injectScript(): Promise<MapLibreModule> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MapLibre can only be used in a browser environment'))
  }

  if (window.maplibregl) {
    return Promise.resolve(window.maplibregl)
  }

  if (loader) {
    return loader
  }

  injectStyle()

  loader = new Promise<MapLibreModule>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (window.maplibregl) {
        resolve(window.maplibregl)
      } else {
        reject(new Error('Failed to initialize MapLibre'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load MapLibre script'))
    document.head.appendChild(script)
  })

  return loader
}

function injectStyle(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (document.querySelector('link[data-maplibre-style="true"]')) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = STYLE_URL
  link.setAttribute('data-maplibre-style', 'true')
  document.head.appendChild(link)
}

export async function loadMapLibre(): Promise<MapLibreModule> {
  return injectScript()
}
