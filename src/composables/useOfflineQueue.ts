import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { useMessageStore } from '@/stores/hub/messages'
import { useUserStore } from '@/stores/hub/user'
import type { Message } from '@/types/messages'

// IndexedDB Schema
interface OfflineQueueDB extends DBSchema {
  messages: {
    key: string
    value: QueuedMessage
    indexes: {
      'by-channel': string
      'by-timestamp': number
      'by-status': MessageStatus
    }
  }
  syncState: {
    key: string
    value: SyncState
  }
}

// Types
export type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'conflict'

export interface QueuedMessage {
  id: string
  channelId: string
  content: string
  type: 'text' | 'image' | 'file' | 'event'
  metadata?: Record<string, any>
  timestamp: number
  status: MessageStatus
  retryCount: number
  maxRetries: number
  lastError?: string
  serverId?: string
  conflictResolution?: 'client' | 'server' | 'merge'
}

export interface SyncState {
  lastSyncTimestamp: number
  isOnline: boolean
  pendingCount: number
  failedCount: number
  lastError?: string
}

export interface ConflictResolution {
  clientMessage: QueuedMessage
  serverMessage: Message
  resolution: 'client' | 'server' | 'merge'
  mergedContent?: string
}

// Database instance
let db: IDBPDatabase<OfflineQueueDB> | null = null

export function useOfflineQueue() {
  const messageStore = useMessageStore()
  const userStore = useUserStore()

  // Reactive state
  const isOnline = ref(navigator.onLine)
  const isInitialized = ref(false)
  const pendingMessages = ref<QueuedMessage[]>([])
  const failedMessages = ref<QueuedMessage[]>([])
  const syncState = ref<SyncState>({
    lastSyncTimestamp: 0,
    isOnline: navigator.onLine,
    pendingCount: 0,
    failedCount: 0,
  })

  // Computed properties
  const hasPendingMessages = computed(() => pendingMessages.value.length > 0)
  const hasFailedMessages = computed(() => failedMessages.value.length > 0)
  const totalQueuedMessages = computed(
    () => pendingMessages.value.length + failedMessages.value.length,
  )
  const canSync = computed(() => isOnline.value && isInitialized.value)

  // Initialize IndexedDB
  async function initializeDB() {
    try {
      db = await openDB<OfflineQueueDB>('offline-queue', 1, {
        upgrade(db) {
          // Create messages store
          const messageStore = db.createObjectStore('messages', {
            keyPath: 'id',
          })
          messageStore.createIndex('by-channel', 'channelId')
          messageStore.createIndex('by-timestamp', 'timestamp')
          messageStore.createIndex('by-status', 'status')

          // Create sync state store
          db.createObjectStore('syncState', {
            keyPath: 'id',
          })
        },
      })

      // Load initial data
      await loadPendingMessages()
      await loadSyncState()
      isInitialized.value = true

      console.log('Offline queue database initialized')
    } catch (error) {
      console.error('Failed to initialize offline queue database:', error)
      throw error
    }
  }

  // Load pending messages from IndexedDB
  async function loadPendingMessages() {
    if (!db) return

    try {
      const messages = await db.getAll('messages')
      pendingMessages.value = messages.filter(
        (msg) => msg.status === 'pending' || msg.status === 'sending',
      )
      failedMessages.value = messages.filter((msg) => msg.status === 'failed')
    } catch (error) {
      console.error('Failed to load pending messages:', error)
    }
  }

  // Load sync state from IndexedDB
  async function loadSyncState() {
    if (!db) return

    try {
      const state = await db.get('syncState', 'main')
      if (state) {
        syncState.value = state
      }
    } catch (error) {
      console.error('Failed to load sync state:', error)
    }
  }

  // Save sync state to IndexedDB
  async function saveSyncState() {
    if (!db) return

    try {
      await db.put('syncState', {
        id: 'main',
        ...syncState.value,
      })
    } catch (error) {
      console.error('Failed to save sync state:', error)
    }
  }

  // Queue a message for offline sending
  async function queueMessage(
    message: Omit<QueuedMessage, 'id' | 'timestamp' | 'status' | 'retryCount'>,
  ): Promise<string> {
    if (!db) {
      throw new Error('Database not initialized')
    }

    const queuedMessage: QueuedMessage = {
      ...message,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
    }

    try {
      await db.add('messages', queuedMessage)
      pendingMessages.value.push(queuedMessage)
      syncState.value.pendingCount = pendingMessages.value.length
      await saveSyncState()

      // Try to send immediately if online
      if (isOnline.value) {
        await sendQueuedMessage(queuedMessage.id)
      }

      return queuedMessage.id
    } catch (error) {
      console.error('Failed to queue message:', error)
      throw error
    }
  }

  // Send a queued message
  async function sendQueuedMessage(messageId: string) {
    if (!db) return

    try {
      const message = await db.get('messages', messageId)
      if (!message) return

      // Update status to sending
      message.status = 'sending'
      await db.put('messages', message)
      updateMessageInState(message)

      // Send via message service
      const result = await messageStore.sendMessage({
        channelId: message.channelId,
        content: message.content,
        type: message.type,
        metadata: message.metadata,
      })

      // Update with server response
      message.status = 'sent'
      message.serverId = result.id
      await db.put('messages', message)
      updateMessageInState(message)

      // Remove from pending messages
      pendingMessages.value = pendingMessages.value.filter((msg) => msg.id !== messageId)
      syncState.value.pendingCount = pendingMessages.value.length
      await saveSyncState()

      console.log('Message sent successfully:', messageId)
    } catch (error) {
      console.error('Failed to send queued message:', error)
      await handleSendError(messageId, error)
    }
  }

  // Handle send error
  async function handleSendError(messageId: string, error: any) {
    if (!db) return

    try {
      const message = await db.get('messages', messageId)
      if (!message) return

      message.retryCount++
      message.lastError = error.message || 'Unknown error'

      if (message.retryCount >= message.maxRetries) {
        message.status = 'failed'
        failedMessages.value.push(message)
        pendingMessages.value = pendingMessages.value.filter((msg) => msg.id !== messageId)
      } else {
        message.status = 'pending'
        // Exponential backoff for retry
        setTimeout(
          () => {
            if (isOnline.value) {
              sendQueuedMessage(messageId)
            }
          },
          Math.pow(2, message.retryCount) * 1000,
        )
      }

      await db.put('messages', message)
      updateMessageInState(message)
      syncState.value.failedCount = failedMessages.value.length
      syncState.value.pendingCount = pendingMessages.value.length
      syncState.value.lastError = error.message
      await saveSyncState()
    } catch (dbError) {
      console.error('Failed to handle send error:', dbError)
    }
  }

  // Update message in reactive state
  function updateMessageInState(message: QueuedMessage) {
    const pendingIndex = pendingMessages.value.findIndex((msg) => msg.id === message.id)
    const failedIndex = failedMessages.value.findIndex((msg) => msg.id === message.id)

    if (pendingIndex !== -1) {
      pendingMessages.value[pendingIndex] = message
    } else if (failedIndex !== -1) {
      failedMessages.value[failedIndex] = message
    }
  }

  // Retry failed messages
  async function retryFailedMessage(messageId: string) {
    if (!db) return

    try {
      const message = await db.get('messages', messageId)
      if (!message || message.status !== 'failed') return

      // Reset retry count and status
      message.status = 'pending'
      message.retryCount = 0
      message.lastError = undefined

      await db.put('messages', message)

      // Move from failed to pending
      failedMessages.value = failedMessages.value.filter((msg) => msg.id !== messageId)
      pendingMessages.value.push(message)
      updateMessageInState(message)

      syncState.value.failedCount = failedMessages.value.length
      syncState.value.pendingCount = pendingMessages.value.length
      await saveSyncState()

      // Try to send immediately if online
      if (isOnline.value) {
        await sendQueuedMessage(messageId)
      }
    } catch (error) {
      console.error('Failed to retry message:', error)
    }
  }

  // Retry all failed messages
  async function retryAllFailedMessages() {
    const failedIds = failedMessages.value.map((msg) => msg.id)
    for (const messageId of failedIds) {
      await retryFailedMessage(messageId)
    }
  }

  // Delete a queued message
  async function deleteQueuedMessage(messageId: string) {
    if (!db) return

    try {
      await db.delete('messages', messageId)
      pendingMessages.value = pendingMessages.value.filter((msg) => msg.id !== messageId)
      failedMessages.value = failedMessages.value.filter((msg) => msg.id !== messageId)

      syncState.value.pendingCount = pendingMessages.value.length
      syncState.value.failedCount = failedMessages.value.length
      await saveSyncState()
    } catch (error) {
      console.error('Failed to delete queued message:', error)
    }
  }

  // Clear all queued messages
  async function clearAllQueuedMessages() {
    if (!db) return

    try {
      await db.clear('messages')
      pendingMessages.value = []
      failedMessages.value = []

      syncState.value.pendingCount = 0
      syncState.value.failedCount = 0
      await saveSyncState()
    } catch (error) {
      console.error('Failed to clear queued messages:', error)
    }
  }

  // Sync all pending messages
  async function syncAllPendingMessages() {
    if (!isOnline.value || !isInitialized.value) return

    console.log('Syncing pending messages...')
    const messageIds = [...pendingMessages.value.map((msg) => msg.id)]

    for (const messageId of messageIds) {
      await sendQueuedMessage(messageId)
    }

    syncState.value.lastSyncTimestamp = Date.now()
    await saveSyncState()
  }

  // Handle conflict resolution
  async function resolveConflict(conflict: ConflictResolution) {
    if (!db) return

    try {
      const message = await db.get('messages', conflict.clientMessage.id)
      if (!message) return

      switch (conflict.resolution) {
        case 'client':
          // Keep client message, retry sending
          message.status = 'pending'
          message.retryCount = 0
          await db.put('messages', message)
          updateMessageInState(message)
          break

        case 'server':
          // Accept server message, delete client message
          await db.delete('messages', message.id)
          pendingMessages.value = pendingMessages.value.filter((msg) => msg.id !== message.id)
          break

        case 'merge':
          // Merge content and retry
          message.content = conflict.mergedContent || message.content
          message.status = 'pending'
          message.retryCount = 0
          await db.put('messages', message)
          updateMessageInState(message)
          break
      }

      syncState.value.pendingCount = pendingMessages.value.length
      await saveSyncState()
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }

  // Get messages by channel
  async function getMessagesByChannel(channelId: string): Promise<QueuedMessage[]> {
    if (!db) return []

    try {
      const messages = await db.getAllFromIndex('messages', 'by-channel', channelId)
      return messages.sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      console.error('Failed to get messages by channel:', error)
      return []
    }
  }

  // Get message statistics
  function getMessageStats() {
    return {
      pending: pendingMessages.value.length,
      failed: failedMessages.value.length,
      total: totalQueuedMessages.value,
      lastSync: syncState.value.lastSyncTimestamp,
      isOnline: isOnline.value,
    }
  }

  // Network status handlers
  function handleOnline() {
    isOnline.value = true
    syncState.value.isOnline = true
    saveSyncState()

    // Sync pending messages when coming back online
    setTimeout(() => {
      syncAllPendingMessages()
    }, 1000)
  }

  function handleOffline() {
    isOnline.value = false
    syncState.value.isOnline = false
    saveSyncState()
  }

  // Watch for online/offline changes
  watch(isOnline, (newValue) => {
    if (newValue) {
      handleOnline()
    } else {
      handleOffline()
    }
  })

  // Lifecycle
  onMounted(async () => {
    await initializeDB()

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    // Remove event listeners
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    // State
    isOnline,
    isInitialized,
    pendingMessages,
    failedMessages,
    syncState,

    // Computed
    hasPendingMessages,
    hasFailedMessages,
    totalQueuedMessages,
    canSync,

    // Methods
    queueMessage,
    sendQueuedMessage,
    retryFailedMessage,
    retryAllFailedMessages,
    deleteQueuedMessage,
    clearAllQueuedMessages,
    syncAllPendingMessages,
    resolveConflict,
    getMessagesByChannel,
    getMessageStats,
  }
}
