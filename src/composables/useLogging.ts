import { ref, computed, onMounted, onUnmounted } from 'vue'

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

// Log entry types
export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  timestamp: Date
  category: 'user' | 'system' | 'network' | 'security' | 'performance' | 'error'
  context?: Record<string, any>
  userId?: string
  sessionId: string
  component?: string
  action?: string
  duration?: number
  stack?: string
}

export interface LogFilter {
  level?: LogLevel[]
  category?: string[]
  component?: string[]
  userId?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface LogAnalytics {
  total: number
  byLevel: Record<LogLevel, number>
  byCategory: Record<string, number>
  byComponent: Record<string, number>
  recentErrors: LogEntry[]
  performanceMetrics: {
    averageResponseTime: number
    errorRate: number
    userActivityRate: number
  }
}

// Logging state
const logs = ref<LogEntry[]>([])
const isLoggingEnabled = ref(true)
const maxLogs = 10000
const sessionId = ref('')

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
}

export function useLogging() {
  // Computed properties
  const hasLogs = computed(() => logs.value.length > 0)
  const recentLogs = computed(() =>
    logs.value.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 100),
  )

  const errorLogs = computed(() =>
    logs.value.filter((log) => log.level === 'error' || log.level === 'critical'),
  )

  const logsByLevel = computed(() => {
    const levels: Record<LogLevel, LogEntry[]> = {
      debug: [],
      info: [],
      warn: [],
      error: [],
      critical: [],
    }

    logs.value.forEach((log) => {
      levels[log.level].push(log)
    })

    return levels
  })

  const logsByCategory = computed(() => {
    const categories: Record<string, LogEntry[]> = {}
    logs.value.forEach((log) => {
      if (!categories[log.category]) {
        categories[log.category] = []
      }
      categories[log.category].push(log)
    })
    return categories
  })

  // Initialize logging
  function initializeLogging() {
    sessionId.value = getSessionId()

    // Set up global error logging
    setupGlobalErrorLogging()

    // Set up performance logging
    setupPerformanceLogging()

    // Set up user activity logging
    setupUserActivityLogging()
  }

  function getSessionId(): string {
    let id = sessionStorage.getItem('logging_session_id')
    if (!id) {
      id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('logging_session_id', id)
    }
    return id
  }

  // Core logging functions
  function log(
    level: LogLevel,
    message: string,
    options: {
      category?: LogEntry['category']
      context?: Record<string, any>
      userId?: string
      component?: string
      action?: string
      duration?: number
      stack?: string
    } = {},
  ) {
    if (!isLoggingEnabled.value) return

    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: new Date(),
      category: options.category || 'system',
      context: options.context,
      userId: options.userId,
      sessionId: sessionId.value,
      component: options.component,
      action: options.action,
      duration: options.duration,
      stack: options.stack,
    }

    logs.value.unshift(logEntry)

    // Keep only the most recent logs
    if (logs.value.length > maxLogs) {
      logs.value = logs.value.slice(0, maxLogs)
    }

    // Log to console based on level
    logToConsole(logEntry)

    // Send to external service for critical logs
    if (level === 'critical' || level === 'error') {
      sendToExternalService(logEntry)
    }
  }

  // Convenience methods
  function debug(message: string, context?: Record<string, any>, component?: string) {
    log('debug', message, { context, component })
  }

  function info(message: string, context?: Record<string, any>, component?: string) {
    log('info', message, { context, component })
  }

  function warn(message: string, context?: Record<string, any>, component?: string) {
    log('warn', message, { context, component })
  }

  function error(
    message: string,
    context?: Record<string, any>,
    component?: string,
    stack?: string,
  ) {
    log('error', message, { context, component, stack })
  }

  function critical(
    message: string,
    context?: Record<string, any>,
    component?: string,
    stack?: string,
  ) {
    log('critical', message, { context, component, stack })
  }

  // Specific logging categories
  function logUserAction(action: string, context?: Record<string, any>, userId?: string) {
    log('info', `User action: ${action}`, {
      category: 'user',
      action,
      context,
      userId,
    })
  }

  function logSystemEvent(event: string, context?: Record<string, any>, component?: string) {
    log('info', `System event: ${event}`, {
      category: 'system',
      context,
      component,
    })
  }

  function logNetworkRequest(
    method: string,
    url: string,
    status: number,
    duration?: number,
    context?: Record<string, any>,
  ) {
    const level: LogLevel = status >= 400 ? 'error' : 'info'

    log(level, `Network request: ${method} ${url}`, {
      category: 'network',
      context: {
        method,
        url,
        status,
        duration,
        ...context,
      },
    })
  }

  function logSecurityEvent(event: string, context?: Record<string, any>, userId?: string) {
    log('warn', `Security event: ${event}`, {
      category: 'security',
      context,
      userId,
    })
  }

  function logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context?: Record<string, any>,
  ) {
    log('info', `Performance metric: ${metric}`, {
      category: 'performance',
      context: {
        metric,
        value,
        unit,
        ...context,
      },
    })
  }

  // Console logging
  function logToConsole(logEntry: LogEntry) {
    const timestamp = logEntry.timestamp.toISOString()
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}]`
    const message = `${prefix} ${logEntry.message}`

    if (logEntry.context) {
      console.group(message)
      console.log('Context:', logEntry.context)
      if (logEntry.stack) {
        console.log('Stack:', logEntry.stack)
      }
      console.groupEnd()
    } else {
      switch (logEntry.level) {
        case 'debug':
          console.debug(message)
          break
        case 'info':
          console.info(message)
          break
        case 'warn':
          console.warn(message)
          break
        case 'error':
        case 'critical':
          console.error(message)
          if (logEntry.stack) {
            console.error(logEntry.stack)
          }
          break
      }
    }
  }

  // External service integration
  function sendToExternalService(logEntry: LogEntry) {
    // In a real implementation, this would send to services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - DataDog for log aggregation
    // - Custom logging API

    console.log('Sending to external service:', logEntry)

    // Example: Send to Sentry
    // if (logEntry.level === 'error' || logEntry.level === 'critical') {
    //   Sentry.captureMessage(logEntry.message, {
    //     level: logEntry.level,
    //     tags: {
    //       category: logEntry.category,
    //       component: logEntry.component,
    //     },
    //     extra: logEntry.context,
    //   })
    // }
  }

  // Global error logging setup
  function setupGlobalErrorLogging() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      })
    })

    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      error(
        'Global JavaScript Error',
        {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        'global',
        event.error?.stack,
      )
    })

    // Resource loading errors
    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          error('Resource Loading Error', {
            tagName: (event.target as any)?.tagName,
            src: (event.target as any)?.src,
            href: (event.target as any)?.href,
          })
        }
      },
      true,
    )
  }

  // Performance logging setup
  function setupPerformanceLogging() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          logPerformanceMetric('long_task', entry.duration, 'ms', {
            startTime: entry.startTime,
            name: entry.name,
          })
        })
      })

      longTaskObserver.observe({ entryTypes: ['longtask'] })
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setInterval(() => {
        logPerformanceMetric('memory_usage', memory.usedJSHeapSize, 'bytes', {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        })
      }, 30000) // Every 30 seconds
    }
  }

  // User activity logging setup
  function setupUserActivityLogging() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      logUserAction('page_visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      })
    })

    // Track focus changes
    window.addEventListener('focus', () => {
      logUserAction('window_focus')
    })

    window.addEventListener('blur', () => {
      logUserAction('window_blur')
    })

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      logUserAction('page_unload')
    })
  }

  // Log filtering and search
  function filterLogs(filter: LogFilter): LogEntry[] {
    return logs.value.filter((log) => {
      // Level filter
      if (filter.level && !filter.level.includes(log.level)) {
        return false
      }

      // Category filter
      if (filter.category && !filter.category.includes(log.category)) {
        return false
      }

      // Component filter
      if (filter.component && !filter.component.includes(log.component || '')) {
        return false
      }

      // User filter
      if (filter.userId && log.userId !== filter.userId) {
        return false
      }

      // Date range filter
      if (filter.startDate && log.timestamp < filter.startDate) {
        return false
      }

      if (filter.endDate && log.timestamp > filter.endDate) {
        return false
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const messageMatch = log.message.toLowerCase().includes(searchLower)
        const contextMatch =
          log.context &&
          Object.values(log.context).some((value) =>
            String(value).toLowerCase().includes(searchLower),
          )

        if (!messageMatch && !contextMatch) {
          return false
        }
      }

      return true
    })
  }

  // Log analytics
  function getLogAnalytics(): LogAnalytics {
    const total = logs.value.length
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0,
    }

    const byCategory: Record<string, number> = {}
    const byComponent: Record<string, number> = {}

    logs.value.forEach((log) => {
      byLevel[log.level]++

      byCategory[log.category] = (byCategory[log.category] || 0) + 1

      if (log.component) {
        byComponent[log.component] = (byComponent[log.component] || 0) + 1
      }
    })

    const recentErrors = errorLogs.value.slice(0, 10)

    // Calculate performance metrics
    const performanceLogs = logsByCategory.value.performance || []
    const averageResponseTime =
      performanceLogs.length > 0
        ? performanceLogs.reduce((sum, log) => sum + (log.duration || 0), 0) /
          performanceLogs.length
        : 0

    const errorRate = total > 0 ? (byLevel.error + byLevel.critical) / total : 0

    const userLogs = logsByCategory.value.user || []
    const userActivityRate =
      userLogs.length /
      Math.max(
        1,
        Math.floor(
          (Date.now() - logs.value[logs.value.length - 1]?.timestamp.getTime() || 0) / 60000,
        ),
      )

    return {
      total,
      byLevel,
      byCategory,
      byComponent,
      recentErrors,
      performanceMetrics: {
        averageResponseTime,
        errorRate,
        userActivityRate,
      },
    }
  }

  // Log export
  function exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(logs.value, null, 2)
    } else {
      // CSV format
      const headers = ['timestamp', 'level', 'category', 'component', 'message', 'context']
      const csvRows = [headers.join(',')]

      logs.value.forEach((log) => {
        const row = [
          log.timestamp.toISOString(),
          log.level,
          log.category,
          log.component || '',
          `"${log.message.replace(/"/g, '""')}"`,
          log.context ? `"${JSON.stringify(log.context).replace(/"/g, '""')}"` : '',
        ]
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    }
  }

  // Clear logs
  function clearLogs() {
    logs.value = []
  }

  function clearLogsByLevel(level: LogLevel) {
    logs.value = logs.value.filter((log) => log.level !== level)
  }

  function clearLogsByCategory(category: LogEntry['category']) {
    logs.value = logs.value.filter((log) => log.category !== category)
  }

  // Enable/disable logging
  function enableLogging() {
    isLoggingEnabled.value = true
  }

  function disableLogging() {
    isLoggingEnabled.value = false
  }

  // Lifecycle
  onMounted(() => {
    initializeLogging()
  })

  onUnmounted(() => {
    // Cleanup if needed
  })

  return {
    // State
    logs,
    isLoggingEnabled,
    hasLogs,
    recentLogs,
    errorLogs,
    logsByLevel,
    logsByCategory,

    // Methods
    log,
    debug,
    info,
    warn,
    error,
    critical,
    logUserAction,
    logSystemEvent,
    logNetworkRequest,
    logSecurityEvent,
    logPerformanceMetric,
    filterLogs,
    getLogAnalytics,
    exportLogs,
    clearLogs,
    clearLogsByLevel,
    clearLogsByCategory,
    enableLogging,
    disableLogging,
  }
}
