/**
 * Real-Time Service
 * Handles WebSocket connections and real-time updates
 * Part of User Story 1: Real-Time Discussion Channels
 */

import { websocketService } from '@/lib/websocket'
import type {
  RealTimeEvent,
  MessageEvent,
  TypingEvent,
  ChannelEvent,
  UserEvent,
  ConnectionStatus,
} from '@/types/communication'

export class RealTimeService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private connectionStatus: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.initialize()
  }

  /**
   * Initialize real-time service
   */
  private async initialize(): Promise<void> {
    // Subscribe to WebSocket events
    websocketService.subscribe('connected', this.handleConnected.bind(this))
    websocketService.subscribe('disconnected', this.handleDisconnected.bind(this))
    websocketService.subscribe('error', this.handleError.bind(this))
    websocketService.subscribe('message', this.handleMessage.bind(this))

    // Start connection
    await this.connect()
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    try {
      await websocketService.connect()
      this.connectionStatus = 'connecting'
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      this.handleConnectionError(error)
    }
  }

  /**
   * Disconnect from WebSocket
   */
  async disconnect(): Promise<void> {
    try {
      await websocketService.disconnect()
      this.connectionStatus = 'disconnected'
    } catch (error) {
      console.error('Failed to disconnect from WebSocket:', error)
    }
  }

  /**
   * Handle WebSocket connected
   */
  private handleConnected(): void {
    this.connectionStatus = 'connected'
    this.reconnectAttempts = 0
    console.log('Real-time service connected')

    // Notify listeners
    this.notifyListeners('connection_status_changed', { status: this.connectionStatus })
  }

  /**
   * Handle WebSocket disconnected
   */
  private handleDisconnected(): void {
    this.connectionStatus = 'disconnected'
    console.log('Real-time service disconnected')

    // Notify listeners
    this.notifyListeners('connection_status_changed', { status: this.connectionStatus })

    // Attempt to reconnect
    this.attemptReconnect()
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: any): void {
    console.error('WebSocket error:', error)
    this.handleConnectionError(error)
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: any): void {
    this.connectionStatus = 'error'

    // Notify listeners
    this.notifyListeners('connection_error', { error })

    // Attempt to reconnect
    this.attemptReconnect()
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.connectionStatus = 'failed'
      this.notifyListeners('connection_failed', { attempts: this.reconnectAttempts })
      return
    }

    this.reconnectAttempts++
    this.connectionStatus = 'reconnecting'

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    )

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: any): void {
    try {
      const event: RealTimeEvent = JSON.parse(data)

      switch (event.type) {
        case 'message':
          this.handleMessageEvent(event as MessageEvent)
          break
        case 'typing':
          this.handleTypingEvent(event as TypingEvent)
          break
        case 'channel':
          this.handleChannelEvent(event as ChannelEvent)
          break
        case 'user':
          this.handleUserEvent(event as UserEvent)
          break
        default:
          console.warn('Unknown real-time event type:', event.type)
      }
    } catch (error) {
      console.error('Failed to parse real-time event:', error)
    }
  }

  /**
   * Handle message event
   */
  private handleMessageEvent(event: MessageEvent): void {
    this.notifyListeners('message_received', event.data)
  }

  /**
   * Handle typing event
   */
  private handleTypingEvent(event: TypingEvent): void {
    this.notifyListeners('typing_received', event.data)
  }

  /**
   * Handle channel event
   */
  private handleChannelEvent(event: ChannelEvent): void {
    this.notifyListeners('channel_updated', event.data)
  }

  /**
   * Handle user event
   */
  private handleUserEvent(event: UserEvent): void {
    this.notifyListeners('user_updated', event.data)
  }

  /**
   * Send real-time event
   */
  async sendEvent(event: RealTimeEvent): Promise<void> {
    if (this.connectionStatus !== 'connected') {
      throw new Error('Not connected to real-time service')
    }

    try {
      await websocketService.send(JSON.stringify(event))
    } catch (error) {
      console.error('Failed to send real-time event:', error)
      throw error
    }
  }

  /**
   * Join channel
   */
  async joinChannel(channelId: string): Promise<void> {
    const event: RealTimeEvent = {
      type: 'channel',
      action: 'join',
      data: { channelId },
      timestamp: new Date(),
    }

    await this.sendEvent(event)
  }

  /**
   * Leave channel
   */
  async leaveChannel(channelId: string): Promise<void> {
    const event: RealTimeEvent = {
      type: 'channel',
      action: 'leave',
      data: { channelId },
      timestamp: new Date(),
    }

    await this.sendEvent(event)
  }

  /**
   * Send typing indicator
   */
  async sendTyping(channelId: string, isTyping: boolean): Promise<void> {
    const event: RealTimeEvent = {
      type: 'typing',
      action: isTyping ? 'start' : 'stop',
      data: { channelId, isTyping },
      timestamp: new Date(),
    }

    await this.sendEvent(event)
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(event: string, callback: (data: any) => void): () => void {
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
  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in real-time listener:', error)
        }
      })
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionStatus === 'connected'
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): {
    status: ConnectionStatus
    reconnectAttempts: number
    maxReconnectAttempts: number
  } {
    return {
      status: this.connectionStatus,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    }
  }

  /**
   * Reset reconnection attempts
   */
  resetReconnectionAttempts(): void {
    this.reconnectAttempts = 0
  }

  /**
   * Set max reconnection attempts
   */
  setMaxReconnectAttempts(max: number): void {
    this.maxReconnectAttempts = max
  }

  /**
   * Set reconnection delay
   */
  setReconnectDelay(delay: number): void {
    this.reconnectDelay = delay
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService()
export default realTimeService
