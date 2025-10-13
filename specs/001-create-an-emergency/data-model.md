# Data Model: Emergency Response System

**Feature**: Emergency Response System  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Core Entities

### EmergencyAlert

Represents a triggered emergency incident with location, timestamp, reporter info, and current status.

```typescript
interface EmergencyAlert {
  id: string // UUID for unique identification
  reference: string // Human-readable reference number (e.g., "EMG-2024-001")
  status: AlertStatus // Current status of the alert
  priority: AlertPriority // Priority level of the emergency
  type: AlertType // Type of emergency (panic, medical, security, etc.)

  // Location Information
  location: LocationData // GPS coordinates and address
  accuracy: number // GPS accuracy in meters
  address?: string // Human-readable address

  // Reporter Information
  reporter: ReporterInfo // User who triggered the alert
  reporterId: string // ID of the reporting user

  // Timing
  triggeredAt: string // ISO timestamp when alert was triggered
  acknowledgedAt?: string // ISO timestamp when first acknowledged
  resolvedAt?: string // ISO timestamp when resolved

  // Content
  description?: string // Optional description from reporter
  context?: Record<string, unknown> // Additional context data

  // Response Information
  responders: ResponderInfo[] // List of responders assigned/acknowledged
  contacts: ContactInfo[] // Emergency contacts notified

  // Metadata
  source: string // Source of the alert (mobile, web, etc.)
  province: string // South African province
  isActive: boolean // Whether alert is currently active
  createdAt: string // ISO timestamp when record created
  updatedAt: string // ISO timestamp when last updated
}
```

### LocationData

Represents GPS coordinates with accuracy information and optional address details.

```typescript
interface LocationData {
  latitude: number // GPS latitude coordinate
  longitude: number // GPS longitude coordinate
  accuracy?: number // GPS accuracy in meters
  altitude?: number // Altitude in meters (if available)
  heading?: number // Direction of movement in degrees
  speed?: number // Speed in km/h (if available)
  address?: string // Human-readable address
  province: string // South African province
  timestamp: string // ISO timestamp when location captured
}
```

### EmergencyContact

Represents a person who should be notified during emergencies with contact details and priority level.

```typescript
interface EmergencyContact {
  id: string // UUID for unique identification
  userId: string // ID of the user who owns this contact
  name: string // Full name of the contact
  phoneNumber: string // Primary phone number
  email?: string // Optional email address
  relationship: string // Relationship to user (family, friend, etc.)
  priority: number // Priority level (1 = highest)
  isActive: boolean // Whether contact is currently active
  notificationMethods: NotificationMethod[] // Preferred notification methods
  language: 'en' | 'af' // Preferred language for notifications
  createdAt: string // ISO timestamp when created
  updatedAt: string // ISO timestamp when last updated
}
```

### EmergencyResponder

Represents a community member who can respond to emergencies with availability status and location.

```typescript
interface EmergencyResponder {
  id: string // UUID for unique identification
  userId: string // ID of the user account
  name: string // Full name of the responder
  phoneNumber: string // Contact phone number
  email: string // Contact email
  province: string // South African province
  isActive: boolean // Whether responder is currently active
  isOnline: boolean // Whether responder is currently online
  lastSeenAt?: string // ISO timestamp when last seen online
  location?: LocationData // Current location (if available)
  specializations: string[] // Areas of expertise (medical, security, etc.)
  responseRadius: number // Maximum response radius in kilometers
  createdAt: string // ISO timestamp when created
  updatedAt: string // ISO timestamp when last updated
}
```

### AlertStatus

Represents the current state of an emergency alert.

```typescript
type AlertStatus =
  | 'triggered' // Alert just triggered, awaiting acknowledgment
  | 'acknowledged' // Alert acknowledged by responder
  | 'in_progress' // Responder is en route or handling
  | 'resolved' // Emergency has been resolved
  | 'cancelled' // Alert was cancelled by reporter
  | 'expired' // Alert expired without resolution
```

### AlertPriority

Represents the priority level of an emergency.

```typescript
type AlertPriority =
  | 'low' // Non-urgent situation
  | 'medium' // Moderate urgency
  | 'high' // High urgency
  | 'critical' // Life-threatening emergency
```

### AlertType

Represents the type of emergency.

```typescript
type AlertType =
  | 'panic' // General panic button
  | 'medical' // Medical emergency
  | 'security' // Security threat
  | 'fire' // Fire emergency
  | 'accident' // Traffic or other accident
  | 'other' // Other emergency type
```

### NotificationMethod

Represents how a contact should be notified.

```typescript
type NotificationMethod =
  | 'sms' // SMS text message
  | 'push' // Push notification
  | 'email' // Email notification
  | 'call' // Voice call
```

## Supporting Types

### ReporterInfo

Information about the user who triggered the alert.

```typescript
interface ReporterInfo {
  id: string // User ID
  name: string // Full name
  phoneNumber: string // Phone number
  email: string // Email address
  profilePicture?: string // URL to profile picture
}
```

### ResponderInfo

Information about responders assigned to an alert.

```typescript
interface ResponderInfo {
  id: string // Responder ID
  name: string // Full name
  phoneNumber: string // Phone number
  status: ResponderStatus // Current status
  assignedAt: string // ISO timestamp when assigned
  acknowledgedAt?: string // ISO timestamp when acknowledged
  estimatedArrival?: string // ISO timestamp of estimated arrival
  actualArrival?: string // ISO timestamp of actual arrival
  notes?: string // Responder notes
}

type ResponderStatus =
  | 'assigned' // Alert assigned to responder
  | 'acknowledged' // Responder acknowledged the alert
  | 'en_route' // Responder is traveling to location
  | 'on_scene' // Responder has arrived
  | 'completed' // Response completed
  | 'unavailable' // Responder is unavailable
```

### ContactInfo

Information about emergency contacts notified.

```typescript
interface ContactInfo {
  id: string // Contact ID
  name: string // Contact name
  phoneNumber: string // Phone number
  method: NotificationMethod // How they were notified
  notifiedAt: string // ISO timestamp when notified
  acknowledgedAt?: string // ISO timestamp when they acknowledged
  response?: string // Their response message
}
```

## State Transitions

### EmergencyAlert Status Flow

```
triggered → acknowledged → in_progress → resolved
    ↓           ↓              ↓
cancelled ← expired ← expired ← expired
```

**Rules**:

- Only `triggered` alerts can be `cancelled`
- Alerts automatically `expire` after 24 hours if not resolved
- `resolved` and `cancelled` are terminal states
- `expired` alerts cannot be reactivated

### Responder Status Flow

```
assigned → acknowledged → en_route → on_scene → completed
    ↓           ↓            ↓
unavailable ← unavailable ← unavailable
```

**Rules**:

- Responders can become `unavailable` at any time
- `completed` is a terminal state
- Only one responder can be `on_scene` at a time per alert

## Validation Rules

### EmergencyAlert

- `id` must be a valid UUID
- `reference` must match pattern `EMG-YYYY-NNNN`
- `location.latitude` must be between -90 and 90
- `location.longitude` must be between -180 and 180
- `triggeredAt` must be a valid ISO timestamp
- `province` must be a valid South African province code

### EmergencyContact

- `phoneNumber` must be a valid South African phone number
- `email` must be a valid email format (if provided)
- `priority` must be between 1 and 10
- `name` must be between 1 and 100 characters

### EmergencyResponder

- `phoneNumber` must be a valid South African phone number
- `email` must be a valid email format
- `responseRadius` must be between 1 and 100 kilometers
- `province` must be a valid South African province code

## Data Relationships

```
User (1) ←→ (N) EmergencyContact
User (1) ←→ (1) EmergencyResponder
EmergencyAlert (1) ←→ (N) ResponderInfo
EmergencyAlert (1) ←→ (N) ContactInfo
EmergencyAlert (1) ←→ (1) LocationData
```

## Storage Requirements

### Local Storage (IndexedDB)

- Emergency alerts (queued for transmission)
- Emergency contacts (cached for offline access)
- Location history (last 10 locations)
- User preferences and settings

### Backend Storage (Database)

- All emergency alerts (permanent storage)
- Emergency contacts (synchronized with local)
- Emergency responders (real-time data)
- Notification logs and delivery status
- User profiles and authentication data
