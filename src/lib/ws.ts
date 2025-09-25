import type { HubRealtimeEvent, WebSocketStatus } from '@/types/hub'

interface ChannelWebSocketOptions {
  channelId: string
  token: string
  onEvent: (event: HubRealtimeEvent) => void
  onStatusChange?: (status: WebSocketStatus) => void
}

const HEARTBEAT_INTERVAL = 30_000
const MAX_BACKOFF = 30_000

const resolveWsBase = () => {
  const explicit = import.meta.env.VITE_WS_BASE
  if (explicit) return explicit.replace(/\/?$/, '')

  const { protocol, host } = window.location
  const wsProtocol = protocol === 'https:' ? 'wss' : 'ws'
  return `${wsProtocol}://${host}`
}

export class ChannelWebSocket {
  private ws: WebSocket | null = null
  private backoff = 1_000
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private manualClose = false

  constructor(private readonly options: ChannelWebSocketOptions) {}

  connect() {
    this.manualClose = false
    this.setStatus('connecting')

    const url = `${resolveWsBase()}/ws/channels/${this.options.channelId}/?token=${encodeURIComponent(this.options.token)}`

    try {
      this.ws = new WebSocket(url)
    } catch (error) {
      console.error('Failed to open websocket', error)
      this.scheduleReconnect()
      return
    }

    this.ws.addEventListener('open', () => {
      this.backoff = 1_000
      this.setStatus('online')
      this.startHeartbeat()
    })

    this.ws.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload?.type) {
          this.options.onEvent(payload)
        }
      } catch (error) {
        console.warn('Failed to parse realtime message', error)
      }
    })

    this.ws.addEventListener('close', () => {
      this.clearHeartbeat()
      this.ws = null
      if (!this.manualClose) {
        this.scheduleReconnect()
      } else {
        this.setStatus('offline')
      }
    })

    this.ws.addEventListener('error', (event) => {
      console.error('Websocket error', event)
      this.ws?.close()
    })
  }

  disconnect() {
    this.manualClose = true
    this.clearHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.setStatus('offline')
  }

  private setStatus(status: WebSocketStatus) {
    this.options.onStatusChange?.(status)
  }

  private startHeartbeat() {
    this.clearHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    this.setStatus('reconnecting')
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    const delay = Math.min(this.backoff, MAX_BACKOFF)
    this.reconnectTimer = window.setTimeout(() => {
      this.backoff = Math.min(this.backoff * 2, MAX_BACKOFF)
      this.connect()
    }, delay)
  }
}
