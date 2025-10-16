/**
 * Channel Service
 * Handles channel-specific operations and real-time updates
 * Part of User Story 1: Real-Time Discussion Channels
 */

import { communicationApi } from '@/services/communication'
import type { Channel, CreateChannelForm, ChannelMember, ApiResponse } from '@/types/communication'

export class ChannelService {
  private channels: Map<string, Channel> = new Map()
  private listeners: Map<string, Set<(channel: Channel) => void>> = new Map()

  /**
   * Get all channels
   */
  async getChannels(): Promise<Channel[]> {
    try {
      const response = await communicationApi.channels.getChannels()

      if (response.success && response.data) {
        // Update local cache
        response.data.forEach((channel) => {
          this.channels.set(channel.id, channel)
        })

        return response.data
      }

      throw new Error(response.message || 'Failed to fetch channels')
    } catch (error) {
      console.error('Failed to get channels:', error)
      throw error
    }
  }

  /**
   * Get channel by ID
   */
  async getChannel(channelId: string): Promise<Channel> {
    try {
      // Check cache first
      const cachedChannel = this.channels.get(channelId)
      if (cachedChannel) {
        return cachedChannel
      }

      const response = await communicationApi.channels.getChannel(channelId)

      if (response.success && response.data) {
        // Update cache
        this.channels.set(channelId, response.data)
        return response.data
      }

      throw new Error(response.message || 'Failed to fetch channel')
    } catch (error) {
      console.error('Failed to get channel:', error)
      throw error
    }
  }

  /**
   * Create a new channel
   */
  async createChannel(data: CreateChannelForm): Promise<Channel> {
    try {
      const response = await communicationApi.channels.createChannel(data)

      if (response.success && response.data) {
        // Update cache
        this.channels.set(response.data.id, response.data)

        // Notify listeners
        this.notifyListeners('channel_created', response.data)

        return response.data
      }

      throw new Error(response.message || 'Failed to create channel')
    } catch (error) {
      console.error('Failed to create channel:', error)
      throw error
    }
  }

  /**
   * Update channel
   */
  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
    try {
      const response = await communicationApi.channels.updateChannel(channelId, updates)

      if (response.success && response.data) {
        // Update cache
        this.channels.set(channelId, response.data)

        // Notify listeners
        this.notifyListeners('channel_updated', response.data)

        return response.data
      }

      throw new Error(response.message || 'Failed to update channel')
    } catch (error) {
      console.error('Failed to update channel:', error)
      throw error
    }
  }

  /**
   * Delete channel
   */
  async deleteChannel(channelId: string): Promise<void> {
    try {
      const response = await communicationApi.channels.deleteChannel(channelId)

      if (response.success) {
        // Remove from cache
        this.channels.delete(channelId)

        // Notify listeners
        this.notifyListeners('channel_deleted', { id: channelId } as Channel)
      } else {
        throw new Error(response.message || 'Failed to delete channel')
      }
    } catch (error) {
      console.error('Failed to delete channel:', error)
      throw error
    }
  }

  /**
   * Join channel
   */
  async joinChannel(channelId: string): Promise<ChannelMember> {
    try {
      const response = await communicationApi.channels.joinChannel(channelId)

      if (response.success && response.data) {
        // Update channel in cache
        const channel = this.channels.get(channelId)
        if (channel) {
          // Add member to channel
          channel.members.push(response.data)
          this.channels.set(channelId, channel)

          // Notify listeners
          this.notifyListeners('member_added', channel)
        }

        return response.data
      }

      throw new Error(response.message || 'Failed to join channel')
    } catch (error) {
      console.error('Failed to join channel:', error)
      throw error
    }
  }

  /**
   * Leave channel
   */
  async leaveChannel(channelId: string): Promise<void> {
    try {
      const response = await communicationApi.channels.leaveChannel(channelId)

      if (response.success) {
        // Update channel in cache
        const channel = this.channels.get(channelId)
        if (channel) {
          // Remove member from channel
          // This would need the current user ID
          // channel.members = channel.members.filter(m => m.userId !== currentUserId)
          this.channels.set(channelId, channel)

          // Notify listeners
          this.notifyListeners('member_removed', channel)
        }
      } else {
        throw new Error(response.message || 'Failed to leave channel')
      }
    } catch (error) {
      console.error('Failed to leave channel:', error)
      throw error
    }
  }

  /**
   * Get channel members
   */
  async getChannelMembers(channelId: string): Promise<ChannelMember[]> {
    try {
      const response = await communicationApi.channels.getChannelMembers(channelId)

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to fetch channel members')
    } catch (error) {
      console.error('Failed to get channel members:', error)
      throw error
    }
  }

  /**
   * Add member to channel
   */
  async addChannelMember(channelId: string, userId: string): Promise<ChannelMember> {
    try {
      const response = await communicationApi.channels.addChannelMember(channelId, userId)

      if (response.success && response.data) {
        // Update channel in cache
        const channel = this.channels.get(channelId)
        if (channel) {
          channel.members.push(response.data)
          this.channels.set(channelId, channel)

          // Notify listeners
          this.notifyListeners('member_added', channel)
        }

        return response.data
      }

      throw new Error(response.message || 'Failed to add member to channel')
    } catch (error) {
      console.error('Failed to add channel member:', error)
      throw error
    }
  }

  /**
   * Remove member from channel
   */
  async removeChannelMember(channelId: string, userId: string): Promise<void> {
    try {
      const response = await communicationApi.channels.removeChannelMember(channelId, userId)

      if (response.success) {
        // Update channel in cache
        const channel = this.channels.get(channelId)
        if (channel) {
          channel.members = channel.members.filter((m) => m.userId !== userId)
          this.channels.set(channelId, channel)

          // Notify listeners
          this.notifyListeners('member_removed', channel)
        }
      } else {
        throw new Error(response.message || 'Failed to remove member from channel')
      }
    } catch (error) {
      console.error('Failed to remove channel member:', error)
      throw error
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    channelId: string,
    userId: string,
    role: 'owner' | 'admin' | 'moderator' | 'member',
  ): Promise<ChannelMember> {
    try {
      const response = await communicationApi.channels.updateMemberRole(channelId, userId, role)

      if (response.success && response.data) {
        // Update channel in cache
        const channel = this.channels.get(channelId)
        if (channel) {
          const memberIndex = channel.members.findIndex((m) => m.userId === userId)
          if (memberIndex !== -1) {
            channel.members[memberIndex] = response.data
            this.channels.set(channelId, channel)

            // Notify listeners
            this.notifyListeners('member_role_updated', channel)
          }
        }

        return response.data
      }

      throw new Error(response.message || 'Failed to update member role')
    } catch (error) {
      console.error('Failed to update member role:', error)
      throw error
    }
  }

  /**
   * Get cached channel
   */
  getCachedChannel(channelId: string): Channel | undefined {
    return this.channels.get(channelId)
  }

  /**
   * Get all cached channels
   */
  getCachedChannels(): Channel[] {
    return Array.from(this.channels.values())
  }

  /**
   * Subscribe to channel updates
   */
  subscribe(event: string, callback: (channel: Channel) => void): () => void {
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
  private notifyListeners(event: string, channel: Channel): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(channel)
        } catch (error) {
          console.error('Error in channel listener:', error)
        }
      })
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.channels.clear()
  }

  /**
   * Get channel statistics
   */
  getChannelStats(channelId: string): {
    memberCount: number
    isOnline: boolean
    lastActivity?: Date
  } {
    const channel = this.channels.get(channelId)
    if (!channel) {
      return { memberCount: 0, isOnline: false }
    }

    return {
      memberCount: channel.members.length,
      isOnline: true, // This would check actual online status
      lastActivity: channel.updatedAt,
    }
  }
}

// Export singleton instance
export const channelService = new ChannelService()
export default channelService
