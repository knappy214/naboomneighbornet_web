/**
 * Typing Service
 * Handles typing indicators and real-time typing status
 * Part of User Story 1: Real-Time Discussion Channels
 */

import { communicationApi } from '@/services/communication'
import type { TypingUser, ApiResponse } from '@/types/communication'

export class TypingService {
  private typingUsers: Map<string, Set<TypingUser>> = new Map() // channelId -> typing users
  private listeners: Map<string, Set<(users: TypingUser[]) => void>> = new Map()
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map() // userId -> timeout

  /**
   * Send typing indicator
   */
  async sendTyping(channelId: string, isTyping: boolean): Promise<void> {
    try {
      const response = await communicationApi.typing.sendTyping(channelId, isTyping)

      if (response.success) {
        // Update local state
        if (isTyping) {
          this.addTypingUser(channelId, response.data)
        } else {
          this.removeTypingUser(channelId, response.data.userId)
        }
      } else {
        throw new Error(response.message || 'Failed to send typing indicator')
      }
    } catch (error) {
      console.error('Failed to send typing indicator:', error)
      throw error
    }
  }

  /**
   * Get typing users for channel
   */
  getTypingUsers(channelId: string): TypingUser[] {
    const users = this.typingUsers.get(channelId)
    return users ? Array.from(users) : []
  }

  /**
   * Add typing user
   */
  private addTypingUser(channelId: string, user: TypingUser): void {
    if (!this.typingUsers.has(channelId)) {
      this.typingUsers.set(channelId, new Set())
    }

    const channelTypingUsers = this.typingUsers.get(channelId)!
    channelTypingUsers.add(user)

    // Set timeout to remove user after 3 seconds of inactivity
    const timeoutId = setTimeout(() => {
      this.removeTypingUser(channelId, user.userId)
    }, 3000)

    // Clear existing timeout for this user
    const existingTimeout = this.typingTimeouts.get(user.userId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    this.typingTimeouts.set(user.userId, timeoutId)

    // Notify listeners
    this.notifyListeners('typing_users_changed', channelId, Array.from(channelTypingUsers))
  }

  /**
   * Remove typing user
   */
  private removeTypingUser(channelId: string, userId: string): void {
    const channelTypingUsers = this.typingUsers.get(channelId)
    if (channelTypingUsers) {
      channelTypingUsers.forEach((user) => {
        if (user.userId === userId) {
          channelTypingUsers.delete(user)
        }
      })

      // Notify listeners
      this.notifyListeners('typing_users_changed', channelId, Array.from(channelTypingUsers))
    }

    // Clear timeout
    const timeout = this.typingTimeouts.get(userId)
    if (timeout) {
      clearTimeout(timeout)
      this.typingTimeouts.delete(userId)
    }
  }

  /**
   * Subscribe to typing updates
   */
  subscribe(event: string, callback: (users: TypingUser[]) => void): () => void {
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
  private notifyListeners(event: string, channelId: string, users: TypingUser[]): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(users)
        } catch (error) {
          console.error('Error in typing listener:', error)
        }
      })
    }
  }

  /**
   * Clear typing users for channel
   */
  clearChannelTyping(channelId: string): void {
    const channelTypingUsers = this.typingUsers.get(channelId)
    if (channelTypingUsers) {
      // Clear timeouts for all users in this channel
      channelTypingUsers.forEach((user) => {
        const timeout = this.typingTimeouts.get(user.userId)
        if (timeout) {
          clearTimeout(timeout)
          this.typingTimeouts.delete(user.userId)
        }
      })

      channelTypingUsers.clear()
      this.notifyListeners('typing_users_changed', channelId, [])
    }
  }

  /**
   * Clear all typing users
   */
  clearAllTyping(): void {
    // Clear all timeouts
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.typingTimeouts.clear()

    // Clear all typing users
    this.typingUsers.forEach((users, channelId) => {
      users.clear()
      this.notifyListeners('typing_users_changed', channelId, [])
    })
    this.typingUsers.clear()
  }

  /**
   * Get typing count for channel
   */
  getTypingCount(channelId: string): number {
    const users = this.typingUsers.get(channelId)
    return users ? users.size : 0
  }

  /**
   * Check if user is typing in channel
   */
  isUserTyping(channelId: string, userId: string): boolean {
    const users = this.typingUsers.get(channelId)
    if (!users) return false

    return Array.from(users).some((user) => user.userId === userId)
  }

  /**
   * Get typing users display text
   */
  getTypingDisplayText(channelId: string, currentUserId?: string): string {
    const users = this.getTypingUsers(channelId)
    const otherUsers = users.filter((user) => user.userId !== currentUserId)

    if (otherUsers.length === 0) {
      return ''
    }

    if (otherUsers.length === 1) {
      return `${otherUsers[0].username} is typing...`
    } else if (otherUsers.length === 2) {
      return `${otherUsers[0].username} and ${otherUsers[1].username} are typing...`
    } else {
      return `${otherUsers[0].username} and ${otherUsers.length - 1} others are typing...`
    }
  }
}

// Export singleton instance
export const typingService = new TypingService()
export default typingService
