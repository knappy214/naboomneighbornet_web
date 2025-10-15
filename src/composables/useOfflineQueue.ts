/**
 * Offline Message Queue Composable
 * Manages offline message queuing using IndexedDB for reliable message delivery
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { 
  OfflineMessage, 
  OfflineQueue, 
  Message, 
  MessageStatus,
  ApiError 
} from '@/types/communication'

interface QueueConfig {
  maxRetries: number
  retryDelay: number
  maxQueueSize: number
  syncInterval: number
  debug?: boolean
}

interface QueueStats {
  totalMessages: number
  pendingMessages: number
  failedMessages: number
  lastSyncAt?: Date
  nextRetryAt?: Date
}

export function useOfflineQueue(config: Partial<QueueConfig> = {}) {
  // ============================================================================
  // Configuration
  // ============================================================================

  const defaultConfig: Required<QueueConfig> = {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    maxQueueSize: 1000,
    syncInterval: 10000, // 10 seconds
    debug: false,
  }

  const queueConfig = { ...defaultConfig, ...config }

  // ============================================================================
  // State
  // ============================================================================

  const isOnline = ref(navigator.onLine)
  const isInitialized = ref(false)
  const isProcessing = ref(false)
  const lastError = ref<ApiError | null>(null)

  const queue = reactive<OfflineQueue>({
    messages: [],
    isOnline: navigator.onLine,
    lastSyncAt: undefined,
    pendingCount: 0,
  })

  const stats = reactive<QueueStats>({
    totalMessages: 0,
    pendingMessages: 0,
    failedMessages: 0,
    lastSyncAt: undefined,
    nextRetryAt: undefined,
  })

  // ============================================================================
  // IndexedDB Management
  // ============================================================================

  let db: IDBDatabase | null = null
  let syncTimer: NodeJS.Timeout | null = null
  let retryTimer: NodeJS.Timeout | null = null

  /**
   * Initialize IndexedDB
   */
  async function initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineMessageQueue', 1)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        db = request.result
        isInitialized.value = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result
        
        // Create messages store
        if (!database.objectStoreNames.contains('messages')) {
          const store = database.createObjectStore('messages', { keyPath: 'id' })
          store.createIndex('priority', 'priority', { unique: false })
          store.createIndex('queuedAt', 'queuedAt', { unique: false })
          store.createIndex('retryCount', 'retryCount', { unique: false })
        }
      }
    })
  }

  /**
   * Load messages from IndexedDB
   */
  async function loadMessages(): Promise<void> {
    if (!db) return

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(['messages'], 'readonly')
      const store = transaction.objectStore('messages')
      const request = store.getAll()

      request.onsuccess = () => {
        queue.messages = request.result || []
        updateStats()
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to load messages from IndexedDB'))
      }
    })
  }

  /**
   * Save message to IndexedDB
   */
  async function saveMessage(message: OfflineMessage): Promise<void> {
    if (!db) return

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      const request = store.put(message)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save message to IndexedDB'))
    })
  }

  /**
   * Remove message from IndexedDB
   */
  async function removeMessage(messageId: string): Promise<void> {
    if (!db) return

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      const request = store.delete(messageId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to remove message from IndexedDB'))
    })
  }

  /**
   * Clear all messages from IndexedDB
   */
  async function clearMessages(): Promise<void> {
    if (!db) return

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      const request = store.clear()

      request.onsuccess = () => {
        queue.messages = []
        updateStats()
        resolve()
      }

      request.onerror = () => reject(new Error('Failed to clear messages from IndexedDB'))
    })
  }

  // ============================================================================
  // Queue Management
  // ============================================================================

  /**
   * Add message to offline queue
   */
  async function queueMessage(
    message: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    const offlineMessage: OfflineMessage = {
      id: generateMessageId(),
      message: {
        ...message,
        status: 'queued' as MessageStatus,
      },
      queuedAt: new Date(),
      retryCount: 0,
      maxRetries: queueConfig.maxRetries,
      priority,
    }

    // Check queue size limit
    if (queue.messages.length >= queueConfig.maxQueueSize) {
      // Remove oldest low priority message
      const oldestLowPriority = queue.messages
        .filter(m => m.priority === 'low')
        .sort((a, b) => a.queuedAt.getTime() - b.queuedAt.getTime())[0]
      
      if (oldestLowPriority) {
        await removeMessage(oldestLowPriority.id)
        queue.messages = queue.messages.filter(m => m.id !== oldestLowPriority.id)
      }
    }

    queue.messages.push(offlineMessage)
    await saveMessage(offlineMessage)
    updateStats()

    log('Message queued:', offlineMessage.id, priority)
    return offlineMessage.id
  }

  /**
   * Process queued messages
   */
  async function processQueue(sendMessageFn: (message: Message) => Promise<void>): Promise<void> {
    if (isProcessing.value || !isOnline.value || queue.messages.length === 0) {
      return
    }

    isProcessing.value = true
    lastError.value = null

    try {
      // Sort messages by priority and queue time
      const sortedMessages = [...queue.messages].sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        const aPriority = priorityOrder[a.priority]
        const bPriority = priorityOrder[b.priority]
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        
        return a.queuedAt.getTime() - b.queuedAt.getTime()
      })

      for (const offlineMessage of sortedMessages) {
        try {
          await sendMessageFn(offlineMessage.message)
          
          // Remove successful message from queue
          await removeMessage(offlineMessage.id)
          queue.messages = queue.messages.filter(m => m.id !== offlineMessage.id)
          
          log('Message sent successfully:', offlineMessage.id)
          
        } catch (error) {
          await handleMessageError(offlineMessage, error)
        }
      }

      queue.lastSyncAt = new Date()
      stats.lastSyncAt = queue.lastSyncAt
      updateStats()

    } catch (error) {
      lastError.value = {
        code: 'QUEUE_PROCESSING_FAILED',
        message: 'Failed to process message queue',
        details: error,
      }
      log('Queue processing failed:', error)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Handle message send error
   */
  async function handleMessageError(offlineMessage: OfflineMessage, error: any): Promise<void> {
    offlineMessage.retryCount++

    if (offlineMessage.retryCount >= offlineMessage.maxRetries) {
      // Mark as failed and remove from queue
      log('Message failed permanently:', offlineMessage.id, error)
      await removeMessage(offlineMessage.id)
      queue.messages = queue.messages.filter(m => m.id !== offlineMessage.id)
      stats.failedMessages++
    } else {
      // Schedule retry
      offlineMessage.message.status = 'failed' as MessageStatus
      await saveMessage(offlineMessage)
      
      const retryDelay = queueConfig.retryDelay * Math.pow(2, offlineMessage.retryCount - 1)
      stats.nextRetryAt = new Date(Date.now() + retryDelay)
      
      log('Message scheduled for retry:', offlineMessage.id, `attempt ${offlineMessage.retryCount}`)
    }

    updateStats()
  }

  /**
   * Retry failed messages
   */
  async function retryFailedMessages(sendMessageFn: (message: Message) => Promise<void>): Promise<void> {
    const failedMessages = queue.messages.filter(m => m.message.status === 'failed')
    
    for (const message of failedMessages) {
      message.message.status = 'queued' as MessageStatus
      await saveMessage(message)
    }

    await processQueue(sendMessageFn)
  }

  /**
   * Clear all queued messages
   */
  async function clearQueue(): Promise<void> {
    await clearMessages()
    queue.messages = []
    updateStats()
    log('Queue cleared')
  }

  /**
   * Get message by ID
   */
  function getMessage(messageId: string): OfflineMessage | undefined {
    return queue.messages.find(m => m.id === messageId)
  }

  /**
   * Update message status
   */
  async function updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    const message = getMessage(messageId)
    if (message) {
      message.message.status = status
      await saveMessage(message)
      updateStats()
    }
  }

  // ============================================================================
  // Network Status Management
  // ============================================================================

  /**
   * Update online status
   */
  function updateOnlineStatus(): void {
    const wasOffline = !isOnline.value
    isOnline.value = navigator.onLine
    queue.isOnline = navigator.onLine

    if (wasOffline && isOnline.value) {
      log('Connection restored, processing queue')
      // Queue will be processed by the sync timer
    } else if (!isOnline.value) {
      log('Connection lost, messages will be queued')
    }
  }

  /**
   * Setup network listeners
   */
  function setupNetworkListeners(): () => void {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }

  // ============================================================================
  // Sync Management
  // ============================================================================

  /**
   * Start automatic sync
   */
  function startSync(sendMessageFn: (message: Message) => Promise<void>): void {
    if (syncTimer) return

    syncTimer = setInterval(async () => {
      if (isOnline.value && queue.messages.length > 0) {
        await processQueue(sendMessageFn)
      }
    }, queueConfig.syncInterval)

    log('Auto-sync started')
  }

  /**
   * Stop automatic sync
   */
  function stopSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer)
      syncTimer = null
      log('Auto-sync stopped')
    }
  }

  /**
   * Start retry timer for failed messages
   */
  function startRetryTimer(sendMessageFn: (message: Message) => Promise<void>): void {
    if (retryTimer) return

    retryTimer = setInterval(async () => {
      if (isOnline.value) {
        await retryFailedMessages(sendMessageFn)
      }
    }, queueConfig.retryDelay)

    log('Retry timer started')
  }

  /**
   * Stop retry timer
   */
  function stopRetryTimer(): void {
    if (retryTimer) {
      clearInterval(retryTimer)
      retryTimer = null
      log('Retry timer stopped')
    }
  }

  // ============================================================================
  // Statistics and Monitoring
  // ============================================================================

  /**
   * Update queue statistics
   */
  function updateStats(): void {
    stats.totalMessages = queue.messages.length
    stats.pendingMessages = queue.messages.filter(m => m.message.status === 'queued').length
    stats.failedMessages = queue.messages.filter(m => m.message.status === 'failed').length
    queue.pendingCount = stats.pendingMessages
  }

  /**
   * Get queue statistics
   */
  const queueStats = computed(() => ({
    total: stats.totalMessages,
    pending: stats.pendingMessages,
    failed: stats.failedMessages,
    lastSync: stats.lastSyncAt,
    nextRetry: stats.nextRetryAt,
    isOnline: isOnline.value,
    isProcessing: isProcessing.value,
  }))

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Generate unique message ID
   */
  function generateMessageId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log message if debug is enabled
   */
  function log(...args: any[]): void {
    if (queueConfig.debug) {
      console.log('[OfflineQueue]', ...args)
    }
  }

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Initialize the offline queue
   */
  async function initialize(): Promise<void> {
    try {
      await initializeDB()
      await loadMessages()
      updateStats()
      log('Offline queue initialized')
    } catch (error) {
      console.error('Failed to initialize offline queue:', error)
      throw error
    }
  }

  /**
   * Cleanup resources
   */
  function cleanup(): void {
    stopSync()
    stopRetryTimer()
    if (db) {
      db.close()
      db = null
    }
    log('Offline queue cleaned up')
  }

  // ============================================================================
  // Composable API
  // ============================================================================

  return {
    // State
    isOnline: computed(() => isOnline.value),
    isInitialized: computed(() => isInitialized.value),
    isProcessing: computed(() => isProcessing.value),
    queue: computed(() => queue),
    stats: queueStats,
    error: computed(() => lastError.value),

    // Actions
    initialize,
    queueMessage,
    processQueue,
    retryFailedMessages,
    clearQueue,
    getMessage,
    updateMessageStatus,
    startSync,
    stopSync,
    startRetryTimer,
    stopRetryTimer,
    cleanup,

    // Setup
    setupNetworkListeners,
  }
}
