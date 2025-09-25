export interface HubChannel {
  id: string
  name: string
  description?: string
  unreadCount: number
  lastActivity: string | null
  memberCount: number
  isMuted: boolean
}

export interface HubThread {
  id: string
  channelId: string
  title: string
  author: string
  createdAt: string
  updatedAt: string
  replyCount: number
  lastReplySnippet?: string
  pinned?: boolean
  searchRank?: number
}

export interface HubPost {
  id: string
  threadId: string
  author: string
  createdAt: string
  body: string
  optimistic?: boolean
}

export interface HubRealtimeEvent {
  type: 'thread.created' | 'thread.updated' | 'post.created' | 'post.updated'
  payload: Record<string, unknown>
}

export type WebSocketStatus = 'offline' | 'connecting' | 'online' | 'reconnecting'

export interface ThreadSearchResponse {
  results: HubThread[]
  total: number
}

export interface PostComposerPayload {
  body: string
  attachments?: File[]
}

export interface NotificationPreference {
  id: string
  label: string
  description: string
  enabled: boolean
}
