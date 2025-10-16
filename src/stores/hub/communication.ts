/**
 * Communication Store
 * Pinia store for managing communication hub state
 * Part of User Story 1: Real-Time Discussion Channels
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { channelService } from '@/services/channelService'
import { messageService } from '@/services/messageService'
import { typingService } from '@/services/typingService'
import { notificationService } from '@/services/notificationService'
import { realTimeService } from '@/services/realTimeService'
import type {
  Channel,
  Message,
  CreateChannelForm,
  SendMessageForm,
  TypingUser,
  Notification,
  ConnectionStatus,
} from '@/types/communication'

interface CommunicationState {
  // Channels
  channels: Channel[]
  currentChannel: string | null
  isLoading: boolean
  error: string | null

  // Messages
  messages: Record<string, Message[]> // channelId -> messages

  // Typing
  typingUsers: Record<string, TypingUser[]> // channelId -> typing users

  // Connection
  isOnline: boolean
  connectionStatus: ConnectionStatus

  // Current user
  currentUser: {
    id: string
    username: string
    displayName: string
    avatar?: string
  } | null
}

export const useCommunicationStore = defineStore('communication', () => {
  // State
  const state = reactive<CommunicationState>({
    channels: [],
    currentChannel: null,
    isLoading: false,
    error: null,
    messages: {},
    typingUsers: {},
    isOnline: false,
    connectionStatus: 'disconnected',
    currentUser: null,
  })

  // Getters
  const currentChannelData = computed(() => {
    if (!state.currentChannel) return null
    return state.channels.find((c) => c.id === state.currentChannel) || null
  })

  const currentChannelMessages = computed(() => {
    if (!state.currentChannel) return []
    return state.messages[state.currentChannel] || []
  })

  const typingUsersInCurrentChannel = computed(() => {
    if (!state.currentChannel) return []
    return state.typingUsers[state.currentChannel] || []
  })

  const unreadCounts = computed(() => {
    const counts: Record<string, number> = {}
    Object.keys(state.messages).forEach((channelId) => {
      counts[channelId] = messageService.getUnreadCount(channelId)
    })
    return counts
  })

  // Actions
  const initialize = async () => {
    try {
      state.isLoading = true
      state.error = null

      // Load channels
      await loadChannels()

      // Initialize real-time service
      await realTimeService.connect()

      // Subscribe to real-time events
      realTimeService.subscribe('message_received', handleMessageReceived)
      realTimeService.subscribe('typing_received', handleTypingReceived)
      realTimeService.subscribe('channel_updated', handleChannelUpdated)
      realTimeService.subscribe('connection_status_changed', handleConnectionStatusChanged)

      // Subscribe to typing updates
      typingService.subscribe('typing_users_changed', handleTypingUsersChanged)

      // Request notification permission
      await notificationService.requestPermission()

      state.isOnline = true
    } catch (error: any) {
      state.error = error.message || 'Failed to initialize communication store'
      console.error('Failed to initialize communication store:', error)
    } finally {
      state.isLoading = false
    }
  }

  const loadChannels = async () => {
    try {
      const channels = await channelService.getChannels()
      state.channels = channels
    } catch (error: any) {
      state.error = error.message || 'Failed to load channels'
      throw error
    }
  }

  const switchToChannel = async (channelId: string) => {
    try {
      state.currentChannel = channelId

      // Load messages if not already loaded
      if (!state.messages[channelId]) {
        await loadMessages(channelId)
      }

      // Join channel for real-time updates
      await realTimeService.joinChannel(channelId)

      // Mark messages as read
      await messageService.markAsRead(channelId)
    } catch (error: any) {
      state.error = error.message || 'Failed to switch to channel'
      throw error
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const messages = await messageService.getMessages(channelId)
      state.messages[channelId] = messages
    } catch (error: any) {
      state.error = error.message || 'Failed to load messages'
      throw error
    }
  }

  const sendMessage = async (data: SendMessageForm) => {
    if (!state.currentChannel) {
      throw new Error('No channel selected')
    }

    try {
      const message = await messageService.sendMessage(state.currentChannel, data)

      // Add to local state
      if (!state.messages[state.currentChannel]) {
        state.messages[state.currentChannel] = []
      }
      state.messages[state.currentChannel].push(message)

      // Show notification to other users
      if (state.currentUser) {
        await notificationService.showMessageNotification(
          currentChannelData.value?.name || 'Unknown',
          state.currentUser.displayName,
          message.content,
          state.currentChannel,
          message.id,
        )
      }
    } catch (error: any) {
      state.error = error.message || 'Failed to send message'
      throw error
    }
  }

  const createChannel = async (data: CreateChannelForm) => {
    try {
      const channel = await channelService.createChannel(data)
      state.channels.push(channel)
      return channel
    } catch (error: any) {
      state.error = error.message || 'Failed to create channel'
      throw error
    }
  }

  const updateChannel = async (channelId: string, updates: Partial<Channel>) => {
    try {
      const channel = await channelService.updateChannel(channelId, updates)
      const index = state.channels.findIndex((c) => c.id === channelId)
      if (index !== -1) {
        state.channels[index] = channel
      }
      return channel
    } catch (error: any) {
      state.error = error.message || 'Failed to update channel'
      throw error
    }
  }

  const deleteChannel = async (channelId: string) => {
    try {
      await channelService.deleteChannel(channelId)
      state.channels = state.channels.filter((c) => c.id !== channelId)

      // Clear messages and typing users
      delete state.messages[channelId]
      delete state.typingUsers[channelId]

      // Switch to another channel if this was the current one
      if (state.currentChannel === channelId) {
        state.currentChannel = state.channels.length > 0 ? state.channels[0].id : null
      }
    } catch (error: any) {
      state.error = error.message || 'Failed to delete channel'
      throw error
    }
  }

  const sendTyping = async (isTyping: boolean) => {
    if (!state.currentChannel) return

    try {
      await typingService.sendTyping(state.currentChannel, isTyping)
    } catch (error: any) {
      console.error('Failed to send typing indicator:', error)
    }
  }

  const setCurrentUser = (user: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }) => {
    state.currentUser = user
  }

  // Real-time event handlers
  const handleMessageReceived = (data: any) => {
    const message: Message = data
    const channelId = message.channelId

    if (!state.messages[channelId]) {
      state.messages[channelId] = []
    }
    state.messages[channelId].push(message)

    // Show notification if not current channel
    if (channelId !== state.currentChannel && state.currentUser) {
      const channel = state.channels.find((c) => c.id === channelId)
      if (channel) {
        notificationService.showMessageNotification(
          channel.name,
          message.displayName || message.username,
          message.content,
          channelId,
          message.id,
        )
      }
    }
  }

  const handleTypingReceived = (data: any) => {
    const { channelId, userId, username, isTyping } = data

    if (!state.typingUsers[channelId]) {
      state.typingUsers[channelId] = []
    }

    if (isTyping) {
      // Add or update typing user
      const existingIndex = state.typingUsers[channelId].findIndex((u) => u.userId === userId)
      if (existingIndex !== -1) {
        state.typingUsers[channelId][existingIndex] = { userId, username, timestamp: new Date() }
      } else {
        state.typingUsers[channelId].push({ userId, username, timestamp: new Date() })
      }
    } else {
      // Remove typing user
      state.typingUsers[channelId] = state.typingUsers[channelId].filter((u) => u.userId !== userId)
    }
  }

  const handleChannelUpdated = (data: any) => {
    const channel: Channel = data
    const index = state.channels.findIndex((c) => c.id === channel.id)
    if (index !== -1) {
      state.channels[index] = channel
    }
  }

  const handleConnectionStatusChanged = (data: any) => {
    state.connectionStatus = data.status
    state.isOnline = data.status === 'connected'
  }

  const handleTypingUsersChanged = (users: TypingUser[]) => {
    if (state.currentChannel) {
      state.typingUsers[state.currentChannel] = users
    }
  }

  // Utility methods
  const clearError = () => {
    state.error = null
  }

  const clearMessages = (channelId: string) => {
    delete state.messages[channelId]
  }

  const clearAllMessages = () => {
    state.messages = {}
  }

  const getChannelById = (channelId: string) => {
    return state.channels.find((c) => c.id === channelId)
  }

  const getMessageById = (channelId: string, messageId: string) => {
    const messages = state.messages[channelId] || []
    return messages.find((m) => m.id === messageId)
  }

  return {
    // State
    state,

    // Getters
    currentChannelData,
    currentChannelMessages,
    typingUsersInCurrentChannel,
    unreadCounts,

    // Actions
    initialize,
    loadChannels,
    switchToChannel,
    loadMessages,
    sendMessage,
    createChannel,
    updateChannel,
    deleteChannel,
    sendTyping,
    setCurrentUser,

    // Utility methods
    clearError,
    clearMessages,
    clearAllMessages,
    getChannelById,
    getMessageById,
  }
})
