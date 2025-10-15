/**
 * Communication API service
 * Handles all HTTP API calls for the Community Communication Hub
 */

import api from '@/lib/api'
import type {
  ApiResponse,
  PaginatedResponse,
  Channel,
  Message,
  UserProfile,
  Event,
  SearchQuery,
  SearchResult,
  CreateChannelForm,
  CreateEventForm,
  SendMessageForm,
  SearchForm,
  ChannelMember,
  EventAttendee,
  MessageReaction,
  MessageReply,
  UserPreferences,
  NotificationSettings,
} from '@/types/communication'

// ============================================================================
// Channel API
// ============================================================================

export const channelApi = {
  /**
   * Get all channels for the current user
   */
  async getChannels(): Promise<ApiResponse<Channel[]>> {
    const response = await api.get('/channels/')
    return response.data
  },

  /**
   * Get a specific channel by ID
   */
  async getChannel(channelId: string): Promise<ApiResponse<Channel>> {
    const response = await api.get(`/channels/${channelId}/`)
    return response.data
  },

  /**
   * Create a new channel
   */
  async createChannel(data: CreateChannelForm): Promise<ApiResponse<Channel>> {
    const response = await api.post('/channels/', data)
    return response.data
  },

  /**
   * Update a channel
   */
  async updateChannel(channelId: string, data: Partial<Channel>): Promise<ApiResponse<Channel>> {
    const response = await api.patch(`/channels/${channelId}/`, data)
    return response.data
  },

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/channels/${channelId}/`)
    return response.data
  },

  /**
   * Join a channel
   */
  async joinChannel(channelId: string): Promise<ApiResponse<ChannelMember>> {
    const response = await api.post(`/channels/${channelId}/join/`)
    return response.data
  },

  /**
   * Leave a channel
   */
  async leaveChannel(channelId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/channels/${channelId}/leave/`)
    return response.data
  },

  /**
   * Get channel members
   */
  async getChannelMembers(channelId: string): Promise<ApiResponse<ChannelMember[]>> {
    const response = await api.get(`/channels/${channelId}/members/`)
    return response.data
  },

  /**
   * Add member to channel
   */
  async addChannelMember(channelId: string, userId: string): Promise<ApiResponse<ChannelMember>> {
    const response = await api.post(`/channels/${channelId}/members/`, { userId })
    return response.data
  },

  /**
   * Remove member from channel
   */
  async removeChannelMember(channelId: string, userId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/channels/${channelId}/members/${userId}/`)
    return response.data
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    channelId: string, 
    userId: string, 
    role: 'owner' | 'admin' | 'moderator' | 'member'
  ): Promise<ApiResponse<ChannelMember>> {
    const response = await api.patch(`/channels/${channelId}/members/${userId}/`, { role })
    return response.data
  },
}

// ============================================================================
// Message API
// ============================================================================

export const messageApi = {
  /**
   * Get messages for a channel
   */
  async getMessages(
    channelId: string, 
    params?: { 
      page?: number
      limit?: number
      before?: string
      after?: string
    }
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const response = await api.get(`/channels/${channelId}/messages/`, { params })
    return response.data
  },

  /**
   * Send a message to a channel
   */
  async sendMessage(channelId: string, data: SendMessageForm): Promise<ApiResponse<Message>> {
    const formData = new FormData()
    formData.append('content', data.content)
    formData.append('type', data.type)
    
    if (data.replyTo) {
      formData.append('replyTo', data.replyTo)
    }
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments`, file)
      })
    }

    const response = await api.post(`/channels/${channelId}/messages/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Update a message
   */
  async updateMessage(
    channelId: string, 
    messageId: string, 
    data: { content: string }
  ): Promise<ApiResponse<Message>> {
    const response = await api.patch(`/channels/${channelId}/messages/${messageId}/`, data)
    return response.data
  },

  /**
   * Delete a message
   */
  async deleteMessage(channelId: string, messageId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/channels/${channelId}/messages/${messageId}/`)
    return response.data
  },

  /**
   * Add reaction to a message
   */
  async addReaction(
    channelId: string, 
    messageId: string, 
    emoji: string
  ): Promise<ApiResponse<MessageReaction>> {
    const response = await api.post(`/channels/${channelId}/messages/${messageId}/reactions/`, {
      emoji,
    })
    return response.data
  },

  /**
   * Remove reaction from a message
   */
  async removeReaction(
    channelId: string, 
    messageId: string, 
    emoji: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(`/channels/${channelId}/messages/${messageId}/reactions/${emoji}/`)
    return response.data
  },

  /**
   * Reply to a message
   */
  async replyToMessage(
    channelId: string, 
    messageId: string, 
    data: { content: string }
  ): Promise<ApiResponse<MessageReply>> {
    const response = await api.post(`/channels/${channelId}/messages/${messageId}/replies/`, data)
    return response.data
  },

  /**
   * Get message replies
   */
  async getMessageReplies(
    channelId: string, 
    messageId: string
  ): Promise<ApiResponse<MessageReply[]>> {
    const response = await api.get(`/channels/${channelId}/messages/${messageId}/replies/`)
    return response.data
  },

  /**
   * Mark messages as read
   */
  async markAsRead(channelId: string, messageId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/channels/${channelId}/messages/${messageId}/read/`)
    return response.data
  },

  /**
   * Mark all messages in channel as read
   */
  async markChannelAsRead(channelId: string): Promise<ApiResponse<void>> {
    const response = await api.post(`/channels/${channelId}/read/`)
    return response.data
  },
}

// ============================================================================
// User API
// ============================================================================

export const userApi = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const response = await api.get('/users/me/')
    return response.data
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await api.patch('/users/me/', data)
    return response.data
  },

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<ApiResponse<UserProfile>> {
    const response = await api.get(`/users/${userId}/`)
    return response.data
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<ApiResponse<UserProfile[]>> {
    const response = await api.get('/users/search/', { params: { q: query } })
    return response.data
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    const response = await api.patch('/users/me/preferences/', data)
    return response.data
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const response = await api.patch('/users/me/notifications/', data)
    return response.data
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/users/me/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// ============================================================================
// Event API
// ============================================================================

export const eventApi = {
  /**
   * Get all events
   */
  async getEvents(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const response = await api.get('/events/', { params })
    return response.data
  },

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    const response = await api.get(`/events/${eventId}/`)
    return response.data
  },

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventForm): Promise<ApiResponse<Event>> {
    const response = await api.post('/events/', data)
    return response.data
  },

  /**
   * Update an event
   */
  async updateEvent(eventId: string, data: Partial<Event>): Promise<ApiResponse<Event>> {
    const response = await api.patch(`/events/${eventId}/`, data)
    return response.data
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/events/${eventId}/`)
    return response.data
  },

  /**
   * RSVP to an event
   */
  async rsvpToEvent(
    eventId: string, 
    status: 'attending' | 'declined' | 'maybe', 
    comment?: string
  ): Promise<ApiResponse<EventAttendee>> {
    const response = await api.post(`/events/${eventId}/rsvp/`, { status, comment })
    return response.data
  },

  /**
   * Get event attendees
   */
  async getEventAttendees(eventId: string): Promise<ApiResponse<EventAttendee[]>> {
    const response = await api.get(`/events/${eventId}/attendees/`)
    return response.data
  },

  /**
   * Invite users to event
   */
  async inviteToEvent(eventId: string, userIds: string[]): Promise<ApiResponse<void>> {
    const response = await api.post(`/events/${eventId}/invite/`, { userIds })
    return response.data
  },
}

// ============================================================================
// Search API
// ============================================================================

export const searchApi = {
  /**
   * Search messages
   */
  async searchMessages(query: SearchQuery): Promise<ApiResponse<SearchResult>> {
    const response = await api.post('/search/messages/', query)
    return response.data
  },

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<ApiResponse<UserProfile[]>> {
    const response = await api.get('/search/users/', { params: { q: query } })
    return response.data
  },

  /**
   * Search events
   */
  async searchEvents(query: string): Promise<ApiResponse<Event[]>> {
    const response = await api.get('/search/events/', { params: { q: query } })
    return response.data
  },

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<ApiResponse<{
    users: UserProfile[]
    channels: Channel[]
    events: Event[]
  }>> {
    const response = await api.get('/search/suggestions/', { params: { q: query } })
    return response.data
  },
}

// ============================================================================
// Notification API
// ============================================================================

export const notificationApi = {
  /**
   * Get user notifications
   */
  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await api.get('/notifications/', { params })
    return response.data
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    const response = await api.patch(`/notifications/${notificationId}/read/`)
    return response.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    const response = await api.post('/notifications/read-all/')
    return response.data
  },

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const response = await api.get('/notifications/settings/')
    return response.data
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const response = await api.patch('/notifications/settings/', data)
    return response.data
  },
}

// ============================================================================
// File Upload API
// ============================================================================

export const fileApi = {
  /**
   * Upload a file
   */
  async uploadFile(file: File, channelId?: string): Promise<ApiResponse<{
    id: string
    filename: string
    url: string
    thumbnailUrl?: string
    size: number
    mimeType: string
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    if (channelId) {
      formData.append('channelId', channelId)
    }

    const response = await api.post('/files/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/files/${fileId}/`)
    return response.data
  },

  /**
   * Get file info
   */
  async getFile(fileId: string): Promise<ApiResponse<{
    id: string
    filename: string
    url: string
    thumbnailUrl?: string
    size: number
    mimeType: string
    uploadedAt: string
  }>> {
    const response = await api.get(`/files/${fileId}/`)
    return response.data
  },
}

// ============================================================================
// Export all APIs
// ============================================================================

export const communicationApi = {
  channels: channelApi,
  messages: messageApi,
  users: userApi,
  events: eventApi,
  search: searchApi,
  notifications: notificationApi,
  files: fileApi,
}

export default communicationApi
