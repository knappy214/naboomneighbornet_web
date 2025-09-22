import axios from 'axios'
import type {
  Incident,
  IncidentFilters,
  IncidentPriority,
  IncidentStatus,
  Waypoint,
} from '@/types/panic'

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

const panicClient = axios.create({
  baseURL: normalizeBaseUrl(
    import.meta.env.VITE_PANIC_BASE || `${import.meta.env.VITE_API_BASE || ''}${DEFAULT_BASE_URL}`,
  ),
  withCredentials: true,
  timeout: 20000,
})

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

function safeNumber(value: unknown, fallback: number = 0): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

export function mapIncident(raw: any): Incident {
  const latitude =
    raw?.latitude ?? raw?.lat ?? raw?.location?.latitude ?? raw?.location?.lat ?? raw?.location?.y
  const longitude =
    raw?.longitude ?? raw?.lon ?? raw?.lng ?? raw?.location?.longitude ?? raw?.location?.lon ?? raw?.location?.x

  return {
    id: toIncidentId(raw?.id ?? raw?.uuid ?? raw?.incident_id),
    status: coerceStatus(raw?.status ?? raw?.state),
    priority: coercePriority(raw?.priority ?? raw?.severity),
    type: typeof raw?.type === 'string' ? raw.type : 'panic',
    summary:
      typeof raw?.summary === 'string'
        ? raw.summary
        : typeof raw?.title === 'string'
          ? raw.title
          : `Incident ${toIncidentId(raw?.id ?? raw?.uuid ?? raw?.incident_id)}`,
    description:
      typeof raw?.description === 'string'
        ? raw.description
        : typeof raw?.notes === 'string'
          ? raw.notes
          : null,
    reportedAt: raw?.reportedAt || raw?.reported_at || raw?.createdAt || raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updatedAt || raw?.updated_at || raw?.modifiedAt || raw?.modified_at || new Date().toISOString(),
    location: {
      latitude: safeNumber(latitude, 0),
      longitude: safeNumber(longitude, 0),
      accuracy: raw?.accuracy ?? raw?.location?.accuracy ?? null,
      address: raw?.address ?? raw?.location?.address ?? null,
    },
    reporter: raw?.reporter
      ? {
          id: raw.reporter.id ?? raw.reporter.uuid,
          name: raw.reporter.name ?? raw.reporter.full_name ?? raw.reporter.fullName ?? null,
          phone: raw.reporter.phone ?? raw.reporter.phone_number ?? null,
          email: raw.reporter.email ?? null,
        }
      : raw?.reporter_name || raw?.reporter_phone
        ? {
            name: raw.reporter_name ?? null,
            phone: raw.reporter_phone ?? null,
          }
        : null,
    responder: raw?.responder
      ? {
          id: raw.responder.id ?? raw.responder.uuid,
          name: raw.responder.name ?? raw.responder.full_name ?? null,
          phone: raw.responder.phone ?? raw.responder.phone_number ?? null,
          vehicle: raw.responder.vehicle ?? raw.responder.vehicle_name ?? null,
        }
      : null,
    attachments: Array.isArray(raw?.attachments)
      ? raw.attachments.filter((value: unknown): value is string => typeof value === 'string')
      : undefined,
    metadata: raw?.metadata && typeof raw.metadata === 'object' ? raw.metadata : undefined,
  }
}

function extractIncidentList(response: IncidentApiResponse | unknown[]): unknown[] {
  if (Array.isArray(response)) {
    return response
  }

  if (!response || typeof response !== 'object') {
    return []
  }

  if (Array.isArray(response.incidents)) {
    return response.incidents
  }

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.results)) {
    return response.results
  }

  return []
}

export async function fetchIncidents(filters: IncidentFilters): Promise<Incident[]> {
  const params = toQueryParams(filters)
  const response = await panicClient.get<IncidentApiResponse | unknown[]>('/incidents', {
    params,
  })

  const rawList = extractIncidentList(response.data)
  return rawList.map((item) => mapIncident(item))
}

export async function acknowledgeIncident(incidentId: string): Promise<Incident> {
  const response = await panicClient.post(`/incidents/${incidentId}/ack`, {})
  return mapIncident(response.data)
}

export async function resolveIncident(incidentId: string): Promise<Incident> {
  const response = await panicClient.post(`/incidents/${incidentId}/resolve`, {})
  return mapIncident(response.data)
}

export async function fetchWaypoints(): Promise<Waypoint[]> {
  try {
    const response = await panicClient.get<{ waypoints?: unknown[]; data?: unknown[] }>('/waypoints')
    const items = extractIncidentList(response.data as IncidentApiResponse | unknown[])
    return items
      .map((item: any) => ({
        id: toIncidentId(item?.id ?? item?.uuid ?? crypto.randomUUID()),
        name: typeof item?.name === 'string' ? item.name : `Waypoint ${item?.id ?? ''}`,
        latitude: safeNumber(item?.latitude ?? item?.lat ?? item?.y, 0),
        longitude: safeNumber(item?.longitude ?? item?.lon ?? item?.x, 0),
        radius: item?.radius ?? item?.accuracy ?? null,
        color: item?.color ?? null,
      }))
      .filter((waypoint) => Number.isFinite(waypoint.latitude) && Number.isFinite(waypoint.longitude))
  } catch (error) {
    console.warn('[panic] Failed to preload waypoints', error)
    return []
  }
}
