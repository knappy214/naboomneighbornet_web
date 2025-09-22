export type IncidentStatus = 'open' | 'acknowledged' | 'resolved'

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical'

export interface IncidentLocation {
  latitude: number
  longitude: number
  accuracy?: number | null
  address?: string | null
}

export interface IncidentReporter {
  id?: string | number
  name?: string | null
  phone?: string | null
  email?: string | null
}

export interface IncidentResponder {
  id?: string | number
  name?: string | null
  phone?: string | null
  vehicle?: string | null
}

export interface Incident {
  id: string
  status: IncidentStatus
  priority: IncidentPriority
  type: string
  summary: string
  description?: string | null
  reportedAt: string
  updatedAt: string
  location: IncidentLocation
  reporter?: IncidentReporter | null
  responder?: IncidentResponder | null
  attachments?: string[]
  metadata?: Record<string, unknown>
}

export interface IncidentFilters {
  statuses: IncidentStatus[]
  dateRange: {
    from?: string | null
    to?: string | null
  }
  bbox?: [number, number, number, number] | null
  search?: string
}

export interface IncidentStreamEnvelope<T = unknown> {
  id?: string
  type: string
  payload: T
  receivedAt: string
}

export interface PatrolAlertPayload {
  incident: Incident
  note?: string
  responder?: IncidentResponder | null
}

export interface Waypoint {
  id: string
  name: string
  latitude: number
  longitude: number
  radius?: number | null
  color?: string | null
}
