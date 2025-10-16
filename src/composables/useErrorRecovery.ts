/**
 * Error Recovery Composable
 * Provides comprehensive error handling and recovery mechanisms for the Community Communication Hub
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { ApiError } from '@/types/communication'

interface ErrorRecoveryConfig {
  maxRetries: number
  retryDelay: number
  exponentialBackoff: boolean
  maxRetryDelay: number
  autoRetry: boolean
  debug?: boolean
}

interface ErrorState {
  hasError: boolean
  error: ApiError | null
  retryCount: number
  lastRetryAt: Date | null
  nextRetryAt: Date | null
  isRetrying: boolean
}

interface RecoveryAction {
  id: string
  name: string
  action: () => Promise<void>
  priority: 'high' | 'normal' | 'low'
  maxRetries: number
  retryCount: number
  lastAttempt: Date | null
  nextAttempt: Date | null
}

export function useErrorRecovery(config: Partial<ErrorRecoveryConfig> = {}) {
  // ============================================================================
  // Configuration
  // ============================================================================

  const defaultConfig: Required<ErrorRecoveryConfig> = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    exponentialBackoff: true,
    maxRetryDelay: 30000, // 30 seconds
    autoRetry: true,
    debug: false,
  }

  const recoveryConfig = { ...defaultConfig, ...config }

  // ============================================================================
  // State
  // ============================================================================

  const errorState = reactive<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0,
    lastRetryAt: null,
    nextRetryAt: null,
    isRetrying: false,
  })

  const recoveryActions = reactive<Map<string, RecoveryAction>>(new Map())
  const isInitialized = ref(false)
  const retryTimer = ref<NodeJS.Timeout | null>(null)

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Handle an error with automatic recovery
   */
  function handleError(error: ApiError, context?: string): void {
    errorState.hasError = true
    errorState.error = error
    errorState.retryCount = 0
    errorState.lastRetryAt = null
    errorState.nextRetryAt = null

    log('Error occurred:', error, context)

    if (recoveryConfig.autoRetry) {
      scheduleRetry()
    }
  }

  /**
   * Clear current error
   */
  function clearError(): void {
    errorState.hasError = false
    errorState.error = null
    errorState.retryCount = 0
    errorState.lastRetryAt = null
    errorState.nextRetryAt = null
    errorState.isRetrying = false

    if (retryTimer.value) {
      clearTimeout(retryTimer.value)
      retryTimer.value = null
    }

    log('Error cleared')
  }

  /**
   * Schedule automatic retry
   */
  function scheduleRetry(): void {
    if (errorState.retryCount >= recoveryConfig.maxRetries) {
      log('Max retries reached, stopping automatic retry')
      return
    }

    const delay = calculateRetryDelay()
    errorState.nextRetryAt = new Date(Date.now() + delay)
    errorState.isRetrying = true

    retryTimer.value = setTimeout(() => {
      performRetry()
    }, delay)

    log(
      `Retry scheduled in ${delay}ms (attempt ${errorState.retryCount + 1}/${recoveryConfig.maxRetries})`,
    )
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  function calculateRetryDelay(): number {
    if (!recoveryConfig.exponentialBackoff) {
      return recoveryConfig.retryDelay
    }

    const delay = recoveryConfig.retryDelay * Math.pow(2, errorState.retryCount)
    return Math.min(delay, recoveryConfig.maxRetryDelay)
  }

  /**
   * Perform retry attempt
   */
  async function performRetry(): Promise<void> {
    if (errorState.retryCount >= recoveryConfig.maxRetries) {
      log('Max retries reached, cannot retry')
      return
    }

    errorState.retryCount++
    errorState.lastRetryAt = new Date()
    errorState.isRetrying = true

    log(`Performing retry attempt ${errorState.retryCount}/${recoveryConfig.maxRetries}`)

    try {
      // Execute recovery actions
      await executeRecoveryActions()

      // If we get here, recovery was successful
      clearError()
      log('Recovery successful')
    } catch (error) {
      log('Retry failed:', error)

      if (errorState.retryCount < recoveryConfig.maxRetries) {
        // Schedule next retry
        scheduleRetry()
      } else {
        // Max retries reached
        errorState.isRetrying = false
        log('Max retries reached, recovery failed')
      }
    }
  }

  // ============================================================================
  // Recovery Actions Management
  // ============================================================================

  /**
   * Register a recovery action
   */
  function registerRecoveryAction(
    id: string,
    name: string,
    action: () => Promise<void>,
    priority: 'high' | 'normal' | 'low' = 'normal',
    maxRetries: number = 3,
  ): void {
    const recoveryAction: RecoveryAction = {
      id,
      name,
      action,
      priority,
      maxRetries,
      retryCount: 0,
      lastAttempt: null,
      nextAttempt: null,
    }

    recoveryActions.set(id, recoveryAction)
    log(`Recovery action registered: ${name}`)
  }

  /**
   * Unregister a recovery action
   */
  function unregisterRecoveryAction(id: string): void {
    recoveryActions.delete(id)
    log(`Recovery action unregistered: ${id}`)
  }

  /**
   * Execute all recovery actions
   */
  async function executeRecoveryActions(): Promise<void> {
    const actions = Array.from(recoveryActions.values()).sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    for (const action of actions) {
      if (action.retryCount >= action.maxRetries) {
        log(`Skipping action ${action.name} - max retries reached`)
        continue
      }

      try {
        action.retryCount++
        action.lastAttempt = new Date()

        log(`Executing recovery action: ${action.name}`)
        await action.action()

        log(`Recovery action successful: ${action.name}`)
      } catch (error) {
        log(`Recovery action failed: ${action.name}`, error)

        // Calculate next attempt time
        const delay = calculateRetryDelay()
        action.nextAttempt = new Date(Date.now() + delay)

        // If this is a critical action, throw the error
        if (action.priority === 'high') {
          throw error
        }
      }
    }
  }

  // ============================================================================
  // Network Error Handling
  // ============================================================================

  /**
   * Handle network errors specifically
   */
  function handleNetworkError(error: any, context?: string): void {
    const networkError: ApiError = {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      details: {
        originalError: error,
        context,
        timestamp: new Date(),
      },
    }

    handleError(networkError, context)
  }

  /**
   * Handle API errors specifically
   */
  function handleApiError(error: any, context?: string): void {
    const apiError: ApiError = {
      code: error.code || 'API_ERROR',
      message: error.message || 'API request failed',
      details: {
        originalError: error,
        context,
        timestamp: new Date(),
      },
    }

    handleError(apiError, context)
  }

  /**
   * Handle WebSocket errors specifically
   */
  function handleWebSocketError(error: any, context?: string): void {
    const wsError: ApiError = {
      code: 'WEBSOCKET_ERROR',
      message: 'WebSocket connection failed',
      details: {
        originalError: error,
        context,
        timestamp: new Date(),
      },
    }

    handleError(wsError, context)
  }

  // ============================================================================
  // Recovery Strategies
  // ============================================================================

  /**
   * Register common recovery strategies
   */
  function registerCommonStrategies(): void {
    // Network reconnection strategy
    registerRecoveryAction(
      'network-reconnect',
      'Reconnect to network',
      async () => {
        // Check if online
        if (!navigator.onLine) {
          throw new Error('Network is offline')
        }

        // Trigger a simple network request to test connectivity
        const response = await fetch('/api/health', { method: 'HEAD' })
        if (!response.ok) {
          throw new Error('Network test failed')
        }
      },
      'high',
    )

    // WebSocket reconnection strategy
    registerRecoveryAction(
      'websocket-reconnect',
      'Reconnect WebSocket',
      async () => {
        // This would be implemented by the WebSocket service
        // For now, we'll just log it
        log('WebSocket reconnection would be triggered here')
      },
      'high',
    )

    // Cache refresh strategy
    registerRecoveryAction(
      'cache-refresh',
      'Refresh application cache',
      async () => {
        // Clear relevant caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        }
      },
      'normal',
    )

    // Local storage cleanup strategy
    registerRecoveryAction(
      'storage-cleanup',
      'Cleanup local storage',
      async () => {
        // Remove old or corrupted data
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('temp_')) {
            keysToRemove.push(key)
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key))
      },
      'low',
    )
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Check if error is recoverable
   */
  function isRecoverableError(error: ApiError): boolean {
    const recoverableCodes = [
      'NETWORK_ERROR',
      'WEBSOCKET_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR',
    ]

    return recoverableCodes.includes(error.code)
  }

  /**
   * Get error severity
   */
  function getErrorSeverity(error: ApiError): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      NETWORK_ERROR: 'medium',
      WEBSOCKET_ERROR: 'medium',
      API_ERROR: 'high',
      VALIDATION_ERROR: 'low',
      AUTHENTICATION_ERROR: 'high',
      AUTHORIZATION_ERROR: 'high',
      RATE_LIMIT_ERROR: 'medium',
      SERVER_ERROR: 'high',
      UNKNOWN_ERROR: 'critical',
    }

    return severityMap[error.code] || 'medium'
  }

  /**
   * Get user-friendly error message
   */
  function getErrorMessage(error: ApiError): string {
    const messageMap: Record<string, string> = {
      NETWORK_ERROR: 'Connection lost. Please check your internet connection.',
      WEBSOCKET_ERROR: 'Real-time connection lost. Attempting to reconnect...',
      API_ERROR: 'Service temporarily unavailable. Please try again.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      AUTHENTICATION_ERROR: 'Please log in again to continue.',
      AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
      RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
      SERVER_ERROR: 'Server error occurred. Please try again later.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    }

    return messageMap[error.code] || error.message || 'An error occurred'
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const canRetry = computed(
    () => errorState.retryCount < recoveryConfig.maxRetries && !errorState.isRetrying,
  )

  const retryProgress = computed(() => errorState.retryCount / recoveryConfig.maxRetries)

  const timeUntilRetry = computed(() => {
    if (!errorState.nextRetryAt) return 0
    return Math.max(0, errorState.nextRetryAt.getTime() - Date.now())
  })

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Initialize error recovery
   */
  function initialize(): void {
    if (isInitialized.value) return

    registerCommonStrategies()
    isInitialized.value = true

    log('Error recovery initialized')
  }

  /**
   * Cleanup error recovery
   */
  function cleanup(): void {
    if (retryTimer.value) {
      clearTimeout(retryTimer.value)
      retryTimer.value = null
    }

    recoveryActions.clear()
    clearError()
    isInitialized.value = false

    log('Error recovery cleaned up')
  }

  // ============================================================================
  // Logging
  // ============================================================================

  function log(...args: any[]): void {
    if (recoveryConfig.debug) {
      console.log('[ErrorRecovery]', ...args)
    }
  }

  // ============================================================================
  // Composable API
  // ============================================================================

  return {
    // State
    errorState: computed(() => errorState),
    canRetry,
    retryProgress,
    timeUntilRetry,
    isInitialized: computed(() => isInitialized.value),

    // Error handling
    handleError,
    handleNetworkError,
    handleApiError,
    handleWebSocketError,
    clearError,

    // Recovery actions
    registerRecoveryAction,
    unregisterRecoveryAction,
    executeRecoveryActions,

    // Manual retry
    retry: performRetry,

    // Utility functions
    isRecoverableError,
    getErrorSeverity,
    getErrorMessage,

    // Lifecycle
    initialize,
    cleanup,
  }
}
