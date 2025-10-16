import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Error types
export interface AppError {
  id: string
  message: string
  stack?: string
  component?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'network' | 'validation' | 'permission' | 'system' | 'unknown'
  context?: Record<string, any>
  userAction?: string
  recoverable: boolean
}

export interface ErrorReport {
  error: AppError
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  timestamp: Date
}

// Error boundary state
const errors = ref<AppError[]>([])
const isErrorBoundaryActive = ref(false)
const maxErrors = 50

export function useErrorHandler() {
  const { t } = useI18n()

  // Computed properties
  const hasErrors = computed(() => errors.value.length > 0)
  const criticalErrors = computed(() => errors.value.filter((e) => e.severity === 'critical'))
  const recentErrors = computed(() =>
    errors.value.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
  )
  const errorCounts = computed(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 }
    errors.value.forEach((error) => {
      counts[error.severity]++
    })
    return counts
  })

  // Error creation
  function createError(
    message: string,
    options: {
      stack?: string
      component?: string
      severity?: AppError['severity']
      category?: AppError['category']
      context?: Record<string, any>
      userAction?: string
      recoverable?: boolean
    } = {},
  ): AppError {
    const error: AppError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      stack: options.stack || new Error().stack,
      component: options.component,
      timestamp: new Date(),
      severity: options.severity || 'medium',
      category: options.category || 'unknown',
      context: options.context,
      userAction: options.userAction,
      recoverable: options.recoverable ?? true,
    }

    return error
  }

  // Error handling
  function handleError(error: Error | AppError, context?: Record<string, any>) {
    let appError: AppError

    if ('id' in error) {
      // Already an AppError
      appError = error
    } else {
      // Convert Error to AppError
      appError = createError(error.message, {
        stack: error.stack,
        context,
        severity: 'medium',
        category: 'system',
      })
    }

    // Add to errors list
    addError(appError)

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Application Error:', appError)
    }

    // Report to external service in production
    if (import.meta.env.PROD) {
      reportError(appError)
    }

    return appError
  }

  // Add error to list
  function addError(error: AppError) {
    errors.value.unshift(error)

    // Keep only the most recent errors
    if (errors.value.length > maxErrors) {
      errors.value = errors.value.slice(0, maxErrors)
    }

    // Trigger error boundary if critical
    if (error.severity === 'critical') {
      triggerErrorBoundary(error)
    }
  }

  // Remove error
  function removeError(errorId: string) {
    const index = errors.value.findIndex((e) => e.id === errorId)
    if (index !== -1) {
      errors.value.splice(index, 1)
    }
  }

  // Clear all errors
  function clearAllErrors() {
    errors.value = []
  }

  // Clear errors by severity
  function clearErrorsBySeverity(severity: AppError['severity']) {
    errors.value = errors.value.filter((e) => e.severity !== severity)
  }

  // Error boundary management
  function triggerErrorBoundary(error: AppError) {
    isErrorBoundaryActive.value = true

    // Show error boundary UI
    showErrorBoundaryUI(error)
  }

  function dismissErrorBoundary() {
    isErrorBoundaryActive.value = false
  }

  function showErrorBoundaryUI(error: AppError) {
    // This would typically show a modal or overlay
    // For now, we'll just log it
    console.error('Error Boundary Triggered:', error)
  }

  // Error reporting
  function reportError(error: AppError) {
    const report: ErrorReport = {
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: getSessionId(),
      timestamp: new Date(),
    }

    // Send to external service (e.g., Sentry, LogRocket, etc.)
    sendErrorReport(report)
  }

  function sendErrorReport(report: ErrorReport) {
    // In a real implementation, this would send to an external service
    console.log('Error Report:', report)

    // Example: Send to Sentry
    // Sentry.captureException(new Error(report.error.message), {
    //   tags: {
    //     component: report.error.component,
    //     severity: report.error.severity,
    //     category: report.error.category,
    //   },
    //   extra: report.error.context,
    // })
  }

  // Session management
  function getSessionId(): string {
    let sessionId = sessionStorage.getItem('app_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('app_session_id', sessionId)
    }
    return sessionId
  }

  // Global error handlers
  function setupGlobalErrorHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = createError(`Unhandled Promise Rejection: ${event.reason}`, {
        severity: 'high',
        category: 'system',
        context: { reason: event.reason },
      })
      handleError(error)
    })

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      const error = createError(event.message || 'Unknown JavaScript Error', {
        stack: event.error?.stack,
        severity: 'high',
        category: 'system',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
      handleError(error)
    })

    // Resource loading errors
    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          const error = createError(
            `Resource Loading Error: ${(event.target as any)?.src || 'Unknown resource'}`,
            {
              severity: 'medium',
              category: 'system',
              context: {
                tagName: (event.target as any)?.tagName,
                src: (event.target as any)?.src,
              },
            },
          )
          handleError(error)
        }
      },
      true,
    )
  }

  // Network error handling
  function handleNetworkError(error: any, context?: Record<string, any>) {
    const appError = createError(`Network Error: ${error.message || 'Request failed'}`, {
      severity: 'medium',
      category: 'network',
      context: {
        ...context,
        status: error.status,
        statusText: error.statusText,
        url: error.config?.url,
      },
      recoverable: true,
    })
    handleError(appError)
  }

  // Validation error handling
  function handleValidationError(field: string, message: string, value?: any) {
    const appError = createError(`Validation Error: ${message}`, {
      severity: 'low',
      category: 'validation',
      context: { field, value },
      recoverable: true,
    })
    handleError(appError)
  }

  // Permission error handling
  function handlePermissionError(action: string, resource?: string) {
    const appError = createError(
      `Permission Denied: ${action}${resource ? ` on ${resource}` : ''}`,
      {
        severity: 'medium',
        category: 'permission',
        context: { action, resource },
        recoverable: false,
      },
    )
    handleError(appError)
  }

  // Retry mechanism
  function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let attempts = 0

      const attempt = async () => {
        try {
          const result = await operation()
          resolve(result)
        } catch (error) {
          attempts++

          if (attempts < maxRetries) {
            const appError = createError(`Operation failed, retrying (${attempts}/${maxRetries})`, {
              severity: 'low',
              category: 'system',
              context: { attempts, maxRetries, error: error.message },
              recoverable: true,
            })
            addError(appError)

            setTimeout(attempt, delay * attempts)
          } else {
            const appError = createError(`Operation failed after ${maxRetries} attempts`, {
              severity: 'high',
              category: 'system',
              context: { attempts, maxRetries, error: error.message },
              recoverable: false,
            })
            handleError(appError)
            reject(error)
          }
        }
      }

      attempt()
    })
  }

  // Error recovery
  function recoverFromError(errorId: string) {
    const error = errors.value.find((e) => e.id === errorId)
    if (error && error.recoverable) {
      // Implement recovery logic based on error type
      switch (error.category) {
        case 'network':
          // Retry network operations
          break
        case 'validation':
          // Clear validation errors
          break
        case 'permission':
          // Redirect to login or show permission dialog
          break
        default:
          // Generic recovery
          break
      }

      removeError(errorId)
    }
  }

  // Error analytics
  function getErrorAnalytics() {
    const total = errors.value.length
    const bySeverity = errorCounts.value
    const byCategory = errors.value.reduce(
      (acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const recent = recentErrors.value.length
    const critical = criticalErrors.value.length

    return {
      total,
      recent,
      critical,
      bySeverity,
      byCategory,
    }
  }

  // Lifecycle
  onMounted(() => {
    setupGlobalErrorHandlers()
  })

  onUnmounted(() => {
    // Cleanup if needed
  })

  return {
    // State
    errors,
    isErrorBoundaryActive,
    hasErrors,
    criticalErrors,
    recentErrors,
    errorCounts,

    // Methods
    createError,
    handleError,
    addError,
    removeError,
    clearAllErrors,
    clearErrorsBySeverity,
    triggerErrorBoundary,
    dismissErrorBoundary,
    handleNetworkError,
    handleValidationError,
    handlePermissionError,
    retryOperation,
    recoverFromError,
    getErrorAnalytics,
  }
}
