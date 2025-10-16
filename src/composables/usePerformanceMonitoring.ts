import { ref, computed, onMounted, onUnmounted } from 'vue'

// Performance metrics types
export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: Date
  category: 'navigation' | 'resource' | 'paint' | 'custom' | 'user-interaction'
  context?: Record<string, any>
}

export interface PerformanceThreshold {
  name: string
  threshold: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  severity: 'warning' | 'error' | 'critical'
}

export interface PerformanceReport {
  sessionId: string
  userId?: string
  timestamp: Date
  metrics: PerformanceMetric[]
  thresholds: PerformanceThreshold[]
  userAgent: string
  url: string
}

// Performance thresholds based on success criteria
const PERFORMANCE_THRESHOLDS: PerformanceThreshold[] = [
  // SC-001: Message delivery timing within 1 second (95% of time)
  { name: 'message_delivery_time', threshold: 1000, unit: 'ms', severity: 'error' },

  // SC-003: Typing indicator response time (200ms)
  { name: 'typing_indicator_response', threshold: 200, unit: 'ms', severity: 'warning' },

  // SC-004: Presence status update timing (500ms)
  { name: 'presence_update_time', threshold: 500, unit: 'ms', severity: 'warning' },

  // SC-005: First message send time (30 seconds, 90% users)
  { name: 'first_message_send_time', threshold: 30000, unit: 'ms', severity: 'error' },

  // SC-006: Search response time (2 seconds, 10k messages)
  { name: 'search_response_time', threshold: 2000, unit: 'ms', severity: 'error' },

  // SC-010: Interface load time on 3G (3 seconds)
  { name: 'interface_load_time', threshold: 3000, unit: 'ms', severity: 'error' },

  // SC-009: Event creation completion time (5 minutes, 95% users)
  { name: 'event_creation_time', threshold: 300000, unit: 'ms', severity: 'error' },
]

// Performance monitoring state
const metrics = ref<PerformanceMetric[]>([])
const isMonitoring = ref(false)
const sessionId = ref('')
const maxMetrics = 1000

export function usePerformanceMonitoring() {
  // Computed properties
  const hasMetrics = computed(() => metrics.value.length > 0)
  const recentMetrics = computed(() =>
    metrics.value.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50),
  )

  const metricsByCategory = computed(() => {
    const categories: Record<string, PerformanceMetric[]> = {}
    metrics.value.forEach((metric) => {
      if (!categories[metric.category]) {
        categories[metric.category] = []
      }
      categories[metric.category].push(metric)
    })
    return categories
  })

  const thresholdViolations = computed(() => {
    const violations: Array<{ metric: PerformanceMetric; threshold: PerformanceThreshold }> = []

    metrics.value.forEach((metric) => {
      const threshold = PERFORMANCE_THRESHOLDS.find((t) => t.name === metric.name)
      if (threshold && metric.value > threshold.threshold) {
        violations.push({ metric, threshold })
      }
    })

    return violations
  })

  const performanceScore = computed(() => {
    if (metrics.value.length === 0) return 100

    const violations = thresholdViolations.value
    const totalMetrics = metrics.value.length
    const violationCount = violations.length

    return Math.max(0, 100 - (violationCount / totalMetrics) * 100)
  })

  // Initialize monitoring
  function initializeMonitoring() {
    if (isMonitoring.value) return

    sessionId.value = getSessionId()
    isMonitoring.value = true

    // Start monitoring core web vitals
    monitorCoreWebVitals()

    // Start monitoring custom metrics
    monitorCustomMetrics()

    // Start monitoring resource performance
    monitorResourcePerformance()

    // Start monitoring user interactions
    monitorUserInteractions()
  }

  function stopMonitoring() {
    isMonitoring.value = false
  }

  // Session management
  function getSessionId(): string {
    let id = sessionStorage.getItem('performance_session_id')
    if (!id) {
      id = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('performance_session_id', id)
    }
    return id
  }

  // Core Web Vitals monitoring
  function monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        addMetric({
          name: 'lcp',
          value: lastEntry.startTime,
          unit: 'ms',
          category: 'paint',
          context: { element: lastEntry.element?.tagName },
        })
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          addMetric({
            name: 'fid',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            category: 'user-interaction',
            context: { eventType: entry.name },
          })
        })
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })

        addMetric({
          name: 'cls',
          value: clsValue,
          unit: 'count',
          category: 'paint',
        })
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  // Custom metrics monitoring
  function monitorCustomMetrics() {
    // Navigation timing
    if (performance.navigation) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (navTiming) {
        addMetric({
          name: 'dom_content_loaded',
          value: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
          unit: 'ms',
          category: 'navigation',
        })

        addMetric({
          name: 'load_complete',
          value: navTiming.loadEventEnd - navTiming.loadEventStart,
          unit: 'ms',
          category: 'navigation',
        })

        addMetric({
          name: 'interface_load_time',
          value: navTiming.loadEventEnd - navTiming.fetchStart,
          unit: 'ms',
          category: 'navigation',
        })
      }
    }
  }

  // Resource performance monitoring
  function monitorResourcePerformance() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[]
        entries.forEach((entry) => {
          addMetric({
            name: 'resource_load_time',
            value: entry.responseEnd - entry.requestStart,
            unit: 'ms',
            category: 'resource',
            context: {
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize,
            },
          })
        })
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
    }
  }

  // User interaction monitoring
  function monitorUserInteractions() {
    // Click response time
    document.addEventListener('click', (event) => {
      const startTime = performance.now()

      requestAnimationFrame(() => {
        const endTime = performance.now()
        const responseTime = endTime - startTime

        addMetric({
          name: 'click_response_time',
          value: responseTime,
          unit: 'ms',
          category: 'user-interaction',
          context: {
            element: (event.target as Element)?.tagName,
            className: (event.target as Element)?.className,
          },
        })
      })
    })

    // Keyboard response time
    document.addEventListener('keydown', (event) => {
      const startTime = performance.now()

      requestAnimationFrame(() => {
        const endTime = performance.now()
        const responseTime = endTime - startTime

        addMetric({
          name: 'keyboard_response_time',
          value: responseTime,
          unit: 'ms',
          category: 'user-interaction',
          context: {
            key: event.key,
            code: event.code,
          },
        })
      })
    })
  }

  // Add custom metric
  function addMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    metrics.value.unshift(fullMetric)

    // Keep only the most recent metrics
    if (metrics.value.length > maxMetrics) {
      metrics.value = metrics.value.slice(0, maxMetrics)
    }

    // Check for threshold violations
    checkThresholdViolations(fullMetric)
  }

  // Check threshold violations
  function checkThresholdViolations(metric: PerformanceMetric) {
    const threshold = PERFORMANCE_THRESHOLDS.find((t) => t.name === metric.name)
    if (threshold && metric.value > threshold.threshold) {
      // Log violation
      console.warn(`Performance threshold violated: ${metric.name}`, {
        value: metric.value,
        threshold: threshold.threshold,
        severity: threshold.severity,
      })

      // Report to external service
      reportThresholdViolation(metric, threshold)
    }
  }

  // Report threshold violation
  function reportThresholdViolation(metric: PerformanceMetric, threshold: PerformanceThreshold) {
    // In a real implementation, this would send to an external service
    console.log('Performance Threshold Violation:', {
      metric,
      threshold,
      sessionId: sessionId.value,
      timestamp: new Date(),
    })
  }

  // Custom performance measurements
  function measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    category: PerformanceMetric['category'] = 'custom',
  ): Promise<T> {
    const startTime = performance.now()

    return operation().then(
      (result) => {
        const endTime = performance.now()
        const duration = endTime - startTime

        addMetric({
          name,
          value: duration,
          unit: 'ms',
          category,
        })

        return result
      },
      (error) => {
        const endTime = performance.now()
        const duration = endTime - startTime

        addMetric({
          name: `${name}_error`,
          value: duration,
          unit: 'ms',
          category,
          context: { error: error.message },
        })

        throw error
      },
    )
  }

  function measureSync<T>(
    name: string,
    operation: () => T,
    category: PerformanceMetric['category'] = 'custom',
  ): T {
    const startTime = performance.now()

    try {
      const result = operation()
      const endTime = performance.now()
      const duration = endTime - startTime

      addMetric({
        name,
        value: duration,
        unit: 'ms',
        category,
      })

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      addMetric({
        name: `${name}_error`,
        value: duration,
        unit: 'ms',
        category,
        context: { error: (error as Error).message },
      })

      throw error
    }
  }

  // Specific success criteria measurements
  function measureMessageDelivery(messageId: string, startTime: number) {
    const endTime = performance.now()
    const duration = endTime - startTime

    addMetric({
      name: 'message_delivery_time',
      value: duration,
      unit: 'ms',
      category: 'custom',
      context: { messageId },
    })
  }

  function measureTypingIndicator(startTime: number) {
    const endTime = performance.now()
    const duration = endTime - startTime

    addMetric({
      name: 'typing_indicator_response',
      value: duration,
      unit: 'ms',
      category: 'user-interaction',
    })
  }

  function measurePresenceUpdate(startTime: number) {
    const endTime = performance.now()
    const duration = endTime - startTime

    addMetric({
      name: 'presence_update_time',
      value: duration,
      unit: 'ms',
      category: 'custom',
    })
  }

  function measureFirstMessageSend(startTime: number) {
    const endTime = performance.now()
    const duration = endTime - startTime

    addMetric({
      name: 'first_message_send_time',
      value: duration,
      unit: 'ms',
      category: 'custom',
    })
  }

  function measureSearchResponse(query: string, startTime: number) {
    const endTime = performance.now()
    const duration = endTime - startTime

    addMetric({
      name: 'search_response_time',
      value: duration,
      unit: 'ms',
      category: 'custom',
      context: { query: query.substring(0, 50) },
    })
  }

  function measureEventCreation(startTime: number) {
    const endTime = performance.now()
    const duration = endTime - startTime

    addMetric({
      name: 'event_creation_time',
      value: duration,
      unit: 'ms',
      category: 'custom',
    })
  }

  // Performance analytics
  function getPerformanceAnalytics() {
    const total = metrics.value.length
    const byCategory = metricsByCategory.value
    const violations = thresholdViolations.value.length
    const score = performanceScore.value

    // Calculate averages by category
    const averages: Record<string, number> = {}
    Object.keys(byCategory).forEach((category) => {
      const categoryMetrics = byCategory[category]
      const sum = categoryMetrics.reduce((acc, metric) => acc + metric.value, 0)
      averages[category] = sum / categoryMetrics.length
    })

    return {
      total,
      violations,
      score,
      averages,
      byCategory: Object.keys(byCategory).reduce(
        (acc, key) => {
          acc[key] = byCategory[key].length
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  }

  // Generate performance report
  function generatePerformanceReport(): PerformanceReport {
    return {
      sessionId: sessionId.value,
      timestamp: new Date(),
      metrics: metrics.value,
      thresholds: PERFORMANCE_THRESHOLDS,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
  }

  // Clear metrics
  function clearMetrics() {
    metrics.value = []
  }

  // Clear metrics by category
  function clearMetricsByCategory(category: PerformanceMetric['category']) {
    metrics.value = metrics.value.filter((m) => m.category !== category)
  }

  // Lifecycle
  onMounted(() => {
    initializeMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    metrics,
    isMonitoring,
    hasMetrics,
    recentMetrics,
    metricsByCategory,
    thresholdViolations,
    performanceScore,

    // Methods
    initializeMonitoring,
    stopMonitoring,
    addMetric,
    measureAsync,
    measureSync,
    measureMessageDelivery,
    measureTypingIndicator,
    measurePresenceUpdate,
    measureFirstMessageSend,
    measureSearchResponse,
    measureEventCreation,
    getPerformanceAnalytics,
    generatePerformanceReport,
    clearMetrics,
    clearMetricsByCategory,
  }
}
