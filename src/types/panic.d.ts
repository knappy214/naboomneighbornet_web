export type IncidentStatus = 'open' | 'acknowledged' | 'resolved' | 'cancelled'

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical'

export type IncidentEventType =
  | 'created'
  | 'acknowledged'
  | 'resolved'
  | 'cancelled'
  | 'escalated'
  | 'message_received'
  | 'message_sent'

export type VehiclePlatform = 'android' | 'ios' | 'web' | 'unknown'

export type PatrolAlertStatus = 'open' | 'acknowledged' | 'resolved'

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

export interface IncidentEvent {
  id: string
  incidentId: string
  type: IncidentEventType
  description: string
  createdAt: string
  createdBy?: string | null
  metadata?: Record<string, unknown>
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
  events?: IncidentEvent[]
  reference?: string
  source?: string
  province?: string
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
  province?: string
}

export interface Responder {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  province: string
  isActive: boolean
  vehicle?: string | null
  lastSeen?: string | null
}

export interface Vehicle {
  id: string
  name: string
  lastPosition?: {
    latitude: number
    longitude: number
    timestamp: string
    speedKph?: number | null
    headingDeg?: number | null
  } | null
  isActive: boolean
  lastPing?: string | null
}

export interface VehicleTrack {
  vehicleId: string
  points: Array<{
    latitude: number
    longitude: number
    timestamp: string
    speedKph?: number | null
    headingDeg?: number | null
  }>
}

export interface PatrolAlert {
  id: string
  waypointId: string
  waypoint?: Waypoint
  status: PatrolAlertStatus
  message: string
  createdAt: string
  acknowledgedAt?: string | null
  resolvedAt?: string | null
  responder?: IncidentResponder | null
  shift?: string | null
}

export interface EmergencyContact {
  id: string
  clientId: string
  phoneNumber: string
  fullName?: string | null
  relationship?: string | null
  priority?: number | null
  isActive: boolean
}

export interface PushDevice {
  id: string
  clientId?: string | null
  token: string
  platform: VehiclePlatform
  appVersion?: string | null
  lastSeen?: string | null
  isActive: boolean
}

export interface InboundMessage {
  id: string
  incidentReference?: string | null
  message: string
  source: string
  receivedAt: string
  processed: boolean
}

export interface RelayFrame {
  message: string
  source: string
  timestamp?: string
  incidentReference?: string | null
  metadata?: Record<string, unknown>
}
