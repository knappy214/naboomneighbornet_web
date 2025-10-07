import { useAuthStore } from '@/stores/auth'

export type WebSocketStatus =
  | 'offline'
  | 'connecting'
  | 'online'
  | 'reconnecting'
  | 'authenticating'

export interface WebSocketEvent {
  type:
    | 'thread.created'
    | 'thread.updated'
    | 'thread.deleted'
    | 'post.created'
    | 'post.updated'
    | 'post.deleted'
    | 'alert.created'
    | 'alert.updated'
    | 'event.created'
    | 'event.updated'
    | 'event.deleted'
    | 'channel.joined'
    | 'channel.left'
    | 'user.typing'
    | 'user.stopped_typing'
    | 'presence.online'
    | 'presence.offline'
    | 'notification.received'
    | 'message.read'
    | 'message.delivered'
    | 'auth.success'
    | 'auth.error'
    | 'ping'
    | 'pong'
  data: {
    thread?: Record<string, unknown>
    post?: Record<string, unknown>
    alert?: Record<string, unknown>
    event?: Record<string, unknown>
    channel?: Record<string, unknown>
    user?: Record<string, unknown>
    notification?: Record<string, unknown>
    timestamp?: string
    id?: string
    message?: string
  }
}

export interface WebSocketConfig {
  baseUrl: string
  maxReconnectAttempts: number
  reconnectDelay: number
  heartbeatInterval: number
  messageQueueSize: number
  enablePushNotifications: boolean
  vapidPublicKey?: string
}

export interface QueuedMessage {
  id: string
  type: string
  data: Record<string, unknown>
  timestamp: number
  retries: number
}

export class CommunityHubWebSocket {
  private ws: WebSocket | null = null
  private status: WebSocketStatus = 'offline'
  private reconnectAttempts = 0
  private config: WebSocketConfig
  private eventListeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map()
  private messageQueue: QueuedMessage[] = []
  private heartbeatInterval: number | null = null
  private lastHeartbeat: number = 0
  private isAuthenticated = false
  private pushSubscription: PushSubscription | null = null
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null

  constructor(
    config: Partial<WebSocketConfig> = {},
    private onStatusChange?: (status: WebSocketStatus) => void,
  ) {
    this.config = {
      baseUrl: 'ws://localhost:8000/ws/community-hub/',
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000, // 30 seconds
      messageQueueSize: 100,
      enablePushNotifications: true,
      vapidPublicKey:
        'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE6JkhItvbSeG5O7/2dibtUl0eTi1cAyaBgjfa7GPvtZ2KkN07zTnobf/d8P/R/DXXRZpdkA7x4mUIm4+TEGBNAg==',
      ...config,
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.setStatus('connecting')

      try {
        // Check if WebSocket is supported
        if (typeof WebSocket === 'undefined') {
          throw new Error('WebSocket is not supported in this environment')
        }

        // Check if we're in production and WebSocket might not be available
        const isProduction = window.location.hostname.includes('naboom')
        if (isProduction) {
          console.log('Production environment detected, attempting WebSocket connection...')
        }

        this.ws = new WebSocket(this.config.baseUrl)

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.warn('WebSocket connection timeout, closing connection')
            this.ws.close()
            this.setStatus('offline')
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000) // 10 second timeout

        this.ws.onopen = async () => {
          clearTimeout(connectionTimeout)
          console.log('WebSocket connected')
          this.setStatus('authenticating')
          this.reconnectAttempts = 0
          this.startHeartbeat()

          try {
            await this.authenticate()
            await this.initializePushNotifications()
            this.setStatus('online')
            this.processMessageQueue()
            resolve()
          } catch (error) {
            console.error('Authentication failed:', error)
            this.setStatus('offline')
            reject(error)
          }
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log('WebSocket closed:', event.code, event.reason)
          this.setStatus('offline')
          this.ws = null
          this.isAuthenticated = false
          this.stopHeartbeat()

          if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error('WebSocket error:', error)
          this.setStatus('offline')
          // Don't reject immediately, let the onclose handler deal with reconnection
          console.warn('WebSocket connection failed, will attempt reconnection if configured')
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error)
        this.setStatus('offline')
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.stopHeartbeat()
    this.setStatus('offline')
    this.isAuthenticated = false
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }

  private async authenticate(): Promise<void> {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (!token) {
      throw new Error('No authentication token available')
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const authMessage = {
          type: 'auth',
          token: token,
          timestamp: Date.now(),
        }

        const timeout = setTimeout(() => {
          reject(new Error('Authentication timeout'))
        }, 10000) // 10 second timeout

        const authHandler = (event: WebSocketEvent) => {
          if (event.type === 'auth.success') {
            clearTimeout(timeout)
            this.isAuthenticated = true
            this.removeEventListener('auth.success', authHandler)
            this.removeEventListener('auth.error', errorHandler)
            resolve()
          }
        }

        const errorHandler = (event: WebSocketEvent) => {
          if (event.type === 'auth.error') {
            clearTimeout(timeout)
            this.removeEventListener('auth.success', authHandler)
            this.removeEventListener('auth.error', errorHandler)
            reject(new Error(event.data?.message || 'Authentication failed'))
          }
        }

        this.addEventListener('auth.success', authHandler)
        this.addEventListener('auth.error', errorHandler)

        this.ws!.send(JSON.stringify(authMessage))
      })
    } else {
      throw new Error('WebSocket not connected')
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    this.setStatus('reconnecting')

    // If we've exceeded max attempts, give up and disable WebSocket
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached, disabling WebSocket')
      this.setStatus('offline')
      return
    }

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(
      `Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`,
    )

    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`,
      )
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.lastHeartbeat = Date.now()

    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated) {
        this.ws.send(
          JSON.stringify({
            type: 'ping',
            timestamp: Date.now(),
          }),
        )
        this.lastHeartbeat = Date.now()
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private async initializePushNotifications(): Promise<void> {
    if (
      !this.config.enablePushNotifications ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      console.log('Push notifications not supported or disabled')
      return
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', this.serviceWorkerRegistration)

      // Get push subscription
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription()

      if (!this.pushSubscription) {
        // Create new subscription
        const vapidPublicKey = this.config.vapidPublicKey
        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured')
        }

        this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        })
      }

      // Send subscription to server
      if (this.pushSubscription && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'push.subscribe',
            subscription: this.pushSubscription,
            timestamp: Date.now(),
          }),
        )
      }

      console.log('Push notifications initialized')
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private queueMessage(type: string, data: Record<string, unknown>): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift() // Remove oldest message
    }

    const message: QueuedMessage = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    }

    this.messageQueue.push(message)
  }

  private processMessageQueue(): void {
    if (!this.isConnected() || this.messageQueue.length === 0) {
      return
    }

    const messages = [...this.messageQueue]
    this.messageQueue = []

    messages.forEach((message) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: message.type,
            data: message.data,
            id: message.id,
            timestamp: message.timestamp,
          }),
        )
      } else {
        // Re-queue message if not sent
        this.messageQueue.push(message)
      }
    })
  }

  private handleMessage(data: Record<string, unknown>): void {
    // Handle system messages
    if (data.type === 'pong') {
      this.lastHeartbeat = Date.now()
      return
    }

    if (data.type === 'auth.success') {
      this.isAuthenticated = true
    }

    if (data.type === 'auth.error') {
      this.isAuthenticated = false
    }

    // Handle push notification messages
    if (data.type === 'notification.received' && this.serviceWorkerRegistration) {
      const notification = (data.data as Record<string, unknown>)?.notification as
        | Record<string, unknown>
        | undefined
      if (notification) {
        this.showNotification(notification)
      }
    }

    // Dispatch to event listeners
    if (data.type && typeof data.type === 'string' && this.eventListeners.has(data.type)) {
      const listeners = this.eventListeners.get(data.type)!
      const event: WebSocketEvent = {
        type: data.type as WebSocketEvent['type'],
        data: (data.data as WebSocketEvent['data']) || {},
      }
      listeners.forEach((listener) => {
        try {
          listener(event)
        } catch (error) {
          console.error('Error in WebSocket event listener:', error)
        }
      })
    }
  }

  private async showNotification(notification: Record<string, unknown>): Promise<void> {
    if (!this.serviceWorkerRegistration) return

    const options: NotificationOptions = {
      body: (notification.body as string) || (notification.message as string),
      icon: (notification.icon as string) || '/android-chrome-192x192.png',
      badge: (notification.badge as string) || '/android-chrome-192x192.png',
      tag: (notification.tag as string) || 'community-hub',
      data: notification.data,
      requireInteraction: (notification.requireInteraction as boolean) || false,
    }

    try {
      await this.serviceWorkerRegistration.showNotification(
        (notification.title as string) || 'Community Hub',
        options,
      )
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  addEventListener(eventType: string, listener: (event: WebSocketEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    this.eventListeners.get(eventType)!.add(listener)
  }

  removeEventListener(eventType: string, listener: (event: WebSocketEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType)
      }
    }
  }

  getStatus(): WebSocketStatus {
    return this.status
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated
  }

  // Forum-specific methods
  sendTyping(channelId: string, threadId?: string): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'user.typing',
          data: { channelId, threadId },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('user.typing', { channelId, threadId })
    }
  }

  sendStopTyping(channelId: string, threadId?: string): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'user.stopped_typing',
          data: { channelId, threadId },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('user.stopped_typing', { channelId, threadId })
    }
  }

  joinChannel(channelId: string): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'channel.join',
          data: { channelId },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('channel.join', { channelId })
    }
  }

  leaveChannel(channelId: string): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'channel.leave',
          data: { channelId },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('channel.leave', { channelId })
    }
  }

  markMessageAsRead(channelId: string, messageId: string): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'message.read',
          data: { channelId, messageId },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('message.read', { channelId, messageId })
    }
  }

  markMessageAsDelivered(channelId: string, messageId: string): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'message.delivered',
          data: { channelId, messageId },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('message.delivered', { channelId, messageId })
    }
  }

  // Presence methods
  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (this.isConnected()) {
      this.ws!.send(
        JSON.stringify({
          type: 'presence.update',
          data: { status },
          timestamp: Date.now(),
        }),
      )
    } else {
      this.queueMessage('presence.update', { status })
    }
  }

  // Get connection info
  getConnectionInfo(): {
    status: WebSocketStatus
    isConnected: boolean
    isAuthenticated: boolean
    lastHeartbeat: number
    queuedMessages: number
    reconnectAttempts: number
  } {
    return {
      status: this.status,
      isConnected: this.isConnected(),
      isAuthenticated: this.isAuthenticated,
      lastHeartbeat: this.lastHeartbeat,
      queuedMessages: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts,
    }
  }
}

// Singleton instance
let wsInstance: CommunityHubWebSocket | null = null

export function createCommunityHubWebSocket(
  config: Partial<WebSocketConfig> = {},
  onStatusChange?: (status: WebSocketStatus) => void,
): CommunityHubWebSocket {
  const isProduction =
    window.location.hostname === 'naboomneighbornet.net.za' ||
    window.location.hostname.includes('naboomneighbornet') ||
    window.location.hostname.includes('naboom')
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'

  let wsUrl = 'ws://localhost:8000/ws/community-hub/'

  // Debug logging
  console.log('WebSocket URL Detection:', {
    hostname: window.location.hostname,
    isProduction,
    isDevelopment,
    VITE_WS_URL: import.meta.env.VITE_WS_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
  })

  if (isProduction) {
    wsUrl = 'wss://naboomneighbornet.net.za/ws/community-hub/'
  } else if (import.meta.env.VITE_WS_URL) {
    wsUrl = import.meta.env.VITE_WS_URL
  } else if (isDevelopment) {
    wsUrl = 'ws://localhost:8000/ws/community-hub/'
  } else {
    // Fallback: use current window location to construct WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const hostname = window.location.hostname
    wsUrl = `${protocol}//${hostname}/ws/community-hub/`
  }

  console.log('Selected WebSocket URL:', wsUrl)

  const finalConfig: Partial<WebSocketConfig> = {
    baseUrl: wsUrl,
    enablePushNotifications: true,
    vapidPublicKey:
      'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE6JkhItvbSeG5O7/2dibtUl0eTi1cAyaBgjfa7GPvtZ2KkN07zTnobf/d8P/R/DXXRZpdkA7x4mUIm4+TEGBNAg==',
    ...config,
  }

  const ws = new CommunityHubWebSocket(finalConfig, onStatusChange)

  // Connect and authenticate
  ws.connect()
    .then(() => {
      console.log('Community Hub WebSocket connected and authenticated')
    })
    .catch((error) => {
      console.error('Failed to connect WebSocket:', error)
    })

  return ws
}

export function getCommunityHubWebSocket(): CommunityHubWebSocket {
  if (!wsInstance) {
    try {
      const isProduction =
        window.location.hostname === 'naboomneighbornet.net.za' ||
        window.location.hostname.includes('naboomneighbornet') ||
        window.location.hostname.includes('naboom')
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'

      let wsUrl = 'ws://localhost:8000/ws/community-hub/'

      // Debug logging
      console.log('WebSocket URL Detection (Singleton):', {
        hostname: window.location.hostname,
        isProduction,
        isDevelopment,
        VITE_WS_URL: import.meta.env.VITE_WS_URL,
        NODE_ENV: import.meta.env.NODE_ENV,
        DEV: import.meta.env.DEV,
      })

      if (isProduction) {
        wsUrl = 'wss://naboomneighbornet.net.za/ws/community-hub/'
      } else if (import.meta.env.VITE_WS_URL) {
        wsUrl = import.meta.env.VITE_WS_URL
      } else if (isDevelopment) {
        wsUrl = 'ws://localhost:8000/ws/community-hub/'
      } else {
        // Fallback: use current window location to construct WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const hostname = window.location.hostname
        wsUrl = `${protocol}//${hostname}/ws/community-hub/`
      }

      console.log('Selected WebSocket URL (Singleton):', wsUrl)

      wsInstance = new CommunityHubWebSocket(
        {
          baseUrl: wsUrl,
          enablePushNotifications: true,
          vapidPublicKey:
            'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE6JkhItvbSeG5O7/2dibtUl0eTi1cAyaBgjfa7GPvtZ2KkN07zTnobf/d8P/R/DXXRZpdkA7x4mUIm4+TEGBNAg==',
        },
        (status) => {
          console.log('WebSocket status changed:', status)
        },
      )
    } catch (error) {
      console.error('Failed to create WebSocket instance:', error)
      // Return a minimal instance to prevent crashes
      wsInstance = new CommunityHubWebSocket(
        {
          baseUrl: 'ws://localhost:8000/ws/community-hub/',
          enablePushNotifications: false,
        },
        (status) => {
          console.log('WebSocket status changed (fallback):', status)
        },
      )
    }
  }

  return wsInstance
}

export function destroyCommunityHubWebSocket(): void {
  if (wsInstance) {
    wsInstance.disconnect()
    wsInstance = null
  }
}

// Helper functions for common event types
export function onThreadCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('thread.created', callback)
  return () => ws.removeEventListener('thread.created', callback)
}

export function onThreadUpdated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('thread.updated', callback)
  return () => ws.removeEventListener('thread.updated', callback)
}

export function onThreadDeleted(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('thread.deleted', callback)
  return () => ws.removeEventListener('thread.deleted', callback)
}

export function onPostCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('post.created', callback)
  return () => ws.removeEventListener('post.created', callback)
}

export function onPostUpdated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('post.updated', callback)
  return () => ws.removeEventListener('post.updated', callback)
}

export function onPostDeleted(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('post.deleted', callback)
  return () => ws.removeEventListener('post.deleted', callback)
}

export function onAlertCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('alert.created', callback)
  return () => ws.removeEventListener('alert.created', callback)
}

export function onAlertUpdated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('alert.updated', callback)
  return () => ws.removeEventListener('alert.updated', callback)
}

export function onEventCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('event.created', callback)
  return () => ws.removeEventListener('event.created', callback)
}

export function onEventUpdated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('event.updated', callback)
  return () => ws.removeEventListener('event.updated', callback)
}

export function onEventDeleted(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('event.deleted', callback)
  return () => ws.removeEventListener('event.deleted', callback)
}

// Forum-specific helper functions
export function onUserTyping(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('user.typing', callback)
  return () => ws.removeEventListener('user.typing', callback)
}

export function onUserStoppedTyping(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('user.stopped_typing', callback)
  return () => ws.removeEventListener('user.stopped_typing', callback)
}

export function onChannelJoined(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('channel.joined', callback)
  return () => ws.removeEventListener('channel.joined', callback)
}

export function onChannelLeft(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('channel.left', callback)
  return () => ws.removeEventListener('channel.left', callback)
}

export function onPresenceOnline(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('presence.online', callback)
  return () => ws.removeEventListener('presence.online', callback)
}

export function onPresenceOffline(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('presence.offline', callback)
  return () => ws.removeEventListener('presence.offline', callback)
}

export function onNotificationReceived(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('notification.received', callback)
  return () => ws.removeEventListener('notification.received', callback)
}

export function onMessageRead(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('message.read', callback)
  return () => ws.removeEventListener('message.read', callback)
}

export function onMessageDelivered(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('message.delivered', callback)
  return () => ws.removeEventListener('message.delivered', callback)
}

// Utility functions
export function getWebSocketStatus(): WebSocketStatus {
  return getCommunityHubWebSocket().getStatus()
}

export function isWebSocketConnected(): boolean {
  return getCommunityHubWebSocket().isConnected()
}

export function getWebSocketConnectionInfo() {
  return getCommunityHubWebSocket().getConnectionInfo()
}
