# Data Model: Community Communication Hub

**Feature**: Community Communication Hub  
**Date**: 2025-01-27  
**Purpose**: Define TypeScript interfaces and validation schemas for all entities

## Core Entities

### User Profile

```typescript
interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  language: 'en' | 'af'
  timezone: string
  status: UserStatus
  lastSeen: Date
  preferences: UserPreferences
  permissions: UserPermissions
  createdAt: Date
  updatedAt: Date
}

interface UserPreferences {
  notifications: NotificationSettings
  theme: 'light' | 'dark' | 'auto'
  messageDisplay: 'compact' | 'comfortable'
  showOnlineStatus: boolean
  showTypingIndicators: boolean
  autoTranslate: boolean
}

interface UserPermissions {
  canCreateChannels: boolean
  canManageEvents: boolean
  canModerateMessages: boolean
  canInviteUsers: boolean
  canDeleteMessages: boolean
}

type UserStatus = 'online' | 'away' | 'busy' | 'offline'
```

### Channel

```typescript
interface Channel {
  id: string
  name: string
  description?: string
  type: ChannelType
  isPrivate: boolean
  members: ChannelMember[]
  settings: ChannelSettings
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface ChannelMember {
  userId: string
  role: ChannelRole
  joinedAt: Date
  lastReadAt?: Date
  notifications: boolean
}

interface ChannelSettings {
  allowFileUploads: boolean
  allowReactions: boolean
  allowThreads: boolean
  maxMessageLength: number
  slowMode: number // seconds between messages
  autoDelete: number // days before auto-delete
}

type ChannelType = 'general' | 'safety' | 'events' | 'announcements' | 'custom'
type ChannelRole = 'owner' | 'admin' | 'moderator' | 'member'
```

### Message

```typescript
interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  type: MessageType
  timestamp: Date
  editedAt?: Date
  deletedAt?: Date
  replyTo?: string
  threadId?: string
  reactions: MessageReaction[]
  attachments: MessageAttachment[]
  metadata: MessageMetadata
  isOffline?: boolean
}

interface MessageReaction {
  emoji: string
  userId: string
  timestamp: Date
}

interface MessageAttachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
}

interface MessageMetadata {
  isEdited: boolean
  isDeleted: boolean
  isPinned: boolean
  isSystemMessage: boolean
  language?: string
  translation?: string
}

type MessageType = 'text' | 'image' | 'file' | 'system' | 'event' | 'announcement'
```

### Event

```typescript
interface Event {
  id: string
  title: string
  description: string
  type: EventType
  status: EventStatus
  startDate: Date
  endDate?: Date
  location?: EventLocation
  organizer: string
  attendees: EventAttendee[]
  maxAttendees?: number
  isPublic: boolean
  channelId?: string
  createdAt: Date
  updatedAt: Date
}

interface EventAttendee {
  userId: string
  status: AttendanceStatus
  joinedAt: Date
  notes?: string
}

interface EventLocation {
  name: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  isVirtual: boolean
  meetingLink?: string
}

type EventType = 'meeting' | 'social' | 'safety' | 'emergency' | 'maintenance' | 'other'
type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
type AttendanceStatus = 'attending' | 'maybe' | 'not_attending' | 'waitlist'
```

### Typing Indicator

```typescript
interface TypingIndicator {
  userId: string
  channelId: string
  timestamp: Date
  isTyping: boolean
}

interface PresenceStatus {
  userId: string
  status: UserStatus
  lastSeen: Date
  currentChannel?: string
}
```

### Search

```typescript
interface SearchQuery {
  query: string
  filters: SearchFilters
  sortBy: SearchSortBy
  limit: number
  offset: number
}

interface SearchFilters {
  channels?: string[]
  users?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  messageTypes?: MessageType[]
  hasAttachments?: boolean
  language?: string
}

interface SearchResult {
  id: string
  type: 'message' | 'event' | 'user'
  content: string
  channelId?: string
  userId?: string
  timestamp: Date
  relevanceScore: number
  highlights: string[]
}

type SearchSortBy = 'relevance' | 'date' | 'user' | 'channel'
```

## API Response Types

### Paginated Response

```typescript
interface PaginatedResponse<T> {
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
```

### WebSocket Message Types

```typescript
interface WebSocketMessage {
  type: WebSocketMessageType
  payload: any
  timestamp: Date
  id: string
}

interface MessageReceivedPayload {
  message: Message
  channelId: string
}

interface TypingIndicatorPayload {
  userId: string
  channelId: string
  isTyping: boolean
}

interface PresenceUpdatePayload {
  userId: string
  status: UserStatus
  lastSeen: Date
}

interface ChannelUpdatePayload {
  channel: Channel
  action: 'created' | 'updated' | 'deleted' | 'member_added' | 'member_removed'
}

interface EventUpdatePayload {
  event: Event
  action: 'created' | 'updated' | 'deleted' | 'attendee_added' | 'attendee_removed'
}

type WebSocketMessageType = 
  | 'message_received'
  | 'message_updated'
  | 'message_deleted'
  | 'typing_indicator'
  | 'presence_update'
  | 'channel_update'
  | 'event_update'
  | 'error'
  | 'connection_status'
```

## Validation Schemas

### Message Validation

```typescript
const messageSchema = {
  content: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 2000,
    pattern: /^[\s\S]*$/
  },
  channelId: {
    type: 'string',
    required: true,
    pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  },
  type: {
    type: 'string',
    required: true,
    enum: ['text', 'image', 'file', 'system', 'event', 'announcement']
  },
  replyTo: {
    type: 'string',
    required: false,
    pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  }
}
```

### Event Validation

```typescript
const eventSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 1000
  },
  startDate: {
    type: 'date',
    required: true
  },
  endDate: {
    type: 'date',
    required: false
  },
  maxAttendees: {
    type: 'number',
    required: false,
    min: 1,
    max: 1000
  }
}
```

### Channel Validation

```typescript
const channelSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 200
  },
  type: {
    type: 'string',
    required: true,
    enum: ['general', 'safety', 'events', 'announcements', 'custom']
  },
  isPrivate: {
    type: 'boolean',
    required: true
  }
}
```

## State Management Types

### Pinia Store State

```typescript
interface CommunicationState {
  channels: Channel[]
  currentChannel: Channel | null
  messages: Record<string, Message[]> // channelId -> messages
  users: Record<string, UserProfile> // userId -> user
  events: Event[]
  typingIndicators: TypingIndicator[]
  presenceStatus: Record<string, PresenceStatus> // userId -> status
  searchResults: SearchResult[]
  isConnected: boolean
  isOffline: boolean
  offlineMessages: Message[]
}

interface CommunicationGetters {
  getChannelMessages: (channelId: string) => Message[]
  getChannelMembers: (channelId: string) => ChannelMember[]
  getTypingUsers: (channelId: string) => UserProfile[]
  getOnlineUsers: () => UserProfile[]
  getUnreadCount: (channelId: string) => number
  getSearchResults: () => SearchResult[]
}

interface CommunicationActions {
  // Channel actions
  createChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Channel>
  joinChannel: (channelId: string) => Promise<void>
  leaveChannel: (channelId: string) => Promise<void>
  updateChannel: (channelId: string, updates: Partial<Channel>) => Promise<void>
  
  // Message actions
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  reactToMessage: (messageId: string, emoji: string) => Promise<void>
  
  // Event actions
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  rsvpToEvent: (eventId: string, status: AttendanceStatus) => Promise<void>
  
  // Search actions
  searchMessages: (query: SearchQuery) => Promise<SearchResult[]>
  searchEvents: (query: SearchQuery) => Promise<SearchResult[]>
  searchUsers: (query: SearchQuery) => Promise<SearchResult[]>
  
  // WebSocket actions
  connect: () => Promise<void>
  disconnect: () => void
  sendTypingIndicator: (channelId: string, isTyping: boolean) => void
  
  // Offline actions
  syncOfflineMessages: () => Promise<void>
  markAsRead: (channelId: string) => Promise<void>
}
```

## Error Types

```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR'
  details: {
    field: string
    message: string
  }[]
}

interface NetworkError extends ApiError {
  code: 'NETWORK_ERROR'
  details: {
    status?: number
    statusText?: string
  }
}

interface WebSocketError extends ApiError {
  code: 'WEBSOCKET_ERROR'
  details: {
    event: string
    reason?: string
  }
}

type CommunicationError = ValidationError | NetworkError | WebSocketError
```

## Utility Types

```typescript
// Make all properties optional except specified ones
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Make all properties required except specified ones
type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>

// Extract message types for specific channels
type ChannelMessages<T extends ChannelType> = Message & {
  channel: Channel & { type: T }
}

// Event with attendee count
type EventWithAttendeeCount = Event & {
  attendeeCount: number
  maxAttendeesReached: boolean
}

// User with online status
type UserWithStatus = UserProfile & {
  isOnline: boolean
  currentChannel?: string
}
```

This data model provides comprehensive TypeScript interfaces for all entities in the Community Communication Hub, ensuring type safety and consistency throughout the application.