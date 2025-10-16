/**
 * Communication API
 * Centralized API service for communication hub
 * Part of User Story 1: Real-Time Discussion Channels
 */

import { api } from '@/services/api'
import type {
  Channel,
  CreateChannelForm,
  ChannelMember,
  Message,
  SendMessageForm,
  MessageReaction,
  TypingUser,
  ApiResponse,
  PaginatedResponse,
  SearchOptions,
  SearchResult,
} from '@/types/communication'

// Channel API
export const channelApi = {
  /**
   * Get all channels
   */
  async getChannels(): Promise<ApiResponse<Channel[]>> {
    try {
      const response = await api.get('/channels')
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch channels',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Get channel by ID
   */
  async getChannel(channelId: string): Promise<ApiResponse<Channel>> {
    try {
      const response = await api.get(`/channels/${channelId}`)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Create channel
   */
  async createChannel(data: CreateChannelForm): Promise<ApiResponse<Channel>> {
    try {
      const response = await api.post('/channels', data)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Update channel
   */
  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<ApiResponse<Channel>> {
    try {
      const response = await api.put(`/channels/${channelId}`, updates)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Delete channel
   */
  async deleteChannel(channelId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/channels/${channelId}`)
      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Join channel
   */
  async joinChannel(channelId: string): Promise<ApiResponse<ChannelMember>> {
    try {
      const response = await api.post(`/channels/${channelId}/join`)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to join channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Leave channel
   */
  async leaveChannel(channelId: string): Promise<ApiResponse<void>> {
    try {
      await api.post(`/channels/${channelId}/leave`)
      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to leave channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Get channel members
   */
  async getChannelMembers(channelId: string): Promise<ApiResponse<ChannelMember[]>> {
    try {
      const response = await api.get(`/channels/${channelId}/members`)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to fetch channel members',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Add member to channel
   */
  async addChannelMember(channelId: string, userId: string): Promise<ApiResponse<ChannelMember>> {
    try {
      const response = await api.post(`/channels/${channelId}/members`, { userId })
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to add member to channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Remove member from channel
   */
  async removeChannelMember(channelId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/channels/${channelId}/members/${userId}`)
      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to remove member from channel',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    channelId: string,
    userId: string,
    role: 'owner' | 'admin' | 'moderator' | 'member',
  ): Promise<ApiResponse<ChannelMember>> {
    try {
      const response = await api.put(`/channels/${channelId}/members/${userId}/role`, { role })
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update member role',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },
}

// Message API
export const messageApi = {
  /**
   * Get messages for channel
   */
  async getMessages(
    channelId: string,
    options: {
      limit?: number
      before?: string
      after?: string
    } = {},
  ): Promise<ApiResponse<Message[]>> {
    try {
      const params = new URLSearchParams()
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.before) params.append('before', options.before)
      if (options.after) params.append('after', options.after)

      const response = await api.get(`/channels/${channelId}/messages?${params}`)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch messages',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Send message
   */
  async sendMessage(channelId: string, data: SendMessageForm): Promise<ApiResponse<Message>> {
    try {
      const formData = new FormData()
      formData.append('content', data.content)
      formData.append('type', data.type)

      if (data.attachments) {
        data.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file)
        })
      }

      const response = await api.post(`/channels/${channelId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send message',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Update message
   */
  async updateMessage(
    channelId: string,
    messageId: string,
    updates: { content?: string; type?: string },
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await api.put(`/channels/${channelId}/messages/${messageId}`, updates)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update message',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Delete message
   */
  async deleteMessage(channelId: string, messageId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/channels/${channelId}/messages/${messageId}`)
      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete message',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Add reaction to message
   */
  async addReaction(
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<ApiResponse<MessageReaction>> {
    try {
      const response = await api.post(`/channels/${channelId}/messages/${messageId}/reactions`, {
        emoji,
      })
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to add reaction',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Remove reaction from message
   */
  async removeReaction(
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/channels/${channelId}/messages/${messageId}/reactions/${emoji}`)
      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to remove reaction',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Mark messages as read
   */
  async markAsRead(channelId: string, messageId?: string): Promise<ApiResponse<void>> {
    try {
      const data = messageId ? { messageId } : {}
      await api.post(`/channels/${channelId}/messages/read`, data)
      return {
        success: true,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to mark messages as read',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },

  /**
   * Search messages
   */
  async searchMessages(
    channelId: string,
    query: string,
    options: {
      limit?: number
      before?: string
      after?: string
    } = {},
  ): Promise<ApiResponse<Message[]>> {
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.before) params.append('before', options.before)
      if (options.after) params.append('after', options.after)

      const response = await api.get(`/channels/${channelId}/messages/search?${params}`)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to search messages',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },
}

// Typing API
export const typingApi = {
  /**
   * Send typing indicator
   */
  async sendTyping(channelId: string, isTyping: boolean): Promise<ApiResponse<TypingUser>> {
    try {
      const response = await api.post(`/channels/${channelId}/typing`, { isTyping })
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Failed to send typing indicator',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },
}

// Search API
export const searchApi = {
  /**
   * Search across all content
   */
  async search(options: SearchOptions): Promise<ApiResponse<SearchResult<any>>> {
    try {
      const params = new URLSearchParams()
      params.append('q', options.query)
      if (options.channelId) params.append('channelId', options.channelId)
      if (options.userId) params.append('userId', options.userId)
      if (options.type) params.append('type', options.type)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())
      if (options.sortBy) params.append('sortBy', options.sortBy)
      if (options.sortOrder) params.append('sortOrder', options.sortOrder)

      const response = await api.get(`/search?${params}`)
      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to search',
        error: error.message,
        timestamp: new Date(),
      }
    }
  },
}

// Export all APIs
export const communicationApi = {
  channels: channelApi,
  messages: messageApi,
  typing: typingApi,
  search: searchApi,
}

export default communicationApi
