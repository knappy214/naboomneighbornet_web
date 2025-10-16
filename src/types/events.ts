export interface Event {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location?: string
  virtualLink?: string
  isVirtual: boolean
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  maxAttendees?: number
  currentAttendees: number
  status: EventStatus
  visibility: EventVisibility
  category: EventCategory
  tags: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  channelId?: string
  discussionThreadId?: string
  reminders: EventReminder[]
  attendees: EventAttendee[]
  metadata: EventMetadata
}

export interface EventAttendee {
  userId: string
  username: string
  displayName: string
  avatar?: string
  status: AttendeeStatus
  rsvpDate: Date
  notes?: string
  isOrganizer: boolean
  isModerator: boolean
}

export interface EventReminder {
  id: string
  eventId: string
  type: ReminderType
  triggerTime: Date
  isSent: boolean
  sentAt?: Date
  message: string
  recipients: string[]
}

export interface EventMetadata {
  coverImage?: string
  attachments: EventAttachment[]
  customFields: Record<string, any>
  externalLinks: ExternalLink[]
  requirements: string[]
  equipment: string[]
  cost?: number
  currency?: string
  ageRestriction?: string
  accessibility: AccessibilityInfo
  weatherDependent: boolean
  backupPlan?: string
}

export interface EventAttachment {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  uploadedBy: string
  uploadedAt: Date
}

export interface ExternalLink {
  id: string
  title: string
  url: string
  type: 'website' | 'social' | 'ticket' | 'registration' | 'other'
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean
  hearingAssistance: boolean
  visualAssistance: boolean
  otherAccommodations: string[]
}

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: Date
  maxOccurrences?: number
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed'

export type EventVisibility = 'public' | 'community' | 'private' | 'invite_only'

export type EventCategory =
  | 'meeting'
  | 'social'
  | 'emergency'
  | 'maintenance'
  | 'celebration'
  | 'education'
  | 'sports'
  | 'volunteer'
  | 'other'

export type AttendeeStatus = 'pending' | 'attending' | 'not_attending' | 'maybe' | 'waitlist'

export type ReminderType = 'email' | 'push' | 'sms' | 'in_app'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface EventFilter {
  status?: EventStatus[]
  category?: EventCategory[]
  visibility?: EventVisibility[]
  dateRange?: {
    start: Date
    end: Date
  }
  location?: string
  isVirtual?: boolean
  tags?: string[]
  createdBy?: string
}

export interface EventSort {
  field: 'title' | 'startDate' | 'createdAt' | 'currentAttendees'
  direction: 'asc' | 'desc'
}

export interface EventSearchQuery {
  text?: string
  filters?: EventFilter
  sort?: EventSort
  limit?: number
  offset?: number
}

export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
  cancelledEvents: number
  totalAttendees: number
  averageAttendance: number
  mostPopularCategory: EventCategory
  eventsThisMonth: number
  eventsNextMonth: number
}

export interface EventNotification {
  id: string
  eventId: string
  type: EventNotificationType
  title: string
  message: string
  recipients: string[]
  scheduledFor: Date
  isSent: boolean
  sentAt?: Date
  metadata: Record<string, any>
}

export type EventNotificationType =
  | 'event_created'
  | 'event_updated'
  | 'event_cancelled'
  | 'event_reminder'
  | 'rsvp_received'
  | 'rsvp_reminder'
  | 'event_starting_soon'
  | 'event_ended'
  | 'attendee_joined'
  | 'attendee_left'
  | 'discussion_activity'
  | 'weather_alert'
  | 'location_change'
  | 'time_change'
