import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Re-export the module
export const MapLibreModule = maplibregl

// Simplified interfaces for better TypeScript compatibility
export interface MapLibreModule {
  Map: new (options: any) => any
  NavigationControl: new (options?: any) => any
  FullscreenControl: new (options?: any) => any
  GeolocateControl: new (options?: any) => any
  ScaleControl: new (options?: any) => any
  LngLatBounds: new (sw: [number, number], ne?: [number, number]) => any
}

export interface NavigationControlInstance {
  onAdd: (map: any) => HTMLElement
  onRemove: () => void
}

export interface MapBounds {
  getSouthWest: () => { lng: number; lat: number }
  getNorthEast: () => { lng: number; lat: number }
  toArray: () => [[number, number], [number, number]]
}

export interface MapInstance {
  on: (
    event: string,
    layerId: string | ((event: any) => void),
    listener?: (event: any) => void,
  ) => void
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
  getCanvas: () => HTMLCanvasElement
  setFog: (fog: any) => void
  setLight: (light: any) => void
}

export interface MapOptions {
  container: HTMLElement | string
  style: string | StyleSpecification
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  attributionControl?: boolean
  pitch?: number
  pitchWithRotate?: boolean
  dragRotate?: boolean
  touchPitch?: boolean
  cooperativeGestures?: boolean | Record<string, unknown>
}

export interface NavigationOptions {
  showCompass?: boolean
  showZoom?: boolean
  visualizePitch?: boolean
}

export async function loadMapLibre(): Promise<MapLibreModule> {
  // Return the already imported module
  return maplibregl as any
}
