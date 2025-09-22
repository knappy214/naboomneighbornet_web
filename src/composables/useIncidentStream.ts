import { onBeforeUnmount, ref } from 'vue'
import type { IncidentStreamEnvelope } from '@/types/panic'

type StreamListener<T = unknown> = (event: StreamEvent<T>) => void

type ListenerMap = Map<string, Set<StreamListener<any>>>

interface StreamHandlers {
  [event: string]: (event: MessageEvent<string>) => void
}

export interface StreamEvent<T = unknown> {
  event: string
  data: T
  raw: MessageEvent<string>
}

export interface UseIncidentStreamOptions {
  autoConnect?: boolean
  immediateReconnect?: boolean
}

export interface UseIncidentStream {
  readonly isConnected: ReturnType<typeof ref<boolean>>
  readonly lastEvent: ReturnType<typeof ref<StreamEvent | null>>
  readonly lastError: ReturnType<typeof ref<Event | null>>
  connect: () => void
  disconnect: () => void
  on: <T = unknown>(eventName: string, listener: StreamListener<T>) => () => void
}

const STREAM_PATH = '/stream'

export function useIncidentStream(options: UseIncidentStreamOptions = {}): UseIncidentStream {
  const isConnected = ref(false)
  const lastEvent = ref<StreamEvent | null>(null)
  const lastError = ref<Event | null>(null)

  const listeners: ListenerMap = new Map()
  const handlers: StreamHandlers = {}

  let eventSource: EventSource | null = null

  function emitEvent<T = unknown>(eventName: string, rawEvent: MessageEvent<string>): void {
    let parsed: unknown = rawEvent.data
    if (rawEvent.data && typeof rawEvent.data === 'string') {
      try {
        parsed = JSON.parse(rawEvent.data)
      } catch (error) {
        parsed = rawEvent.data
      }
    }

    const payload: StreamEvent<T> = {
      event: eventName,
      data: parsed as T,
      raw: rawEvent,
    }

    lastEvent.value = payload

    if (listeners.has(eventName)) {
      for (const listener of listeners.get(eventName)!) {
        listener(payload)
      }
    }

    if (listeners.has('*')) {
      for (const listener of listeners.get('*')!) {
        listener(payload)
      }
    }
  }

  function registerHandler(eventName: string): void {
    if (!eventSource || handlers[eventName]) {
      return
    }

    handlers[eventName] = (event) => emitEvent(eventName, event)
    eventSource.addEventListener(eventName, handlers[eventName] as unknown as EventListener)
  }

  function unregisterHandler(eventName: string): void {
    if (!eventSource || !handlers[eventName]) {
      return
    }

    eventSource.removeEventListener(eventName, handlers[eventName] as unknown as EventListener)
    delete handlers[eventName]
  }

  function connect(): void {
    if (typeof window === 'undefined') {
      return
    }

    if (eventSource) {
      return
    }

    const baseUrl = import.meta.env.VITE_PANIC_BASE
    if (!baseUrl) {
      console.warn('[panic] VITE_PANIC_BASE is not configured, SSE stream disabled')
      return
    }

    const url = `${baseUrl.replace(/\/$/, '')}${STREAM_PATH}`
    eventSource = new EventSource(url, { withCredentials: true })

    eventSource.onopen = () => {
      isConnected.value = true
    }

    eventSource.onerror = (event) => {
      lastError.value = event
      isConnected.value = false
      if (options.immediateReconnect !== false) {
        disconnect()
        window.setTimeout(() => connect(), 2500)
      }
    }

    handlers.message = (event) => emitEvent('message', event)
    eventSource.addEventListener('message', handlers.message as unknown as EventListener)

    listeners.forEach((_listenerSet, eventName) => {
      if (eventName !== 'message') {
        registerHandler(eventName)
      }
    })
  }

  function disconnect(): void {
    if (!eventSource) {
      return
    }

    Object.keys(handlers).forEach((eventName) => unregisterHandler(eventName))
    eventSource.close()
    eventSource = null
    isConnected.value = false
  }

  function on<T = unknown>(eventName: string, listener: StreamListener<T>): () => void {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set())
    }

    listeners.get(eventName)!.add(listener as StreamListener<any>)

    if (eventSource) {
      registerHandler(eventName)
    }

    return () => {
      const set = listeners.get(eventName)
      if (!set) {
        return
      }

      set.delete(listener as StreamListener<any>)
      if (set.size === 0) {
        listeners.delete(eventName)
        unregisterHandler(eventName)
      }
    }
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  if (options.autoConnect !== false) {
    connect()
  }

  return {
    isConnected,
    lastEvent,
    lastError,
    connect,
    disconnect,
    on,
  }
}

export function isIncidentEnvelope(payload: unknown): payload is IncidentStreamEnvelope {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  return (
    'type' in payload &&
    'payload' in payload &&
    typeof (payload as IncidentStreamEnvelope).type === 'string'
  )
}
