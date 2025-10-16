import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLogging } from './useLogging'
import { useUptimeMonitoring } from './useUptimeMonitoring'

// Health check types
export interface HealthCheckResult {
  id: string
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  timestamp: Date
  responseTime: number
  message?: string
  details?: Record<string, any>
  dependencies?: string[]
}

export interface HealthCheckConfig {
  name: string
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  interval?: number
  retries?: number
  dependencies?: string[]
  critical?: boolean
}

export interface HealthDashboard {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  totalChecks: number
  healthyChecks: number
  degradedChecks: number
  unhealthyChecks: number
  unknownChecks: number
  averageResponseTime: number
  uptime: number
  lastCheck: Date
  checks: HealthCheckResult[]
}

// Health check state
const healthChecks = ref<Map<string, HealthCheckResult>>(new Map())
const isMonitoring = ref(false)
const checkIntervals = ref<Map<string, NodeJS.Timeout>>(new Map())

// Default health check configurations
const DEFAULT_HEALTH_CHECKS: Record<string, HealthCheckConfig> = {
  'api-health': {
    name: 'API Health',
    url: '/api/health',
    method: 'GET',
    timeout: 5000,
    interval: 30000, // 30 seconds
    retries: 3,
    critical: true,
  },
  'database-health': {
    name: 'Database Health',
    url: '/api/health/database',
    method: 'GET',
    timeout: 10000,
    interval: 60000, // 1 minute
    retries: 2,
    critical: true,
  },
  'websocket-health': {
    name: 'WebSocket Health',
    url: '/api/health/websocket',
    method: 'GET',
    timeout: 5000,
    interval: 30000,
    retries: 2,
    critical: true,
  },
  'storage-health': {
    name: 'Storage Health',
    url: '/api/health/storage',
    method: 'GET',
    timeout: 5000,
    interval: 60000,
    retries: 2,
    critical: false,
  },
  'external-api-health': {
    name: 'External API Health',
    url: '/api/health/external',
    method: 'GET',
    timeout: 15000,
    interval: 120000, // 2 minutes
    retries: 1,
    critical: false,
  },
}

export function useHealthCheck() {
  const { logSystemEvent, logPerformanceMetric } = useLogging()
  const { uptimeStatus } = useUptimeMonitoring()

  // Computed properties
  const overallStatus = computed(() => {
    const checks = Array.from(healthChecks.value.values())
    if (checks.length === 0) return 'unknown'

    const criticalChecks = checks.filter((check) => DEFAULT_HEALTH_CHECKS[check.id]?.critical)

    if (criticalChecks.some((check) => check.status === 'unhealthy')) {
      return 'unhealthy'
    }

    if (
      criticalChecks.some((check) => check.status === 'degraded') ||
      checks.some((check) => check.status === 'unhealthy')
    ) {
      return 'degraded'
    }

    if (checks.some((check) => check.status === 'unknown')) {
      return 'unknown'
    }

    return 'healthy'
  })

  const healthDashboard = computed((): HealthDashboard => {
    const checks = Array.from(healthChecks.value.values())
    const totalChecks = checks.length
    const healthyChecks = checks.filter((c) => c.status === 'healthy').length
    const degradedChecks = checks.filter((c) => c.status === 'degraded').length
    const unhealthyChecks = checks.filter((c) => c.status === 'unhealthy').length
    const unknownChecks = checks.filter((c) => c.status === 'unknown').length

    const averageResponseTime =
      checks.length > 0
        ? checks.reduce((sum, check) => sum + check.responseTime, 0) / checks.length
        : 0

    const lastCheck =
      checks.length > 0
        ? new Date(Math.max(...checks.map((c) => c.timestamp.getTime())))
        : new Date()

    return {
      overallStatus: overallStatus.value,
      totalChecks,
      healthyChecks,
      degradedChecks,
      unhealthyChecks,
      unknownChecks,
      averageResponseTime,
      uptime: uptimeStatus.value.uptimePercentage,
      lastCheck,
      checks,
    }
  })

  // Initialize health monitoring
  function initializeHealthMonitoring() {
    if (isMonitoring.value) return

    isMonitoring.value = true
    logSystemEvent('Health monitoring initialized')

    // Start all configured health checks
    Object.entries(DEFAULT_HEALTH_CHECKS).forEach(([id, config]) => {
      startHealthCheck(id, config)
    })
  }

  function stopHealthMonitoring() {
    isMonitoring.value = false

    // Clear all intervals
    checkIntervals.value.forEach((interval) => {
      clearInterval(interval)
    })
    checkIntervals.value.clear()

    logSystemEvent('Health monitoring stopped')
  }

  // Start individual health check
  function startHealthCheck(id: string, config: HealthCheckConfig) {
    if (checkIntervals.value.has(id)) {
      clearInterval(checkIntervals.value.get(id)!)
    }

    const interval = setInterval(async () => {
      await performHealthCheck(id, config)
    }, config.interval || 30000)

    checkIntervals.value.set(id, interval)

    // Perform initial check
    performHealthCheck(id, config)
  }

  // Stop individual health check
  function stopHealthCheck(id: string) {
    const interval = checkIntervals.value.get(id)
    if (interval) {
      clearInterval(interval)
      checkIntervals.value.delete(id)
    }
  }

  // Perform health check
  async function performHealthCheck(id: string, config: HealthCheckConfig) {
    const startTime = performance.now()
    let status: HealthCheckResult['status'] = 'unknown'
    let message: string | undefined
    let details: Record<string, any> = {}
    let responseTime = 0

    try {
      if (config.url) {
        // HTTP health check
        const result = await performHttpHealthCheck(config)
        status = result.status
        message = result.message
        details = result.details
      } else {
        // Custom health check
        const result = await performCustomHealthCheck(id, config)
        status = result.status
        message = result.message
        details = result.details
      }
    } catch (error) {
      status = 'unhealthy'
      message = error instanceof Error ? error.message : 'Unknown error'
      details = { error: error instanceof Error ? error.stack : String(error) }
    } finally {
      responseTime = performance.now() - startTime
    }

    // Create health check result
    const result: HealthCheckResult = {
      id,
      name: config.name,
      status,
      timestamp: new Date(),
      responseTime,
      message,
      details,
      dependencies: config.dependencies,
    }

    // Store result
    healthChecks.value.set(id, result)

    // Log performance metric
    logPerformanceMetric(`health_check_${id}`, responseTime, 'ms', {
      status,
      message,
    })

    // Log system event for status changes
    const previousResult = healthChecks.value.get(id)
    if (!previousResult || previousResult.status !== status) {
      logSystemEvent(`Health check status changed: ${id}`, {
        checkId: id,
        previousStatus: previousResult?.status,
        newStatus: status,
        responseTime,
        message,
      })
    }
  }

  // Perform HTTP health check
  async function performHttpHealthCheck(config: HealthCheckConfig) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 5000)

    try {
      const response = await fetch(config.url!, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        return {
          status: 'healthy' as const,
          message: 'Health check passed',
          details: data,
        }
      } else {
        return {
          status: 'degraded' as const,
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: { status: response.status, statusText: response.statusText },
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'unhealthy' as const,
          message: 'Health check timeout',
          details: { timeout: config.timeout },
        }
      }

      throw error
    }
  }

  // Perform custom health check
  async function performCustomHealthCheck(id: string, config: HealthCheckConfig) {
    switch (id) {
      case 'browser-health':
        return checkBrowserHealth()
      case 'local-storage-health':
        return checkLocalStorageHealth()
      case 'websocket-health':
        return checkWebSocketHealth()
      case 'performance-health':
        return checkPerformanceHealth()
      default:
        return {
          status: 'unknown' as const,
          message: 'Unknown health check type',
          details: {},
        }
    }
  }

  // Browser health check
  function checkBrowserHealth() {
    const features = {
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof Storage !== 'undefined',
      websocket: typeof WebSocket !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      performance: typeof performance !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
    }

    const supportedFeatures = Object.values(features).filter(Boolean).length
    const totalFeatures = Object.keys(features).length
    const supportPercentage = (supportedFeatures / totalFeatures) * 100

    if (supportPercentage >= 90) {
      return {
        status: 'healthy' as const,
        message: 'Browser fully supported',
        details: { features, supportPercentage },
      }
    } else if (supportPercentage >= 70) {
      return {
        status: 'degraded' as const,
        message: 'Browser partially supported',
        details: { features, supportPercentage },
      }
    } else {
      return {
        status: 'unhealthy' as const,
        message: 'Browser not supported',
        details: { features, supportPercentage },
      }
    }
  }

  // Local storage health check
  function checkLocalStorageHealth() {
    try {
      const testKey = 'health_check_test'
      const testValue = 'test'

      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)

      if (retrieved === testValue) {
        return {
          status: 'healthy' as const,
          message: 'Local storage working',
          details: { available: true },
        }
      } else {
        return {
          status: 'unhealthy' as const,
          message: 'Local storage not working',
          details: { available: false },
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        message: 'Local storage error',
        details: { error: error instanceof Error ? error.message : String(error) },
      }
    }
  }

  // WebSocket health check
  function checkWebSocketHealth() {
    return new Promise<{
      status: HealthCheckResult['status']
      message: string
      details: Record<string, any>
    }>((resolve) => {
      const ws = new WebSocket('ws://localhost:8080/ws') // Replace with actual WebSocket URL

      const timeout = setTimeout(() => {
        ws.close()
        resolve({
          status: 'unhealthy',
          message: 'WebSocket connection timeout',
          details: { timeout: true },
        })
      }, 5000)

      ws.onopen = () => {
        clearTimeout(timeout)
        ws.close()
        resolve({
          status: 'healthy',
          message: 'WebSocket connection successful',
          details: { connected: true },
        })
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        resolve({
          status: 'unhealthy',
          message: 'WebSocket connection failed',
          details: { connected: false },
        })
      }
    })
  }

  // Performance health check
  function checkPerformanceHealth() {
    const memory = (performance as any).memory
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    const metrics = {
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      memoryLimit: memory ? memory.jsHeapSizeLimit : 0,
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      domContentLoaded: navigation
        ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        : 0,
    }

    const memoryUsagePercentage = memory
      ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      : 0
    const loadTime = metrics.loadTime

    if (memoryUsagePercentage < 50 && loadTime < 3000) {
      return {
        status: 'healthy' as const,
        message: 'Performance is good',
        details: metrics,
      }
    } else if (memoryUsagePercentage < 80 && loadTime < 5000) {
      return {
        status: 'degraded' as const,
        message: 'Performance is acceptable',
        details: metrics,
      }
    } else {
      return {
        status: 'unhealthy' as const,
        message: 'Performance is poor',
        details: metrics,
      }
    }
  }

  // Get health check result
  function getHealthCheckResult(id: string): HealthCheckResult | undefined {
    return healthChecks.value.get(id)
  }

  // Get all health check results
  function getAllHealthCheckResults(): HealthCheckResult[] {
    return Array.from(healthChecks.value.values())
  }

  // Get health check by status
  function getHealthChecksByStatus(status: HealthCheckResult['status']): HealthCheckResult[] {
    return Array.from(healthChecks.value.values()).filter((check) => check.status === status)
  }

  // Get critical health checks
  function getCriticalHealthChecks(): HealthCheckResult[] {
    return Array.from(healthChecks.value.values()).filter(
      (check) => DEFAULT_HEALTH_CHECKS[check.id]?.critical,
    )
  }

  // Check if system is healthy
  function isSystemHealthy(): boolean {
    return overallStatus.value === 'healthy'
  }

  // Check if system is degraded
  function isSystemDegraded(): boolean {
    return overallStatus.value === 'degraded'
  }

  // Check if system is unhealthy
  function isSystemUnhealthy(): boolean {
    return overallStatus.value === 'unhealthy'
  }

  // Get health summary
  function getHealthSummary() {
    const dashboard = healthDashboard.value
    const criticalChecks = getCriticalHealthChecks()
    const unhealthyCritical = criticalChecks.filter((check) => check.status === 'unhealthy')

    return {
      status: dashboard.overallStatus,
      message:
        unhealthyCritical.length > 0
          ? `${unhealthyCritical.length} critical service(s) unhealthy`
          : dashboard.overallStatus === 'healthy'
            ? 'All systems operational'
            : 'Some services experiencing issues',
      criticalIssues: unhealthyCritical.map((check) => ({
        name: check.name,
        message: check.message,
        lastCheck: check.timestamp,
      })),
      uptime: dashboard.uptime,
      averageResponseTime: dashboard.averageResponseTime,
    }
  }

  // Export health data
  function exportHealthData(format: 'json' | 'csv' = 'json'): string {
    const data = healthDashboard.value

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    } else {
      // CSV format
      const headers = ['id', 'name', 'status', 'timestamp', 'responseTime', 'message']
      const csvRows = [headers.join(',')]

      data.checks.forEach((check) => {
        const row = [
          check.id,
          check.name,
          check.status,
          check.timestamp.toISOString(),
          check.responseTime,
          check.message || '',
        ]
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    }
  }

  // Clear health check data
  function clearHealthCheckData() {
    healthChecks.value.clear()
    logSystemEvent('Health check data cleared')
  }

  // Lifecycle
  onMounted(() => {
    initializeHealthMonitoring()
  })

  onUnmounted(() => {
    stopHealthMonitoring()
  })

  return {
    // State
    healthChecks,
    isMonitoring,
    overallStatus,
    healthDashboard,

    // Methods
    initializeHealthMonitoring,
    stopHealthMonitoring,
    startHealthCheck,
    stopHealthCheck,
    performHealthCheck,
    getHealthCheckResult,
    getAllHealthCheckResults,
    getHealthChecksByStatus,
    getCriticalHealthChecks,
    isSystemHealthy,
    isSystemDegraded,
    isSystemUnhealthy,
    getHealthSummary,
    exportHealthData,
    clearHealthCheckData,
  }
}
