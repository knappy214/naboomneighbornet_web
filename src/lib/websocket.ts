/**
 * WebSocket service for real-time communication
 * Provides reactive WebSocket connection management with automatic reconnection
 */

import { ref, reactive, computed, onUnmounted } from 'vue'
import type { 
  WebSocketMessage, 
  WebSocketEventType, 
  TypingIndicator, 
  PresenceUpdate,
  Message,
  Channel,
  Event
} from '@/types/communication'

export interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  debug?: boolean
}

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
  lastConnected?: Date
  reconnectAttempts: number
  error?: string
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private reconnectTimer?: NodeJS.Timeout
  private heartbeatTimer?: NodeJS.Timeout
  private messageQueue: WebSocketMessage[] = []
  
  // Reactive state
  public state = reactive<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    connectionState: 'disconnected',
    reconnectAttempts: 0,
  })

  // Event listeners
  private listeners = new Map<WebSocketEventType, Set<(data: any) => void>>()

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      debug: config.debug ?? false,
    }
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.state.isConnecting = true
      this.state.connectionState = 'connecting'
      this.state.error = undefined

      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          this.state.isConnected = true
          this.state.isConnecting = false
          this.state.connectionState = 'connected'
          this.state.lastConnected = new Date()
          this.state.reconnectAttempts = 0
          this.state.error = undefined

          this.log('Connected to WebSocket server')
          
          // Process queued messages
          this.processMessageQueue()
          
          // Start heartbeat
          this.startHeartbeat()
          
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            this.log('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          this.state.isConnected = false
          this.state.isConnecting = false
          this.state.connectionState = 'disconnected'
          
          this.log('WebSocket connection closed:', event.code, event.reason)
          
          this.stopHeartbeat()
          
          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          this.state.isConnecting = false
          this.state.error = 'WebSocket connection error'
          this.log('WebSocket error:', error)
          reject(error)
        }

      } catch (error) {
        this.state.isConnecting = false
        this.state.error = 'Failed to create WebSocket connection'
        this.log('Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.state.connectionState = 'disconnected'
    this.stopHeartbeat()
    this.clearReconnectTimer()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.state.isConnected = false
    this.state.isConnecting = false
    this.log('Disconnected from WebSocket server')
  }

  /**
   * Send a message to the server
   */
  public send(type: WebSocketEventType, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date(),
    }

    if (this.state.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message))
        this.log('Sent message:', type, data)
      } catch (error) {
        this.log('Failed to send message:', error)
        this.queueMessage(message)
      }
    } else {
      this.queueMessage(message)
    }
  }

  /**
   * Subscribe to a specific event type
   */
  public on(eventType: WebSocketEventType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    this.listeners.get(eventType)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  /**
   * Subscribe to typing indicators
   */
  public onTyping(callback: (indicator: TypingIndicator) => void): () => void {
    return this.on('typing.start', callback)
  }

  /**
   * Subscribe to presence updates
   */
  public onPresenceUpdate(callback: (update: PresenceUpdate) => void): () => void {
    return this.on('user.status.changed', callback)
  }

  /**
   * Subscribe to new messages
   */
  public onMessage(callback: (message: Message) => void): () => void {
    return this.on('message.created', callback)
  }

  /**
   * Subscribe to message updates
   */
  public onMessageUpdate(callback: (message: Message) => void): () => void {
    return this.on('message.updated', callback)
  }

  /**
   * Subscribe to message deletions
   */
  public onMessageDelete(callback: (messageId: string) => void): () => void {
    return this.on('message.deleted', callback)
  }

  /**
   * Subscribe to channel updates
   */
  public onChannelUpdate(callback: (channel: Channel) => void): () => void {
    return this.on('channel.member.added', callback)
  }

  /**
   * Subscribe to event updates
   */
  public onEventUpdate(callback: (event: Event) => void): () => void {
    return this.on('event.created', callback)
  }

  /**
   * Send typing indicator
   */
  public sendTyping(channelId: string, isTyping: boolean): void {
    this.send('typing.start', {
      channelId,
      isTyping,
    })
  }

  /**
   * Send presence update
   */
  public sendPresenceUpdate(status: 'online' | 'away' | 'busy' | 'offline', channelId?: string): void {
    this.send('user.status.changed', {
      status,
      channelId,
    })
  }

  /**
   * Send a message
   */
  public sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.send('message.created', message)
  }

  /**
   * Update a message
   */
  public updateMessage(messageId: string, updates: Partial<Message>): void {
    this.send('message.updated', {
      messageId,
      updates,
    })
  }

  /**
   * Delete a message
   */
  public deleteMessage(messageId: string): void {
    this.send('message.deleted', { messageId })
  }

  /**
   * Get connection status
   */
  public get isConnected(): boolean {
    return this.state.isConnected
  }

  /**
   * Get connection state
   */
  public get connectionState(): string {
    return this.state.connectionState
  }

  /**
   * Get error message
   */
  public get error(): string | undefined {
    return this.state.error
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    this.log('Received message:', message.type, message.data)
    
    const listeners = this.listeners.get(message.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (error) {
          this.log('Error in message handler:', error)
        }
      })
    }
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message)
    this.log('Queued message:', message.type)
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state.isConnected) {
      const message = this.messageQueue.shift()
      if (message) {
        this.ws?.send(JSON.stringify(message))
        this.log('Sent queued message:', message.type)
      }
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.state.connectionState = 'reconnecting'
    this.state.reconnectAttempts++
    
    this.log(`Scheduling reconnect attempt ${this.state.reconnectAttempts}/${this.config.maxReconnectAttempts}`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will be handled by onclose
      })
    }, this.config.reconnectInterval)
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected) {
        this.send('ping', { timestamp: new Date() })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  /**
   * Log message if debug is enabled
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args)
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.disconnect()
    this.listeners.clear()
    this.messageQueue = []
  }
}

/**
 * Create a reactive WebSocket service instance
 */
export function createWebSocketService(config: WebSocketConfig): WebSocketService {
  return new WebSocketService(config)
}

/**
 * Composable for using WebSocket service
 */
export function useWebSocket(config: WebSocketConfig) {
  const service = createWebSocketService(config)
  
  // Auto-cleanup on unmount
  onUnmounted(() => {
    service.destroy()
  })

  return {
    service,
    state: service.state,
    connect: service.connect.bind(service),
    disconnect: service.disconnect.bind(service),
    send: service.send.bind(service),
    on: service.on.bind(service),
    onTyping: service.onTyping.bind(service),
    onPresenceUpdate: service.onPresenceUpdate.bind(service),
    onMessage: service.onMessage.bind(service),
    onMessageUpdate: service.onMessageUpdate.bind(service),
    onMessageDelete: service.onMessageDelete.bind(service),
    onChannelUpdate: service.onChannelUpdate.bind(service),
    onEventUpdate: service.onEventUpdate.bind(service),
    sendTyping: service.sendTyping.bind(service),
    sendPresenceUpdate: service.sendPresenceUpdate.bind(service),
    sendMessage: service.sendMessage.bind(service),
    updateMessage: service.updateMessage.bind(service),
    deleteMessage: service.deleteMessage.bind(service),
    isConnected: computed(() => service.isConnected),
    connectionState: computed(() => service.connectionState),
    error: computed(() => service.error),
  }
}
