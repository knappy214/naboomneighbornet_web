/**
 * WebSocket Service
 * Handles WebSocket connections and real-time communication
 * Part of User Story 1: Real-Time Discussion Channels
 */

import type { RealTimeEvent } from '@/types/communication'

interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  connection: WebSocket | null
  url: string
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number
  heartbeatInterval: number
  heartbeatTimer: NodeJS.Timeout | null
}

export class WebSocketService {
  private state: WebSocketState = {
    isConnected: false,
    isConnecting: false,
    connection: null,
    url: '',
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
    heartbeatTimer: null
  }

  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    this.initialize()
  }

  /**
   * Initialize WebSocket service
   */
  private initialize(): void {
    // Set WebSocket URL from environment or default
    this.state.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/communication/'
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return
    }

    this.state.isConnecting = true

    try {
      const ws = new WebSocket(this.state.url)
      
      ws.onopen = this.handleOpen.bind(this)
      ws.onclose = this.handleClose.bind(this)
      ws.onerror = this.handleError.bind(this)
      ws.onmessage = this.handleMessage.bind(this)

      this.state.connection = ws
    } catch (error) {
      this.state.isConnecting = false
      throw error
    }
  }

  /**
   * Disconnect from WebSocket
   */
  async disconnect(): Promise<void> {
    if (this.state.connection) {
      this.state.connection.close()
      this.state.connection = null
    }

    this.state.isConnected = false
    this.state.isConnecting = false

    if (this.state.heartbeatTimer) {
      clearInterval(this.state.heartbeatTimer)
      this.state.heartbeatTimer = null
    }
  }

  /**
   * Send message through WebSocket
   */
  async send(data: string | RealTimeEvent): Promise<void> {
    if (!this.state.isConnected || !this.state.connection) {
      throw new Error('WebSocket not connected')
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      this.state.connection.send(message)
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      throw error
    }
  }

  /**
   * Subscribe to WebSocket events
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
   * Handle WebSocket open
   */
  private handleOpen(): void {
    this.state.isConnected = true
    this.state.isConnecting = false
    this.state.reconnectAttempts = 0

    console.log('WebSocket connected')

    // Start heartbeat
    this.startHeartbeat()

    // Notify listeners
    this.notifyListeners('connected', {})
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent): void {
    this.state.isConnected = false
    this.state.isConnecting = false

    console.log('WebSocket disconnected:', event.code, event.reason)

    // Stop heartbeat
    if (this.state.heartbeatTimer) {
      clearInterval(this.state.heartbeatTimer)
      this.state.heartbeatTimer = null
    }

    // Notify listeners
    this.notifyListeners('disconnected', { code: event.code, reason: event.reason })

    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000 && this.state.reconnectAttempts < this.state.maxReconnectAttempts) {
      this.attemptReconnect()
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('WebSocket error:', error)

    // Notify listeners
    this.notifyListeners('error', { error })
  }

  /**
   * Handle WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      
      // Handle heartbeat response
      if (data.type === 'pong') {
        return
      }

      // Notify listeners
      this.notifyListeners('message', data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    if (this.state.heartbeatTimer) {
      clearInterval(this.state.heartbeatTimer)
    }

    this.state.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected && this.state.connection) {
        try {
          this.send({ type: 'ping', timestamp: new Date() })
        } catch (error) {
          console.error('Failed to send heartbeat:', error)
        }
      }
    }, this.state.heartbeatInterval)
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.state.reconnectAttempts >= this.state.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.notifyListeners('reconnect_failed', { attempts: this.state.reconnectAttempts })
      return
    }

    this.state.reconnectAttempts++
    const delay = this.state.reconnectDelay * Math.pow(2, this.state.reconnectAttempts - 1)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.state.reconnectAttempts}/${this.state.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in WebSocket listener:', error)
        }
      })
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isConnected: boolean
    isConnecting: boolean
    reconnectAttempts: number
    maxReconnectAttempts: number
  } {
    return {
      isConnected: this.state.isConnected,
      isConnecting: this.state.isConnecting,
      reconnectAttempts: this.state.reconnectAttempts,
      maxReconnectAttempts: this.state.maxReconnectAttempts
    }
  }

  /**
   * Set max reconnection attempts
   */
  setMaxReconnectAttempts(max: number): void {
    this.state.maxReconnectAttempts = max
  }

  /**
   * Set reconnection delay
   */
  setReconnectDelay(delay: number): void {
    this.state.reconnectDelay = delay
  }

  /**
   * Set heartbeat interval
   */
  setHeartbeatInterval(interval: number): void {
    this.state.heartbeatInterval = interval
  }

  /**
   * Reset reconnection attempts
   */
  resetReconnectionAttempts(): void {
    this.state.reconnectAttempts = 0
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()
export default websocketService