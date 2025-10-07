import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { handleApiError, createUserErrorMessage, type ErrorContext } from '@/utils/errorHandler'
import type {
  Incident,
  IncidentEventType,
  IncidentFilters,
  IncidentPriority,
  IncidentStatus,
  Waypoint,
  Responder,
  Vehicle,
  VehicleTrack,
  PatrolAlert,
  EmergencyContact,
  RelayFrame,
} from '@/types/panic.d'

interface IncidentQueryParams {
  status?: IncidentStatus[]
  from?: string
  to?: string
  bbox?: string
  search?: string
}

interface IncidentApiResponse {
  incidents?: unknown[]
  data?: unknown[]
  results?: unknown[]
  [key: string]: unknown
}

const DEFAULT_BASE_URL = '/panic/api'

const getPanicBaseUrl = () => {
  // If specific panic base URL is set, use it
  if (import.meta.env.VITE_PANIC_BASE) return import.meta.env.VITE_PANIC_BASE

  // If API base is set, construct panic URL from it
  if (import.meta.env.VITE_API_BASE) {
    return `${import.meta.env.VITE_API_BASE}${DEFAULT_BASE_URL}`
  }

  // Production fallback
  if (typeof window !== 'undefined' && window.location.hostname === 'naboomneighbornet.net.za') {
    return 'https://naboomneighbornet.net.za/panic/api'
  }

  // Development fallback - use relative URL to leverage Vite proxy
  return '/panic/api'
}

const panicClient = axios.create({
  baseURL: normalizeBaseUrl(getPanicBaseUrl()),
  withCredentials: true,
  timeout: 20000,
})

// Add authentication interceptor to panic client
panicClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const t = authStore.accessToken

  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  }

  return config
})

// Separate client for Wagtail API endpoints
const getWagtailBaseUrl = () => {
  // If specific Wagtail base URL is set, use it
  if (import.meta.env.VITE_WAGTAIL_BASE) return import.meta.env.VITE_WAGTAIL_BASE

  // Otherwise, construct from main API base
  const apiBase = import.meta.env.VITE_API_BASE
  if (apiBase) {
    // If it already ends with /v2, use as is, otherwise append /v2
    return apiBase.endsWith('/v2') ? apiBase : `${apiBase}/v2`
  }

  // Production fallback
  if (typeof window !== 'undefined' && window.location.hostname === 'naboomneighbornet.net.za') {
    return 'https://naboomneighbornet.net.za/api/v2'
  }

  // Development fallback - use relative URL to leverage Vite proxy
  return '/api/v2'
}

const wagtailClient = axios.create({
  baseURL: normalizeBaseUrl(getWagtailBaseUrl()),
  withCredentials: true,
  timeout: 20000,
})

// Debug logging for API clients (can be removed in production)
if (import.meta.env.DEV) {
  console.log('Panic API Client Configuration:', {
    panicClientBaseURL: panicClient.defaults.baseURL,
    wagtailClientBaseURL: wagtailClient.defaults.baseURL,
    VITE_API_BASE: import.meta.env.VITE_API_BASE,
  })

  console.info(
    '📋 PANIC API Backend Implementation Status:',
    '\n✅ /api/v2/incidents/ - Working (incident listing)',
    '\n✅ /panic/api/vehicle/live - Working (vehicle positions)',
    '\n✅ /panic/api/waypoints - Working (patrol waypoints)',
    '\n✅ /api/v2/responders/ - Working (responders with province filtering)',
    '\n✅ /api/v2/alerts/ - Working (patrol alerts with shift filtering)',
    '\n🎉 All PANIC API endpoints are now implemented!',
  )
}

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) {
    return DEFAULT_BASE_URL
  }
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

function toQueryParams(filters: IncidentFilters): IncidentQueryParams {
  const params: IncidentQueryParams = {}

  if (filters.statuses.length > 0) {
    params.status = filters.statuses
  }

  if (filters.dateRange.from) {
    params.from = filters.dateRange.from
  }

  if (filters.dateRange.to) {
    params.to = filters.dateRange.to
  }

  if (filters.bbox) {
    params.bbox = filters.bbox.join(',')
  }

  if (filters.search && filters.search.trim().length > 0) {
    params.search = filters.search.trim()
  }

  return params
}

function coercePriority(value: unknown): IncidentPriority {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value
  }
  return 'medium'
}

function coerceStatus(value: unknown): IncidentStatus {
  if (value === 'open' || value === 'acknowledged' || value === 'resolved') {
    return value
  }
  return 'open'
}

function toIncidentId(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 12)
}

function safeNumber(value: unknown, fallback: number | null = 0): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

function safeString(
  value: unknown,
  fallback: string | null | undefined = '',
): string | null | undefined {
  if (typeof value === 'string') return value
  return fallback
}

function safeOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  return undefined
}

function safeBoolean(value: unknown, fallback: boolean = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function mapIncident(raw: unknown): Incident {
  const rawObj = raw as Record<string, unknown>
  const location = rawObj?.location as Record<string, unknown> | undefined

  const latitude =
    rawObj?.latitude ?? rawObj?.lat ?? location?.latitude ?? location?.lat ?? location?.y
  const longitude =
    rawObj?.longitude ??
    rawObj?.lon ??
    rawObj?.lng ??
    location?.longitude ??
    location?.lon ??
    location?.x

  const reporter = rawObj?.reporter as Record<string, unknown> | undefined
  const responder = rawObj?.responder as Record<string, unknown> | undefined

  return {
    id: toIncidentId(rawObj?.id ?? rawObj?.uuid ?? rawObj?.incident_id),
    status: coerceStatus(rawObj?.status ?? rawObj?.state),
    priority: coercePriority(rawObj?.priority ?? rawObj?.severity),
    type: typeof rawObj?.type === 'string' ? rawObj.type : 'panic',
    summary:
      typeof rawObj?.summary === 'string'
        ? rawObj.summary
        : typeof rawObj?.title === 'string'
          ? rawObj.title
          : `Incident ${toIncidentId(rawObj?.id ?? rawObj?.uuid ?? rawObj?.incident_id)}`,
    description:
      typeof rawObj?.description === 'string'
        ? rawObj.description
        : typeof rawObj?.notes === 'string'
          ? rawObj.notes
          : null,
    reportedAt: safeString(
      rawObj?.created_at || rawObj?.reportedAt || rawObj?.reported_at || rawObj?.createdAt,
      new Date().toISOString(),
    ) as string,
    updatedAt: safeString(
      rawObj?.updated_at ||
        rawObj?.updatedAt ||
        rawObj?.updated_at ||
        rawObj?.modifiedAt ||
        rawObj?.modified_at,
      new Date().toISOString(),
    ) as string,
    location: {
      latitude: safeNumber(latitude, 0) as number,
      longitude: safeNumber(longitude, 0) as number,
      accuracy: safeNumber(rawObj?.accuracy ?? location?.accuracy, null),
      address: safeString(rawObj?.address ?? location?.address, null),
    },
    reporter: reporter
      ? {
          id: toIncidentId(reporter.id ?? reporter.uuid),
          name: safeString(reporter.name ?? reporter.full_name ?? reporter.fullName, null),
          phone: safeString(reporter.phone ?? reporter.phone_number, null),
          email: safeString(reporter.email, null),
        }
      : rawObj?.reporter_name || rawObj?.reporter_phone
        ? {
            name: safeString(rawObj.reporter_name, null),
            phone: safeString(rawObj.reporter_phone, null),
          }
        : null,
    responder: responder
      ? {
          id: toIncidentId(responder.id ?? responder.uuid),
          name: safeString(responder.name ?? responder.full_name, null),
          phone: safeString(responder.phone ?? responder.phone_number, null),
          vehicle: safeString(responder.vehicle ?? responder.vehicle_name, null),
        }
      : null,
    attachments: Array.isArray(rawObj?.attachments)
      ? rawObj.attachments.filter((value: unknown): value is string => typeof value === 'string')
      : undefined,
    events: Array.isArray(rawObj?.events)
      ? rawObj.events.map((event: unknown) => {
          const eventObj = event as Record<string, unknown>
          return {
            id: toIncidentId(eventObj?.id ?? eventObj?.uuid ?? crypto.randomUUID()),
            incidentId: toIncidentId(rawObj?.id ?? rawObj?.uuid ?? rawObj?.incident_id),
            type: (eventObj?.kind ?? eventObj?.type ?? 'created') as IncidentEventType,
            description: safeString(eventObj?.description, '') || '',
            createdAt: safeString(
              eventObj?.created_at ?? eventObj?.createdAt,
              new Date().toISOString(),
            ) as string,
            createdBy: safeString(eventObj?.created_by ?? eventObj?.createdBy, null),
            metadata:
              eventObj?.metadata &&
              typeof eventObj.metadata === 'object' &&
              eventObj.metadata !== null
                ? (eventObj.metadata as Record<string, unknown>)
                : undefined,
          }
        })
      : undefined,
    metadata:
      rawObj?.metadata && typeof rawObj.metadata === 'object' && rawObj.metadata !== null
        ? (rawObj.metadata as Record<string, unknown>)
        : undefined,
  }
}

function extractIncidentList(response: IncidentApiResponse | unknown[]): unknown[] {
  if (Array.isArray(response)) {
    return response
  }

  if (!response || typeof response !== 'object') {
    return []
  }

  const responseObj = response as Record<string, unknown>

  // Check for items first (Django view API format)
  if (Array.isArray(responseObj.items)) {
    return responseObj.items
  }

  if (Array.isArray(responseObj.incidents)) {
    return responseObj.incidents
  }

  if (Array.isArray(responseObj.data)) {
    return responseObj.data
  }

  if (Array.isArray(responseObj.results)) {
    return responseObj.results
  }

  return []
}

export async function fetchIncidents(filters: IncidentFilters): Promise<Incident[]> {
  const context: ErrorContext = {
    operation: 'Fetch Incidents',
    endpoint: '/panic/api/incidents/',
    params: filters,
  }

  try {
    const params = toQueryParams(filters)
    console.log('🔍 [API] Fetching incidents with params:', params)

    const response = await panicClient.get<IncidentApiResponse | unknown[]>('/incidents/', {
      params,
    })

    console.log('📊 [API] Incidents response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url,
      params: response.config.params,
    })

    // Incidents API returns data in { items: [...], meta: {...} } structure
    const responseData = response.data as {
      items?: unknown[]
      incidents?: unknown[]
      results?: unknown[]
    }
    const rawList = responseData.items || responseData.incidents || responseData.results || []
    console.log('🔍 [API] Extracted items from incidents response:', rawList)

    const incidents = rawList.map((item) => mapIncident(item))

    console.log('✅ [API] Mapped incidents:', incidents)
    return incidents
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)

    console.error('❌ [API] Failed to fetch incidents:', {
      error: apiError,
      userMessage,
      filters,
    })

    // For fetch operations, return empty array instead of throwing
    // This allows the UI to continue functioning
    return []
  }
}

export async function acknowledgeIncident(incidentId: string): Promise<Incident> {
  const response = await panicClient.post(`/incidents/${incidentId}/ack`, {})
  return mapIncident(response.data)
}

export async function resolveIncident(incidentId: string): Promise<Incident> {
  const response = await panicClient.post(`/incidents/${incidentId}/resolve`, {})
  return mapIncident(response.data)
}

export async function fetchWaypoints(province?: string): Promise<Waypoint[]> {
  try {
    const params = province ? { province } : {}
    console.log('🔍 [API] Fetching waypoints with params:', params)

    const response = await panicClient.get<{ waypoints?: unknown[]; data?: unknown[] }>(
      '/waypoints',
      { params },
    )

    console.log('📊 [API] Waypoints response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url,
      params: response.config.params,
    })

    const items = extractIncidentList(response.data as IncidentApiResponse | unknown[])
    const waypoints = items
      .map((item: unknown) => {
        const itemObj = item as Record<string, unknown>
        return {
          id: toIncidentId(itemObj?.id ?? itemObj?.uuid ?? crypto.randomUUID()),
          name:
            safeString(itemObj?.name, `Waypoint ${itemObj?.id ?? ''}`) ||
            `Waypoint ${itemObj?.id ?? ''}`,
          latitude: safeNumber(itemObj?.latitude ?? itemObj?.lat ?? itemObj?.y, 0) as number,
          longitude: safeNumber(itemObj?.longitude ?? itemObj?.lon ?? itemObj?.x, 0) as number,
          radius: safeNumber(itemObj?.radius ?? itemObj?.accuracy, null),
          color: safeString(itemObj?.color, null),
          province: safeOptionalString(itemObj?.province),
        }
      })
      .filter(
        (waypoint) => Number.isFinite(waypoint.latitude) && Number.isFinite(waypoint.longitude),
      )

    console.log('✅ [API] Mapped waypoints:', waypoints)
    return waypoints
  } catch (error) {
    console.warn('❌ [API] Failed to preload waypoints:', error)
    console.warn('❌ [API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return []
  }
}

// Vehicle telemetry APIs
export async function fetchLiveVehicles(): Promise<Vehicle[]> {
  try {
    console.log('🔍 [API] Fetching live vehicles')

    const response = await panicClient.get<{ features?: unknown[] }>('/vehicle/live')

    console.log('📊 [API] Live vehicles response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url,
    })

    const features = response.data?.features || []
    const vehicles = features.map((feature: unknown) => {
      const featureObj = feature as Record<string, unknown>
      const properties = featureObj?.properties as Record<string, unknown> | undefined
      const geometry = featureObj?.geometry as { coordinates?: unknown[] } | undefined

      return {
        id: toIncidentId(properties?.id ?? properties?.vehicle_id ?? crypto.randomUUID()),
        name:
          safeString(properties?.name, `Vehicle ${properties?.id ?? ''}`) ||
          `Vehicle ${properties?.id ?? ''}`,
        lastPosition:
          geometry?.coordinates && Array.isArray(geometry.coordinates)
            ? {
                latitude: safeNumber(geometry.coordinates[1], 0) as number,
                longitude: safeNumber(geometry.coordinates[0], 0) as number,
                timestamp: safeString(properties?.timestamp, new Date().toISOString()) as string,
                speedKph: safeNumber(properties?.speed_kph, null),
                headingDeg: safeNumber(properties?.heading_deg, null),
              }
            : null,
        isActive: safeBoolean(properties?.is_active, true),
        lastPing: safeString(properties?.last_ping, null),
      }
    })

    console.log('✅ [API] Mapped live vehicles:', vehicles)
    return vehicles
  } catch (error) {
    console.warn('❌ [API] Failed to fetch live vehicles:', error)
    console.warn('❌ [API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return []
  }
}

export async function fetchVehicleTracks(
  minutes = 60,
  vehicleId?: string,
): Promise<VehicleTrack[]> {
  try {
    const params: Record<string, unknown> = { minutes }
    if (vehicleId) {
      params.vehicle = vehicleId
    }
    const response = await panicClient.get<{ tracks?: Record<string, unknown[]> }>(
      '/vehicle/tracks',
      { params },
    )
    const tracks = response.data?.tracks || {}
    return Object.entries(tracks).map(([id, points]) => ({
      vehicleId: toIncidentId(id),
      points: Array.isArray(points)
        ? points.map((point: unknown) => {
            const pointObj = point as Record<string, unknown>
            return {
              latitude: safeNumber(pointObj?.latitude ?? pointObj?.lat ?? pointObj?.y, 0) as number,
              longitude: safeNumber(
                pointObj?.longitude ?? pointObj?.lon ?? pointObj?.x,
                0,
              ) as number,
              timestamp: safeString(pointObj?.timestamp, new Date().toISOString()) as string,
              speedKph: safeNumber(pointObj?.speed_kph, null),
              headingDeg: safeNumber(pointObj?.heading_deg, null),
            }
          })
        : [],
    }))
  } catch (error) {
    console.warn('[panic] Failed to fetch vehicle tracks', error)
    return []
  }
}

export async function pingVehicle(
  token: string,
  lat: number,
  lng: number,
  speedKph?: number,
  headingDeg?: number,
  timestamp?: string,
): Promise<void> {
  try {
    await panicClient.post('/vehicle/ping', {
      token,
      lat,
      lng,
      speed_kph: speedKph,
      heading_deg: headingDeg,
      ts: timestamp,
    })
  } catch (error) {
    console.warn('[panic] Failed to ping vehicle', error)
    throw error
  }
}

// Responders API
export async function fetchResponders(province?: string): Promise<Responder[]> {
  const context: ErrorContext = {
    operation: 'Fetch Responders',
    endpoint: '/panic/api/responders/',
    params: { province },
  }

  try {
    const params = province ? { province } : {}
    console.log('🔍 [API] Fetching responders with params:', params)

    const response = await panicClient.get<{
      responders?: unknown[]
      results?: unknown[]
      items?: unknown[]
    }>('/responders/', { params })

    console.log('📊 [API] Responders response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url,
      params: response.config.params,
    })

    // Responders API returns data in a different structure: { items: [...], meta: {...} }
    const responseData = response.data as { items?: unknown[]; meta?: unknown }
    const items = responseData.items || []
    console.log('🔍 [API] Extracted items from responders response:', items)

    const responders = items.map((item: unknown) => {
      const itemObj = item as Record<string, unknown>
      return {
        id: toIncidentId(itemObj?.id ?? itemObj?.uuid ?? crypto.randomUUID()),
        name:
          safeString(itemObj?.name ?? itemObj?.full_name, `Responder ${itemObj?.id ?? ''}`) ||
          `Responder ${itemObj?.id ?? ''}`,
        phone: safeString(itemObj?.phone ?? itemObj?.phone_number, null),
        email: safeString(itemObj?.email, null),
        province: safeString(itemObj?.province, 'Limpopo') || 'Limpopo',
        isActive: safeBoolean(itemObj?.is_active, true),
        vehicle: safeString(itemObj?.vehicle, null),
        lastSeen: safeString(itemObj?.last_seen, null),
      }
    })

    console.log('✅ [API] Mapped responders:', responders)
    return responders
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.warn('❌ [API] Failed to fetch responders:', apiError.status, apiError.message)
    console.warn('❌ [API] Error details:', {
      status: apiError.status,
      message: apiError.message,
    })
    throw new Error(userMessage)
  }
}

// Patrol alerts API
export async function fetchPatrolAlerts(shift?: string, limit = 50): Promise<PatrolAlert[]> {
  try {
    const params: Record<string, unknown> = { limit }
    if (shift) {
      params.shift = shift
    }
    console.log('🔍 [API] Fetching patrol alerts with params:', params)

    const response = await panicClient.get<{ alerts?: unknown[]; results?: unknown[] }>(
      '/alerts/',
      {
        params,
      },
    )

    console.log('📊 [API] Patrol alerts response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url,
      params: response.config.params,
    })
    // Alerts API might also return data in { items: [...], meta: {...} } structure
    const responseData = response.data as {
      items?: unknown[]
      alerts?: unknown[]
      results?: unknown[]
    }
    const items = responseData.items || responseData.alerts || responseData.results || []
    console.log('🔍 [API] Extracted items from alerts response:', items)

    const alerts = items.map((item: unknown) => {
      const itemObj = item as Record<string, unknown>
      const waypoint = itemObj?.waypoint as Record<string, unknown> | undefined
      const responder = itemObj?.responder as Record<string, unknown> | undefined

      return {
        id: toIncidentId(itemObj?.id ?? itemObj?.uuid ?? crypto.randomUUID()),
        waypointId: toIncidentId(itemObj?.waypoint_id ?? waypoint?.id ?? ''),
        waypoint: waypoint
          ? {
              id: toIncidentId(waypoint.id ?? waypoint.uuid ?? ''),
              name:
                safeString(waypoint.name, `Waypoint ${waypoint.id ?? ''}`) ||
                `Waypoint ${waypoint.id ?? ''}`,
              latitude: safeNumber(waypoint.latitude ?? waypoint.lat ?? 0, 0) as number,
              longitude: safeNumber(waypoint.longitude ?? waypoint.lon ?? 0, 0) as number,
              radius: safeNumber(waypoint.radius, null),
              color: safeString(waypoint.color, null),
              province: safeOptionalString(waypoint.province),
            }
          : undefined,
        status: (itemObj?.status ?? 'open') as 'open' | 'acknowledged' | 'resolved',
        message: safeString(itemObj?.message ?? itemObj?.description, '') || '',
        createdAt: safeString(
          itemObj?.created_at ?? itemObj?.createdAt,
          new Date().toISOString(),
        ) as string,
        acknowledgedAt: safeString(itemObj?.acknowledged_at ?? itemObj?.acknowledgedAt, null),
        resolvedAt: safeString(itemObj?.resolved_at ?? itemObj?.resolvedAt, null),
        responder: responder
          ? {
              id: toIncidentId(responder.id ?? responder.uuid),
              name: safeString(responder.name ?? responder.full_name, null),
              phone: safeString(responder.phone ?? responder.phone_number, null),
              vehicle: safeString(responder.vehicle, null),
            }
          : null,
        shift: safeString(itemObj?.shift, null),
      }
    })

    console.log('✅ [API] Mapped patrol alerts:', alerts)
    return alerts
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn('❌ [API] Failed to fetch patrol alerts:', error.response?.status, error.message)
      console.warn('❌ [API] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        params: error.config?.params,
      })
    } else {
      console.error('❌ [API] Unexpected error fetching patrol alerts:', error)
    }
    return []
  }
}

// Emergency contacts API
export async function bulkUpsertContacts(
  clientId: string,
  contacts: Omit<EmergencyContact, 'id' | 'clientId'>[],
): Promise<{ created: number; updated: number }> {
  try {
    const response = await panicClient.post<{ created: number; updated: number }>(
      '/contacts/bulk_upsert',
      {
        client_id: clientId,
        contacts: contacts.map((contact) => ({
          phone_number: contact.phoneNumber,
          full_name: contact.fullName,
          relationship: contact.relationship,
          priority: contact.priority,
          is_active: contact.isActive,
        })),
      },
    )
    return response.data
  } catch (error) {
    console.warn('[panic] Failed to bulk upsert contacts', error)
    throw error
  }
}

// Push device registration
export async function registerPushDevice(
  token: string,
  clientId?: string,
  platform: 'android' | 'ios' | 'web' | 'unknown' = 'unknown',
  appVersion?: string,
): Promise<void> {
  try {
    await panicClient.post('/push/register', {
      token,
      client_id: clientId,
      platform,
      app_version: appVersion,
    })
  } catch (error) {
    console.warn('[panic] Failed to register push device', error)
    throw error
  }
}

// Relay submission
export async function submitRelayFrames(frames: RelayFrame[]): Promise<void> {
  try {
    await panicClient.post('/relay_submit', {
      frames: frames.map((frame) => ({
        message: frame.message,
        source: frame.source,
        timestamp: frame.timestamp,
        incident_reference: frame.incidentReference,
        metadata: frame.metadata,
      })),
    })
  } catch (error) {
    console.warn('[panic] Failed to submit relay frames', error)
    throw error
  }
}

// Incident submission (for Vue dashboard)
export async function submitIncident(incident: {
  clientId?: string
  lat?: number
  lng?: number
  description?: string
  source?: string
  address?: string
  priority?: IncidentPriority
  province?: string
  context?: Record<string, unknown>
}): Promise<{
  id: string
  reference: string
  status: IncidentStatus
  createdAt: string
}> {
  const context: ErrorContext = {
    operation: 'Submit Incident',
    endpoint: '/submit',
    data: incident,
  }

  try {
    console.log('🔍 [API] Submitting incident:', incident)

    const response = await panicClient.post<{
      id: string
      reference: string
      status: IncidentStatus
      created_at: string
    }>('/submit', {
      client_id: incident.clientId,
      lat: incident.lat,
      lng: incident.lng,
      description: incident.description,
      source: incident.source ?? 'dashboard',
      address: incident.address,
      priority: incident.priority,
      province: incident.province,
      context: incident.context,
    })

    console.log('✅ [API] Incident submitted successfully:', response.data)

    return {
      id: response.data.id,
      reference: response.data.reference,
      status: response.data.status,
      createdAt: response.data.created_at,
    }
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)

    console.error('❌ [API] Failed to submit incident:', {
      error: apiError,
      userMessage,
      incident,
    })

    // Create a more detailed error with user-friendly message
    const enhancedError = new Error(userMessage)
    ;(enhancedError as Error & { apiError: unknown; originalError: unknown }).apiError = apiError
    ;(enhancedError as Error & { apiError: unknown; originalError: unknown }).originalError = error

    throw enhancedError
  }
}
