/**
 * TypeScript interfaces for Community Communication Hub
 * Generated from data-model.md specification
 */

// ============================================================================
// Core User Types
// ============================================================================

export type UserStatus = 'online' | 'away' | 'busy' | 'offline'
export type Language = 'en' | 'af'
export type Theme = 'light' | 'dark' | 'auto'
export type MessageDisplay = 'compact' | 'comfortable'

export interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  language: Language
  timezone: string
  status: UserStatus
  lastSeen: Date
  preferences: UserPreferences
  permissions: UserPermissions
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  notifications: NotificationSettings
  theme: Theme
  messageDisplay: MessageDisplay
  showOnlineStatus: boolean
  showTypingIndicators: boolean
  autoTranslate: boolean
}

export interface UserPermissions {
  canCreateChannels: boolean
  canManageEvents: boolean
  canModerateMessages: boolean
  canInviteUsers: boolean
  canDeleteMessages: boolean
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  desktop: boolean
  mentions: boolean
  directMessages: boolean
  channelMessages: boolean
  eventInvites: boolean
  eventReminders: boolean
  systemUpdates: boolean
}

// ============================================================================
// Channel Types
// ============================================================================

export type ChannelType = 'general' | 'safety' | 'events' | 'private'
export type ChannelStatus = 'active' | 'archived' | 'muted'

export interface Channel {
  id: string
  name: string
  description: string
  type: ChannelType
  status: ChannelStatus
  members: ChannelMember[]
  settings: ChannelSettings
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ChannelMember {
  userId: string
  username: string
  displayName: string
  avatar?: string
  role: ChannelRole
  joinedAt: Date
  lastReadAt?: Date
  isTyping: boolean
}

export type ChannelRole = 'owner' | 'admin' | 'moderator' | 'member'

export interface ChannelSettings {
  isPublic: boolean
  allowInvites: boolean
  allowFileUploads: boolean
  maxFileSize: number
  messageRetentionDays: number
  slowMode: number // seconds between messages
  requireApproval: boolean
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageType = 'text' | 'image' | 'file' | 'system' | 'event'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed' | 'queued'

export interface Message {
  id: string
  channelId: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  content: string
  type: MessageType
  status: MessageStatus
  metadata: MessageMetadata
  reactions: MessageReaction[]
  replies: MessageReply[]
  createdAt: Date
  updatedAt: Date
  editedAt?: Date
  deletedAt?: Date
}

export interface MessageMetadata {
  attachments?: Attachment[]
  mentions?: string[]
  hashtags?: string[]
  language?: Language
  translatedContent?: Record<Language, string>
  isEdited: boolean
  isDeleted: boolean
  originalContent?: string
}

export interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
}

export interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

export interface MessageReply {
  id: string
  messageId: string
  userId: string
  username: string
  displayName: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Event Types
// ============================================================================

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type EventType = 'meeting' | 'social' | 'emergency' | 'maintenance' | 'other'

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  startDate: Date
  endDate: Date
  location: EventLocation
  organizer: EventOrganizer
  attendees: EventAttendee[]
  settings: EventSettings
  discussionThread?: string // Channel ID for event discussion
  createdAt: Date
  updatedAt: Date
}

export interface EventLocation {
  name: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  isVirtual: boolean
  meetingLink?: string
}

export interface EventOrganizer {
  userId: string
  username: string
  displayName: string
  email: string
}

export interface EventAttendee {
  userId: string
  username: string
  displayName: string
  status: 'invited' | 'attending' | 'declined' | 'maybe'
  rsvpAt: Date
  comment?: string
}

export interface EventSettings {
  maxAttendees?: number
  requiresApproval: boolean
  allowInvites: boolean
  sendReminders: boolean
  reminderTimes: number[] // hours before event
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
  endDate?: Date
  occurrences?: number
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchQuery {
  query: string
  filters: SearchFilters
  pagination: PaginationOptions
  sort: SortOptions
}

export interface SearchFilters {
  channels?: string[]
  users?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  messageTypes?: MessageType[]
  hasAttachments?: boolean
  hasMentions?: boolean
  language?: Language
}

export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

export interface SortOptions {
  field: 'createdAt' | 'relevance' | 'updatedAt'
  direction: 'asc' | 'desc'
}

export interface SearchResult {
  messages: Message[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  facets?: SearchFacets
}

export interface SearchFacets {
  channels: Array<{ id: string; name: string; count: number }>
  users: Array<{ id: string; username: string; count: number }>
  dateRanges: Array<{ label: string; count: number }>
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WebSocketEventType = 
  | 'message.created'
  | 'message.updated'
  | 'message.deleted'
  | 'typing.start'
  | 'typing.stop'
  | 'user.status.changed'
  | 'channel.member.added'
  | 'channel.member.removed'
  | 'event.created'
  | 'event.updated'
  | 'event.cancelled'
  | 'notification.created'

export interface WebSocketMessage {
  type: WebSocketEventType
  data: any
  timestamp: Date
  channelId?: string
  userId?: string
}

export interface TypingIndicator {
  userId: string
  username: string
  channelId: string
  isTyping: boolean
  timestamp: Date
}

export interface PresenceUpdate {
  userId: string
  status: UserStatus
  lastSeen: Date
  channelId?: string
}

// ============================================================================
// Offline Queue Types
// ============================================================================

export interface OfflineMessage {
  id: string
  message: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  queuedAt: Date
  retryCount: number
  maxRetries: number
  priority: 'high' | 'normal' | 'low'
}

export interface OfflineQueue {
  messages: OfflineMessage[]
  isOnline: boolean
  lastSyncAt?: Date
  pendingCount: number
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  timestamp: Date
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================================================
// Form Types
// ============================================================================

export interface CreateChannelForm {
  name: string
  description: string
  type: ChannelType
  isPublic: boolean
  allowInvites: boolean
}

export interface CreateEventForm {
  title: string
  description: string
  type: EventType
  startDate: Date
  endDate: Date
  location: EventLocation
  maxAttendees?: number
  requiresApproval: boolean
}

export interface SendMessageForm {
  content: string
  type: MessageType
  attachments?: File[]
  replyTo?: string
}

export interface SearchForm {
  query: string
  channels: string[]
  users: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  messageTypes: MessageType[]
}

// ============================================================================
// Store State Types
// ============================================================================

export interface CommunicationState {
  channels: Channel[]
  messages: Record<string, Message[]>
  users: Record<string, UserProfile>
  events: Event[]
  currentChannel?: string
  currentUser?: UserProfile
  isOnline: boolean
  typingUsers: Record<string, TypingIndicator[]>
  offlineQueue: OfflineQueue
  searchResults?: SearchResult
  isLoading: boolean
  error?: ApiError
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// ============================================================================
// Constants
// ============================================================================

export const MESSAGE_TYPES = {
  TEXT: 'text' as const,
  IMAGE: 'image' as const,
  FILE: 'file' as const,
  SYSTEM: 'system' as const,
  EVENT: 'event' as const,
}

export const CHANNEL_TYPES = {
  GENERAL: 'general' as const,
  SAFETY: 'safety' as const,
  EVENTS: 'events' as const,
  PRIVATE: 'private' as const,
}

export const USER_STATUSES = {
  ONLINE: 'online' as const,
  AWAY: 'away' as const,
  BUSY: 'busy' as const,
  OFFLINE: 'offline' as const,
}

export const EVENT_TYPES = {
  MEETING: 'meeting' as const,
  SOCIAL: 'social' as const,
  EMERGENCY: 'emergency' as const,
  MAINTENANCE: 'maintenance' as const,
  OTHER: 'other' as const,
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_MESSAGE_LENGTH = 2000
export const TYPING_INDICATOR_TIMEOUT = 3000 // 3 seconds
export const MESSAGE_RETENTION_DAYS = 90
export const OFFLINE_QUEUE_MAX_RETRIES = 3
