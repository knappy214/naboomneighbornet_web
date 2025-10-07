import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  getCommunityHubWebSocket,
  destroyCommunityHubWebSocket,
  onThreadCreated,
  onPostCreated,
  onUserTyping,
  onUserStoppedTyping,
  onPresenceOnline,
  onPresenceOffline,
  onNotificationReceived,
  type WebSocketEvent,
  type WebSocketStatus,
} from '@/services/communityHubWebSocket'
import * as communityHubAPI from '@/services/communityHub'
import type { Channel, Thread, Post, Event, Alert } from '@/services/communityHub'

export interface TypingUser {
  id: string
  name: string
  channelId: string
  threadId?: string
  timestamp: number
}

export interface OnlineUser {
  id: string
  name: string
  status: 'online' | 'away' | 'busy'
  lastSeen: number
}

export interface NotificationData {
  id: string
  title: string
  body: string
  icon?: string
  data?: any
  timestamp: number
}

export function useCommunityHub() {
  const authStore = useAuthStore()

  // Reactive state
  const isConnected = ref(false)
  const connectionStatus = ref<WebSocketStatus>('offline')
  const channels = ref<Channel[]>([])
  const threads = ref<Thread[]>([])
  const posts = ref<Post[]>([])
  const events = ref<Event[]>([])
  const alerts = ref<Alert[]>([])
  const typingUsers = ref<Map<string, TypingUser[]>>(new Map())
  const onlineUsers = ref<Map<string, OnlineUser[]>>(new Map())
  const notifications = ref<NotificationData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // WebSocket instance
  let ws: ReturnType<typeof getCommunityHubWebSocket> | null = null

  // Computed properties
  const activeChannels = computed(() => channels.value.filter((channel) => channel.is_active))

  const upcomingEvents = computed(() => {
    const now = new Date()
    return events.value.filter((event) => new Date(event.event_date) > now)
  })

  const activeAlerts = computed(() => alerts.value.filter((alert) => alert.created_at))

  const totalUnreadCount = computed(() =>
    channels.value.reduce((total, channel) => total + (channel.member_count || 0), 0),
  )

  // WebSocket event handlers
  const handleThreadCreated = (event: WebSocketEvent) => {
    if (event.data.thread) {
      threads.value.unshift(event.data.thread)
    }
  }

  const handlePostCreated = (event: WebSocketEvent) => {
    if (event.data.post) {
      posts.value.unshift(event.data.post)
    }
  }

  const handleUserTyping = (event: WebSocketEvent) => {
    const { channelId, threadId, user } = event.data
    const key = threadId ? `${channelId}-${threadId}` : channelId

    if (!typingUsers.value.has(key)) {
      typingUsers.value.set(key, [])
    }

    const users = typingUsers.value.get(key)!
    const existingIndex = users.findIndex((u) => u.id === user.id)

    const typingUser: TypingUser = {
      id: user.id,
      name: user.name || user.username,
      channelId,
      threadId,
      timestamp: Date.now(),
    }

    if (existingIndex >= 0) {
      users[existingIndex] = typingUser
    } else {
      users.push(typingUser)
    }

    // Remove typing indicator after 3 seconds
    setTimeout(() => {
      const currentUsers = typingUsers.value.get(key)
      if (currentUsers) {
        const index = currentUsers.findIndex((u) => u.id === user.id)
        if (index >= 0) {
          currentUsers.splice(index, 1)
        }
      }
    }, 3000)
  }

  const handleUserStoppedTyping = (event: WebSocketEvent) => {
    const { channelId, threadId, user } = event.data
    const key = threadId ? `${channelId}-${threadId}` : channelId

    const users = typingUsers.value.get(key)
    if (users) {
      const index = users.findIndex((u) => u.id === user.id)
      if (index >= 0) {
        users.splice(index, 1)
      }
    }
  }

  const handlePresenceOnline = (event: WebSocketEvent) => {
    const { user, channelId } = event.data

    if (!onlineUsers.value.has(channelId)) {
      onlineUsers.value.set(channelId, [])
    }

    const users = onlineUsers.value.get(channelId)!
    const existingIndex = users.findIndex((u) => u.id === user.id)

    const onlineUser: OnlineUser = {
      id: user.id,
      name: user.name || user.username,
      status: 'online',
      lastSeen: Date.now(),
    }

    if (existingIndex >= 0) {
      users[existingIndex] = onlineUser
    } else {
      users.push(onlineUser)
    }
  }

  const handlePresenceOffline = (event: WebSocketEvent) => {
    const { user, channelId } = event.data

    const users = onlineUsers.value.get(channelId)
    if (users) {
      const index = users.findIndex((u) => u.id === user.id)
      if (index >= 0) {
        users.splice(index, 1)
      }
    }
  }

  const handleNotificationReceived = (event: WebSocketEvent) => {
    if (event.data.notification) {
      const notification: NotificationData = {
        id: event.data.notification.id || crypto.randomUUID(),
        title: event.data.notification.title,
        body: event.data.notification.body || event.data.notification.message,
        icon: event.data.notification.icon,
        data: event.data.notification.data,
        timestamp: Date.now(),
      }

      notifications.value.unshift(notification)

      // Keep only last 50 notifications
      if (notifications.value.length > 50) {
        notifications.value = notifications.value.slice(0, 50)
      }
    }
  }

  // API methods
  const loadChannels = async () => {
    try {
      loading.value = true
      error.value = null
      channels.value = await communityHubAPI.getChannels()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load channels'
      console.error('Failed to load channels:', err)
    } finally {
      loading.value = false
    }
  }

  const loadThreads = async (channelId?: number) => {
    try {
      loading.value = true
      error.value = null
      const params = channelId ? { channel: channelId } : {}
      threads.value = await communityHubAPI.getThreads(params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load threads'
      console.error('Failed to load threads:', err)
    } finally {
      loading.value = false
    }
  }

  const loadPosts = async (threadId: number) => {
    try {
      loading.value = true
      error.value = null
      posts.value = await communityHubAPI.getPosts({ thread: threadId })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load posts'
      console.error('Failed to load posts:', err)
    } finally {
      loading.value = false
    }
  }

  const loadEvents = async () => {
    try {
      loading.value = true
      error.value = null
      events.value = await communityHubAPI.getEvents()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load events'
      console.error('Failed to load events:', err)
    } finally {
      loading.value = false
    }
  }

  const loadAlerts = async () => {
    try {
      loading.value = true
      error.value = null
      alerts.value = await communityHubAPI.getAlerts()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load alerts'
      console.error('Failed to load alerts:', err)
    } finally {
      loading.value = false
    }
  }

  // WebSocket methods
  const joinChannel = (channelId: string) => {
    if (ws) {
      ws.joinChannel(channelId)
    }
  }

  const leaveChannel = (channelId: string) => {
    if (ws) {
      ws.leaveChannel(channelId)
    }
  }

  const sendTyping = (channelId: string, threadId?: string) => {
    if (ws) {
      ws.sendTyping(channelId, threadId)
    }
  }

  const sendStopTyping = (channelId: string, threadId?: string) => {
    if (ws) {
      ws.sendStopTyping(channelId, threadId)
    }
  }

  const updatePresence = (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (ws) {
      ws.updatePresence(status)
    }
  }

  const markMessageAsRead = (channelId: string, messageId: string) => {
    if (ws) {
      ws.markMessageAsRead(channelId, messageId)
    }
  }

  const markMessageAsDelivered = (channelId: string, messageId: string) => {
    if (ws) {
      ws.markMessageAsDelivered(channelId, messageId)
    }
  }

  // Utility methods
  const getTypingUsers = (channelId: string, threadId?: string) => {
    const key = threadId ? `${channelId}-${threadId}` : channelId
    return typingUsers.value.get(key) || []
  }

  const getOnlineUsers = (channelId: string) => {
    return onlineUsers.value.get(channelId) || []
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const clearError = () => {
    error.value = null
  }

  // Lifecycle
  onMounted(async () => {
    try {
      if (authStore.isAuthenticated) {
        // Initialize WebSocket
        ws = getCommunityHubWebSocket()

        // Set up event listeners
        const unsubscribeThreadCreated = onThreadCreated(handleThreadCreated)
        const unsubscribePostCreated = onPostCreated(handlePostCreated)
        const unsubscribeUserTyping = onUserTyping(handleUserTyping)
        const unsubscribeUserStoppedTyping = onUserStoppedTyping(handleUserStoppedTyping)
        const unsubscribePresenceOnline = onPresenceOnline(handlePresenceOnline)
        const unsubscribePresenceOffline = onPresenceOffline(handlePresenceOffline)
        const unsubscribeNotificationReceived = onNotificationReceived(handleNotificationReceived)

        // Watch connection status
        const statusInterval = setInterval(() => {
          if (ws) {
            isConnected.value = ws.isConnected()
            connectionStatus.value = ws.getStatus()
          }
        }, 1000)

        // Load initial data
        await Promise.all([loadChannels(), loadEvents(), loadAlerts()])

        // Cleanup function
        onUnmounted(() => {
          unsubscribeThreadCreated()
          unsubscribePostCreated()
          unsubscribeUserTyping()
          unsubscribeUserStoppedTyping()
          unsubscribePresenceOnline()
          unsubscribePresenceOffline()
          unsubscribeNotificationReceived()
          clearInterval(statusInterval)
        })
      }
    } catch (error) {
      console.error('Error initializing Community Hub:', error)
      error.value = error instanceof Error ? error.message : 'Failed to initialize Community Hub'
    }
  })

  onUnmounted(() => {
    if (ws) {
      destroyCommunityHubWebSocket()
      ws = null
    }
  })

  // Watch authentication status
  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth && !ws) {
        ws = getCommunityHubWebSocket()
      } else if (!isAuth && ws) {
        destroyCommunityHubWebSocket()
        ws = null
      }
    },
  )

  return {
    // State
    isConnected,
    connectionStatus,
    channels,
    threads,
    posts,
    events,
    alerts,
    typingUsers,
    onlineUsers,
    notifications,
    loading,
    error,

    // Computed
    activeChannels,
    upcomingEvents,
    activeAlerts,
    totalUnreadCount,

    // Methods
    loadChannels,
    loadThreads,
    loadPosts,
    loadEvents,
    loadAlerts,
    joinChannel,
    leaveChannel,
    sendTyping,
    sendStopTyping,
    updatePresence,
    markMessageAsRead,
    markMessageAsDelivered,
    getTypingUsers,
    getOnlineUsers,
    clearNotifications,
    clearError,
  }
}
