import { useAuthStore } from '@/stores/auth'

export type WebSocketStatus = 'offline' | 'connecting' | 'online' | 'reconnecting'

export interface WebSocketEvent {
  type:
    | 'thread.created'
    | 'thread.updated'
    | 'post.created'
    | 'post.updated'
    | 'alert.created'
    | 'event.created'
  data: {
    thread?: any
    post?: any
    alert?: any
    event?: any
    channel?: any
  }
}

export class CommunityHubWebSocket {
  private ws: WebSocket | null = null
  private status: WebSocketStatus = 'offline'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map()

  constructor(
    private baseUrl: string = 'ws://localhost:8000/ws/community-hub/',
    private onStatusChange?: (status: WebSocketStatus) => void,
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.setStatus('connecting')

      try {
        this.ws = new WebSocket(this.baseUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.setStatus('online')
          this.reconnectAttempts = 0
          this.authenticate()
          resolve()
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
          console.log('WebSocket closed:', event.code, event.reason)
          this.setStatus('offline')
          this.ws = null

          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.setStatus('offline')
          reject(error)
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
    this.setStatus('offline')
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }

  private authenticate(): void {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'auth',
          token: token,
        }),
      )
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    this.setStatus('reconnecting')

    setTimeout(
      () => {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        )
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error)
        })
      },
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
    )
  }

  private handleMessage(data: any): void {
    if (data.type && this.eventListeners.has(data.type)) {
      const listeners = this.eventListeners.get(data.type)!
      listeners.forEach((listener) => {
        try {
          listener(data)
        } catch (error) {
          console.error('Error in WebSocket event listener:', error)
        }
      })
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
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsInstance: CommunityHubWebSocket | null = null

// Force rebuild to clear cache

export function createCommunityHubWebSocket(
  token: string,
  onStatusChange?: (status: WebSocketStatus) => void,
): CommunityHubWebSocket {
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'
  const isProduction = window.location.hostname === 'naboomneighbornet.net.za'

  let wsUrl = 'ws://localhost:8000/ws/community-hub/'

  if (isProduction) {
    wsUrl = 'wss://naboomneighbornet.net.za/ws/community-hub/'
  } else if (import.meta.env.VITE_WS_URL) {
    wsUrl = import.meta.env.VITE_WS_URL
  }

  const ws = new CommunityHubWebSocket(wsUrl, onStatusChange)

  // Connect and authenticate
  ws.connect()
    .then(() => {
      // Authentication will be handled by the class
    })
    .catch((error) => {
      console.error('Failed to connect WebSocket:', error)
    })

  return ws
}

export function getCommunityHubWebSocket(): CommunityHubWebSocket {
  if (!wsInstance) {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'
    const isProduction = window.location.hostname === 'naboomneighbornet.net.za'

    let wsUrl = 'ws://localhost:8000/ws/community-hub/'

    if (isProduction) {
      wsUrl = 'wss://naboomneighbornet.net.za/ws/community-hub/'
    } else if (import.meta.env.VITE_WS_URL) {
      wsUrl = import.meta.env.VITE_WS_URL
    }

    wsInstance = new CommunityHubWebSocket(wsUrl, (status) => {
      console.log('WebSocket status changed:', status)
    })
  }

  return wsInstance
}

// Helper functions for common event types
export function onThreadCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('thread.created', callback)
  return () => ws.removeEventListener('thread.created', callback)
}

export function onPostCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('post.created', callback)
  return () => ws.removeEventListener('post.created', callback)
}

export function onAlertCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('alert.created', callback)
  return () => ws.removeEventListener('alert.created', callback)
}

export function onEventCreated(callback: (event: WebSocketEvent) => void): () => void {
  const ws = getCommunityHubWebSocket()
  ws.addEventListener('event.created', callback)
  return () => ws.removeEventListener('event.created', callback)
}
