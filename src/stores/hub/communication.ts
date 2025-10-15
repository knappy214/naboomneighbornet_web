/**
 * Communication Hub Store
 * Manages all communication-related state including channels, messages, users, and events
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { useWebSocket } from '@/lib/websocket'
import communicationApi from '@/services/communication'
import type {
  Channel,
  Message,
  UserProfile,
  Event,
  SearchResult,
  CreateChannelForm,
  CreateEventForm,
  SendMessageForm,
  SearchQuery,
  CommunicationState,
  WebSocketConfig,
  TypingIndicator,
  PresenceUpdate,
  MessageReaction,
  MessageReply,
  ChannelMember,
  EventAttendee,
  UserPreferences,
  NotificationSettings,
  ApiError,
} from '@/types/communication'

export const useCommunicationStore = defineStore('communication', () => {
  // ============================================================================
  // State
  // ============================================================================

  const state = reactive<CommunicationState>({
    channels: [],
    messages: {},
    users: {},
    events: [],
    currentChannel: undefined,
    currentUser: undefined,
    isOnline: navigator.onLine,
    typingUsers: {},
    offlineQueue: {
      messages: [],
      isOnline: navigator.onLine,
      pendingCount: 0,
    },
    searchResults: undefined,
    isLoading: false,
    error: undefined,
  })

  // WebSocket service
  const wsConfig: WebSocketConfig = {
    url: import.meta.env.VITE_WS_URL || 'wss://naboomneighbornet.net.za/ws/communication/',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    debug: import.meta.env.DEV,
  }

  const ws = useWebSocket(wsConfig)

  // ============================================================================
  // Getters
  // ============================================================================

  const currentChannelMessages = computed(() => {
    if (!state.currentChannel) return []
    return state.messages[state.currentChannel] || []
  })

  const currentChannelData = computed(() => {
    if (!state.currentChannel) return undefined
    return state.channels.find(c => c.id === state.currentChannel)
  })

  const unreadCount = computed(() => {
    return state.channels.reduce((total, channel) => {
      const messages = state.messages[channel.id] || []
      const unread = messages.filter(msg => 
        msg.userId !== state.currentUser?.id && 
        !msg.readBy?.includes(state.currentUser?.id || '')
      ).length
      return total + unread
    }, 0)
  })

  const onlineUsers = computed(() => {
    return Object.values(state.users).filter(user => user.status === 'online')
  })

  const typingUsersInCurrentChannel = computed(() => {
    if (!state.currentChannel) return []
    return state.typingUsers[state.currentChannel] || []
  })

  const pendingMessages = computed(() => {
    return state.offlineQueue.messages.filter(msg => msg.priority === 'high').length
  })

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Initialize the communication store
   */
  async function initialize() {
    state.isLoading = true
    state.error = undefined

    try {
      // Connect to WebSocket
      await ws.connect()

      // Load initial data
      await Promise.all([
        loadChannels(),
        loadCurrentUser(),
        loadEvents(),
      ])

      // Setup WebSocket listeners
      setupWebSocketListeners()

      // Setup online/offline listeners
      setupNetworkListeners()

    } catch (error) {
      state.error = {
        code: 'INITIALIZATION_FAILED',
        message: 'Failed to initialize communication store',
        details: error,
      }
      console.error('Failed to initialize communication store:', error)
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Load all channels
   */
  async function loadChannels() {
    try {
      const response = await communicationApi.channels.getChannels()
      if (response.success && response.data) {
        state.channels = response.data
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
      throw error
    }
  }

  /**
   * Load current user profile
   */
  async function loadCurrentUser() {
    try {
      const response = await communicationApi.users.getCurrentUser()
      if (response.success && response.data) {
        state.currentUser = response.data
        state.users[response.data.id] = response.data
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
      throw error
    }
  }

  /**
   * Load events
   */
  async function loadEvents() {
    try {
      const response = await communicationApi.events.getEvents()
      if (response.success && response.data) {
        state.events = response.data.data || []
      }
    } catch (error) {
      console.error('Failed to load events:', error)
      throw error
    }
  }

  /**
   * Load messages for a channel
   */
  async function loadMessages(channelId: string, params?: { page?: number; limit?: number }) {
    try {
      const response = await communicationApi.messages.getMessages(channelId, params)
      if (response.success && response.data) {
        const messages = response.data.data || []
        if (params?.page && params.page > 1) {
          // Append to existing messages for pagination
          state.messages[channelId] = [...(state.messages[channelId] || []), ...messages]
        } else {
          // Replace messages for initial load
          state.messages[channelId] = messages
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      throw error
    }
  }

  /**
   * Switch to a channel
   */
  async function switchToChannel(channelId: string) {
    state.currentChannel = channelId
    
    // Load messages if not already loaded
    if (!state.messages[channelId]) {
      await loadMessages(channelId)
    }

    // Mark channel as read
    await markChannelAsRead(channelId)
  }

  /**
   * Send a message
   */
  async function sendMessage(data: SendMessageForm) {
    if (!state.currentChannel) {
      throw new Error('No channel selected')
    }

    try {
      const response = await communicationApi.messages.sendMessage(state.currentChannel, data)
      if (response.success && response.data) {
        // Add message to local state
        if (!state.messages[state.currentChannel]) {
          state.messages[state.currentChannel] = []
        }
        state.messages[state.currentChannel].push(response.data)
        
        // Send via WebSocket for real-time updates
        ws.sendMessage(response.data)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  /**
   * Create a new channel
   */
  async function createChannel(data: CreateChannelForm) {
    try {
      const response = await communicationApi.channels.createChannel(data)
      if (response.success && response.data) {
        state.channels.push(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Failed to create channel:', error)
      throw error
    }
  }

  /**
   * Create a new event
   */
  async function createEvent(data: CreateEventForm) {
    try {
      const response = await communicationApi.events.createEvent(data)
      if (response.success && response.data) {
        state.events.push(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Failed to create event:', error)
      throw error
    }
  }

  /**
   * Search messages
   */
  async function searchMessages(query: SearchQuery) {
    try {
      const response = await communicationApi.search.searchMessages(query)
      if (response.success && response.data) {
        state.searchResults = response.data
        return response.data
      }
    } catch (error) {
      console.error('Failed to search messages:', error)
      throw error
    }
  }

  /**
   * Mark channel as read
   */
  async function markChannelAsRead(channelId: string) {
    try {
      await communicationApi.messages.markChannelAsRead(channelId)
    } catch (error) {
      console.error('Failed to mark channel as read:', error)
    }
  }

  /**
   * Add reaction to message
   */
  async function addReaction(channelId: string, messageId: string, emoji: string) {
    try {
      const response = await communicationApi.messages.addReaction(channelId, messageId, emoji)
      if (response.success && response.data) {
        // Update local message
        const messages = state.messages[channelId] || []
        const messageIndex = messages.findIndex(m => m.id === messageId)
        if (messageIndex !== -1) {
          const existingReaction = messages[messageIndex].reactions.find(r => r.emoji === emoji)
          if (existingReaction) {
            existingReaction.count = response.data.count
            existingReaction.users = response.data.users
          } else {
            messages[messageIndex].reactions.push(response.data)
          }
        }
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
      throw error
    }
  }

  /**
   * Update user preferences
   */
  async function updatePreferences(data: Partial<UserPreferences>) {
    if (!state.currentUser) return

    try {
      const response = await communicationApi.users.updatePreferences(data)
      if (response.success && response.data) {
        state.currentUser.preferences = { ...state.currentUser.preferences, ...response.data }
        state.users[state.currentUser.id] = state.currentUser
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }

  /**
   * Update notification settings
   */
  async function updateNotificationSettings(data: Partial<NotificationSettings>) {
    if (!state.currentUser) return

    try {
      const response = await communicationApi.users.updateNotificationSettings(data)
      if (response.success && response.data) {
        state.currentUser.preferences.notifications = { 
          ...state.currentUser.preferences.notifications, 
          ...response.data 
        }
        state.users[state.currentUser.id] = state.currentUser
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      throw error
    }
  }

  /**
   * Setup WebSocket listeners
   */
  function setupWebSocketListeners() {
    // Message events
    ws.onMessage((message: Message) => {
      if (message.channelId && state.messages[message.channelId]) {
        state.messages[message.channelId].push(message)
      }
    })

    ws.onMessageUpdate((message: Message) => {
      if (message.channelId && state.messages[message.channelId]) {
        const index = state.messages[message.channelId].findIndex(m => m.id === message.id)
        if (index !== -1) {
          state.messages[message.channelId][index] = message
        }
      }
    })

    ws.onMessageDelete((messageId: string) => {
      Object.keys(state.messages).forEach(channelId => {
        const index = state.messages[channelId].findIndex(m => m.id === messageId)
        if (index !== -1) {
          state.messages[channelId].splice(index, 1)
        }
      })
    })

    // Typing indicators
    ws.onTyping((indicator: TypingIndicator) => {
      if (!state.typingUsers[indicator.channelId]) {
        state.typingUsers[indicator.channelId] = []
      }
      
      const existingIndex = state.typingUsers[indicator.channelId].findIndex(
        t => t.userId === indicator.userId
      )

      if (indicator.isTyping) {
        if (existingIndex === -1) {
          state.typingUsers[indicator.channelId].push(indicator)
        } else {
          state.typingUsers[indicator.channelId][existingIndex] = indicator
        }
      } else {
        if (existingIndex !== -1) {
          state.typingUsers[indicator.channelId].splice(existingIndex, 1)
        }
      }
    })

    // Presence updates
    ws.onPresenceUpdate((update: PresenceUpdate) => {
      if (state.users[update.userId]) {
        state.users[update.userId].status = update.status
        state.users[update.userId].lastSeen = update.lastSeen
      }
    })

    // Channel updates
    ws.onChannelUpdate((channel: Channel) => {
      const index = state.channels.findIndex(c => c.id === channel.id)
      if (index !== -1) {
        state.channels[index] = channel
      } else {
        state.channels.push(channel)
      }
    })

    // Event updates
    ws.onEventUpdate((event: Event) => {
      const index = state.events.findIndex(e => e.id === event.id)
      if (index !== -1) {
        state.events[index] = event
      } else {
        state.events.push(event)
      }
    })
  }

  /**
   * Setup network status listeners
   */
  function setupNetworkListeners() {
    const updateOnlineStatus = () => {
      state.isOnline = navigator.onLine
      state.offlineQueue.isOnline = navigator.onLine
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Cleanup on store destruction
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }

  /**
   * Send typing indicator
   */
  function sendTyping(isTyping: boolean) {
    if (state.currentChannel) {
      ws.sendTyping(state.currentChannel, isTyping)
    }
  }

  /**
   * Send presence update
   */
  function updatePresence(status: 'online' | 'away' | 'busy' | 'offline') {
    ws.sendPresenceUpdate(status, state.currentChannel)
  }

  /**
   * Clear error
   */
  function clearError() {
    state.error = undefined
  }

  /**
   * Disconnect and cleanup
   */
  function disconnect() {
    ws.disconnect()
    state.channels = []
    state.messages = {}
    state.users = {}
    state.events = []
    state.currentChannel = undefined
    state.currentUser = undefined
    state.searchResults = undefined
    state.error = undefined
  }

  // ============================================================================
  // Return store API
  // ============================================================================

  return {
    // State
    state,
    
    // Getters
    currentChannelMessages,
    currentChannelData,
    unreadCount,
    onlineUsers,
    typingUsersInCurrentChannel,
    pendingMessages,
    
    // Actions
    initialize,
    loadChannels,
    loadCurrentUser,
    loadEvents,
    loadMessages,
    switchToChannel,
    sendMessage,
    createChannel,
    createEvent,
    searchMessages,
    markChannelAsRead,
    addReaction,
    updatePreferences,
    updateNotificationSettings,
    sendTyping,
    updatePresence,
    clearError,
    disconnect,
    
    // WebSocket
    isConnected: ws.isConnected,
    connectionState: ws.connectionState,
    error: ws.error,
  }
}, {
  persist: {
    paths: ['state.channels', 'state.users', 'state.currentUser', 'state.currentChannel'],
  },
})
