/**
 * Communication Types
 * Type definitions for the Community Communication Hub
 * Part of User Story 1: Real-Time Discussion Channels
 */

// Base types
export type Language = 'en' | 'af'
export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'
  | 'error'
  | 'failed'
export type NotificationPermission = 'default' | 'granted' | 'denied'

// Channel types
export interface Channel {
  id: string
  name: string
  description?: string
  type: 'general' | 'announcements' | 'events' | 'support' | 'private'
  isPublic: boolean
  allowInvites: boolean
  members: ChannelMember[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ChannelMember {
  id: string
  userId: string
  channelId: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  joinedAt: Date
  lastReadAt?: Date
  user: {
    id: string
    username: string
    displayName: string
    avatar?: string
    isOnline: boolean
    lastSeen?: Date
  }
}

export interface CreateChannelForm {
  name: string
  description?: string
  type: 'general' | 'announcements' | 'events' | 'support' | 'private'
  isPublic: boolean
  allowInvites: boolean
}

// Message types
export interface Message {
  id: string
  channelId: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface MessageAttachment {
  id: string
  messageId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  createdAt: Date
}

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

export interface SendMessageForm {
  content: string
  type: 'text' | 'image' | 'file'
  attachments?: File[]
}

// Typing types
export interface TypingUser {
  userId: string
  username: string
  timestamp: Date
}

// Notification types
export interface Notification {
  id?: string
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  vibrate?: number[]
  actions?: NotificationAction[]
  onClick?: () => void
  onClose?: () => void
  onError?: (error: any) => void
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

// Real-time event types
export interface RealTimeEvent {
  type: 'message' | 'typing' | 'channel' | 'user'
  action: string
  data: any
  timestamp: Date
}

export interface MessageEvent extends RealTimeEvent {
  type: 'message'
  action: 'sent' | 'updated' | 'deleted' | 'reaction_added' | 'reaction_removed'
  data: Message
}

export interface TypingEvent extends RealTimeEvent {
  type: 'typing'
  action: 'start' | 'stop'
  data: {
    channelId: string
    userId: string
    username: string
    isTyping: boolean
  }
}

export interface ChannelEvent extends RealTimeEvent {
  type: 'channel'
  action:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'member_added'
    | 'member_removed'
    | 'member_role_updated'
  data: Channel
}

export interface UserEvent extends RealTimeEvent {
  type: 'user'
  action: 'online' | 'offline' | 'status_changed'
  data: {
    userId: string
    username: string
    status: 'online' | 'offline' | 'away' | 'busy'
  }
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  firstError?: string
}

// Search types
export interface SearchOptions {
  query: string
  channelId?: string
  userId?: string
  type?: 'message' | 'channel' | 'user'
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'user'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  took: number
  facets?: Record<string, any>
}

// Settings types
export interface CommunicationSettings {
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    mobile: boolean
    mentions: boolean
    directMessages: boolean
    channelMessages: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    compactMode: boolean
    showTimestamps: boolean
    showAvatars: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    showLastSeen: boolean
    allowDirectMessages: boolean
    allowChannelInvites: boolean
  }
  language: {
    interface: Language
    messages: Language
    autoTranslate: boolean
  }
}

// Statistics types
export interface CommunicationStats {
  totalMessages: number
  totalChannels: number
  activeUsers: number
  messagesToday: number
  messagesThisWeek: number
  messagesThisMonth: number
  mostActiveChannel: {
    id: string
    name: string
    messageCount: number
  }
  mostActiveUser: {
    id: string
    username: string
    messageCount: number
  }
}

// Export utility types
export type ChannelId = string
export type MessageId = string
export type UserId = string
export type ChannelType = Channel['type']
export type MessageType = Message['type']
export type MemberRole = ChannelMember['role']
export type NotificationType = 'message' | 'channel' | 'system' | 'mention'
