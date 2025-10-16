/**
 * Message Service
 * Handles message operations and real-time updates
 * Part of User Story 1: Real-Time Discussion Channels
 */

import { communicationApi } from '@/services/communication'
import type { Message, SendMessageForm, MessageReaction, ApiResponse } from '@/types/communication'

export class MessageService {
  private messages: Map<string, Message[]> = new Map() // channelId -> messages
  private listeners: Map<string, Set<(message: Message) => void>> = new Map()

  /**
   * Get messages for a channel
   */
  async getMessages(
    channelId: string,
    options: {
      limit?: number
      before?: string
      after?: string
    } = {},
  ): Promise<Message[]> {
    try {
      const response = await communicationApi.messages.getMessages(channelId, options)

      if (response.success && response.data) {
        // Update local cache
        this.messages.set(channelId, response.data)
        return response.data
      }

      throw new Error(response.message || 'Failed to fetch messages')
    } catch (error) {
      console.error('Failed to get messages:', error)
      throw error
    }
  }

  /**
   * Send a message
   */
  async sendMessage(channelId: string, data: SendMessageForm): Promise<Message> {
    try {
      const response = await communicationApi.messages.sendMessage(channelId, data)

      if (response.success && response.data) {
        // Add to local cache
        const channelMessages = this.messages.get(channelId) || []
        channelMessages.push(response.data)
        this.messages.set(channelId, channelMessages)

        // Notify listeners
        this.notifyListeners('message_sent', response.data)

        return response.data
      }

      throw new Error(response.message || 'Failed to send message')
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  /**
   * Update a message
   */
  async updateMessage(
    channelId: string,
    messageId: string,
    updates: { content?: string; type?: string },
  ): Promise<Message> {
    try {
      const response = await communicationApi.messages.updateMessage(channelId, messageId, updates)

      if (response.success && response.data) {
        // Update local cache
        const channelMessages = this.messages.get(channelId) || []
        const messageIndex = channelMessages.findIndex((m) => m.id === messageId)
        if (messageIndex !== -1) {
          channelMessages[messageIndex] = response.data
          this.messages.set(channelId, channelMessages)

          // Notify listeners
          this.notifyListeners('message_updated', response.data)
        }

        return response.data
      }

      throw new Error(response.message || 'Failed to update message')
    } catch (error) {
      console.error('Failed to update message:', error)
      throw error
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    try {
      const response = await communicationApi.messages.deleteMessage(channelId, messageId)

      if (response.success) {
        // Remove from local cache
        const channelMessages = this.messages.get(channelId) || []
        const updatedMessages = channelMessages.filter((m) => m.id !== messageId)
        this.messages.set(channelId, updatedMessages)

        // Notify listeners
        this.notifyListeners('message_deleted', { id: messageId } as Message)
      } else {
        throw new Error(response.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(channelId: string, messageId: string, emoji: string): Promise<MessageReaction> {
    try {
      const response = await communicationApi.messages.addReaction(channelId, messageId, emoji)

      if (response.success && response.data) {
        // Update local cache
        const channelMessages = this.messages.get(channelId) || []
        const messageIndex = channelMessages.findIndex((m) => m.id === messageId)
        if (messageIndex !== -1) {
          const message = channelMessages[messageIndex]
          const existingReaction = message.reactions?.find((r) => r.emoji === emoji)

          if (existingReaction) {
            existingReaction.count++
            existingReaction.users.push(response.data.userId)
          } else {
            if (!message.reactions) message.reactions = []
            message.reactions.push({
              emoji,
              count: 1,
              users: [response.data.userId],
            })
          }

          this.messages.set(channelId, channelMessages)

          // Notify listeners
          this.notifyListeners('reaction_added', message)
        }

        return response.data
      }

      throw new Error(response.message || 'Failed to add reaction')
    } catch (error) {
      console.error('Failed to add reaction:', error)
      throw error
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    try {
      const response = await communicationApi.messages.removeReaction(channelId, messageId, emoji)

      if (response.success) {
        // Update local cache
        const channelMessages = this.messages.get(channelId) || []
        const messageIndex = channelMessages.findIndex((m) => m.id === messageId)
        if (messageIndex !== -1) {
          const message = channelMessages[messageIndex]
          if (message.reactions) {
            const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji)
            if (reactionIndex !== -1) {
              const reaction = message.reactions[reactionIndex]
              reaction.count--
              reaction.users = reaction.users.filter((id) => id !== response.data?.userId)

              if (reaction.count <= 0) {
                message.reactions.splice(reactionIndex, 1)
              }
            }
          }

          this.messages.set(channelId, channelMessages)

          // Notify listeners
          this.notifyListeners('reaction_removed', message)
        }
      } else {
        throw new Error(response.message || 'Failed to remove reaction')
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error)
      throw error
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(channelId: string, messageId?: string): Promise<void> {
    try {
      const response = await communicationApi.messages.markAsRead(channelId, messageId)

      if (response.success) {
        // Update local cache if needed
        // This would typically update read status in the messages
        this.notifyListeners('messages_read', { channelId, messageId } as Message)
      } else {
        throw new Error(response.message || 'Failed to mark messages as read')
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      throw error
    }
  }

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
  ): Promise<Message[]> {
    try {
      const response = await communicationApi.messages.searchMessages(channelId, query, options)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to search messages')
    } catch (error) {
      console.error('Failed to search messages:', error)
      throw error
    }
  }

  /**
   * Get cached messages for channel
   */
  getCachedMessages(channelId: string): Message[] {
    return this.messages.get(channelId) || []
  }

  /**
   * Get message by ID
   */
  getMessage(channelId: string, messageId: string): Message | undefined {
    const channelMessages = this.messages.get(channelId) || []
    return channelMessages.find((m) => m.id === messageId)
  }

  /**
   * Subscribe to message updates
   */
  subscribe(event: string, callback: (message: Message) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: string, message: Message): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in message listener:', error)
        }
      })
    }
  }

  /**
   * Clear messages for channel
   */
  clearChannelMessages(channelId: string): void {
    this.messages.delete(channelId)
  }

  /**
   * Clear all messages
   */
  clearAllMessages(): void {
    this.messages.clear()
  }

  /**
   * Get message count for channel
   */
  getMessageCount(channelId: string): number {
    const channelMessages = this.messages.get(channelId) || []
    return channelMessages.length
  }

  /**
   * Get unread count for channel (simplified)
   */
  getUnreadCount(channelId: string, lastReadMessageId?: string): number {
    const channelMessages = this.messages.get(channelId) || []

    if (!lastReadMessageId) {
      return channelMessages.length
    }

    const lastReadIndex = channelMessages.findIndex((m) => m.id === lastReadMessageId)
    if (lastReadIndex === -1) {
      return channelMessages.length
    }

    return channelMessages.length - lastReadIndex - 1
  }
}

// Export singleton instance
export const messageService = new MessageService()
export default messageService
