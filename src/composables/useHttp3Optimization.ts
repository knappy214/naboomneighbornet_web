/**
 * HTTP3 Optimization Composable
 * Provides HTTP3 QUIC protocol optimization for API calls and real-time features
 * Optimized for South African network conditions
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { ApiError } from '@/types/communication'

interface Http3Config {
  enabled: boolean
  fallbackToHttp2: boolean
  connectionPooling: boolean
  multiplexing: boolean
  serverPush: boolean
  adaptiveBitrate: boolean
  compression: boolean
  debug?: boolean
}

interface ConnectionMetrics {
  protocol: 'http/1.1' | 'http/2' | 'http/3' | 'unknown'
  latency: number
  bandwidth: number
  packetLoss: number
  jitter: number
  lastTested: Date
}

interface OptimizationSettings {
  maxConcurrentRequests: number
  requestTimeout: number
  retryAttempts: number
  retryDelay: number
  compressionLevel: number
  chunkSize: number
}

export function useHttp3Optimization(config: Partial<Http3Config> = {}) {
  // ============================================================================
  // Configuration
  // ============================================================================

  const defaultConfig: Required<Http3Config> = {
    enabled: true,
    fallbackToHttp2: true,
    connectionPooling: true,
    multiplexing: true,
    serverPush: true,
    adaptiveBitrate: true,
    compression: true,
    debug: false,
  }

  const http3Config = { ...defaultConfig, ...config }

  // ============================================================================
  // State
  // ============================================================================

  const isSupported = ref(false)
  const isInitialized = ref(false)
  const currentProtocol = ref<'http/1.1' | 'http/2' | 'http/3' | 'unknown'>('unknown')

  const connectionMetrics = reactive<ConnectionMetrics>({
    protocol: 'unknown',
    latency: 0,
    bandwidth: 0,
    packetLoss: 0,
    jitter: 0,
    lastTested: new Date(),
  })

  const optimizationSettings = reactive<OptimizationSettings>({
    maxConcurrentRequests: 6,
    requestTimeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    compressionLevel: 6,
    chunkSize: 8192,
  })

  const performanceStats = reactive({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    totalBytesTransferred: 0,
    compressionRatio: 0,
  })

  // ============================================================================
  // HTTP3 Support Detection
  // ============================================================================

  /**
   * Check if HTTP3 is supported
   */
  async function checkHttp3Support(): Promise<boolean> {
    try {
      // Check for HTTP3 support in the browser
      if ('serviceWorker' in navigator) {
        // Test HTTP3 connection
        const testUrl = `${window.location.origin}/api/health`
        const response = await fetch(testUrl, {
          method: 'HEAD',
          cache: 'no-cache',
        })

        // Check if the response indicates HTTP3
        const protocol = response.headers.get('alt-svc')
        if (protocol && protocol.includes('h3')) {
          currentProtocol.value = 'http/3'
          return true
        }
      }

      // Fallback to HTTP2 detection
      if (window.fetch) {
        const response = await fetch('/api/health', { method: 'HEAD' })
        if (response.headers.get('server')?.includes('h2')) {
          currentProtocol.value = 'http/2'
          return false
        }
      }

      currentProtocol.value = 'http/1.1'
      return false
    } catch (error) {
      log('HTTP3 support check failed:', error)
      currentProtocol.value = 'unknown'
      return false
    }
  }

  // ============================================================================
  // Connection Testing
  // ============================================================================

  /**
   * Test connection performance
   */
  async function testConnectionPerformance(): Promise<void> {
    const startTime = performance.now()

    try {
      // Test latency
      const latencyStart = performance.now()
      await fetch('/api/health', { method: 'HEAD' })
      const latency = performance.now() - latencyStart

      // Test bandwidth (simplified)
      const bandwidthStart = performance.now()
      const response = await fetch('/api/test-data', { method: 'GET' })
      const data = await response.arrayBuffer()
      const bandwidth = (data.byteLength * 8) / (performance.now() - bandwidthStart) / 1000 // kbps

      // Update metrics
      connectionMetrics.protocol = currentProtocol.value
      connectionMetrics.latency = latency
      connectionMetrics.bandwidth = bandwidth
      connectionMetrics.packetLoss = 0 // Would need more sophisticated testing
      connectionMetrics.jitter = 0 // Would need more sophisticated testing
      connectionMetrics.lastTested = new Date()

      log('Connection test completed:', {
        protocol: currentProtocol.value,
        latency: `${latency.toFixed(2)}ms`,
        bandwidth: `${bandwidth.toFixed(2)}kbps`,
      })
    } catch (error) {
      log('Connection test failed:', error)
    }
  }

  // ============================================================================
  // Request Optimization
  // ============================================================================

  /**
   * Optimize fetch request for HTTP3
   */
  function optimizeRequest(url: string, options: RequestInit = {}): RequestInit {
    const optimizedOptions: RequestInit = {
      ...options,
      cache: 'no-cache',
      headers: {
        ...options.headers,
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
      },
    }

    // Add HTTP3 specific headers
    if (http3Config.enabled && currentProtocol.value === 'http/3') {
      optimizedOptions.headers = {
        ...optimizedOptions.headers,
        'Alt-Svc': 'h3=":443"',
        'HTTP3-Settings': 'max_field_section_size=16384',
      }
    }

    // Add compression headers
    if (http3Config.compression) {
      optimizedOptions.headers = {
        ...optimizedOptions.headers,
        'Accept-Encoding': 'gzip, deflate, br, zstd',
      }
    }

    return optimizedOptions
  }

  /**
   * Optimize request body for compression
   */
  function optimizeRequestBody(body: any): any {
    if (!http3Config.compression || !body) {
      return body
    }

    // If body is a string, we can compress it
    if (typeof body === 'string' && body.length > 1024) {
      // In a real implementation, you would use a compression library
      // For now, we'll just return the original body
      return body
    }

    return body
  }

  // ============================================================================
  // Adaptive Optimization
  // ============================================================================

  /**
   * Adapt settings based on connection quality
   */
  function adaptToConnectionQuality(): void {
    if (!http3Config.adaptiveBitrate) return

    const { latency, bandwidth } = connectionMetrics

    // Adjust timeout based on latency
    if (latency > 1000) {
      optimizationSettings.requestTimeout = 60000 // 60 seconds for high latency
    } else if (latency > 500) {
      optimizationSettings.requestTimeout = 30000 // 30 seconds for medium latency
    } else {
      optimizationSettings.requestTimeout = 15000 // 15 seconds for low latency
    }

    // Adjust concurrent requests based on bandwidth
    if (bandwidth > 10000) {
      // > 10 Mbps
      optimizationSettings.maxConcurrentRequests = 10
    } else if (bandwidth > 5000) {
      // > 5 Mbps
      optimizationSettings.maxConcurrentRequests = 6
    } else if (bandwidth > 1000) {
      // > 1 Mbps
      optimizationSettings.maxConcurrentRequests = 3
    } else {
      optimizationSettings.maxConcurrentRequests = 1
    }

    // Adjust chunk size based on connection quality
    if (latency < 100 && bandwidth > 5000) {
      optimizationSettings.chunkSize = 16384 // 16KB for good connections
    } else if (latency < 500 && bandwidth > 1000) {
      optimizationSettings.chunkSize = 8192 // 8KB for medium connections
    } else {
      optimizationSettings.chunkSize = 4096 // 4KB for poor connections
    }

    log('Settings adapted to connection quality:', {
      latency: `${latency}ms`,
      bandwidth: `${bandwidth}kbps`,
      maxConcurrentRequests: optimizationSettings.maxConcurrentRequests,
      requestTimeout: optimizationSettings.requestTimeout,
      chunkSize: optimizationSettings.chunkSize,
    })
  }

  // ============================================================================
  // Request Monitoring
  // ============================================================================

  /**
   * Monitor request performance
   */
  function monitorRequest(
    url: string,
    startTime: number,
    endTime: number,
    success: boolean,
    bytesTransferred: number,
  ): void {
    const duration = endTime - startTime

    performanceStats.totalRequests++
    if (success) {
      performanceStats.successfulRequests++
    } else {
      performanceStats.failedRequests++
    }

    // Update average latency
    const totalRequests = performanceStats.totalRequests
    performanceStats.averageLatency =
      (performanceStats.averageLatency * (totalRequests - 1) + duration) / totalRequests

    performanceStats.totalBytesTransferred += bytesTransferred

    log('Request monitored:', {
      url,
      duration: `${duration.toFixed(2)}ms`,
      success,
      bytesTransferred,
    })
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Handle HTTP3 specific errors
   */
  function handleHttp3Error(error: any, context: string): ApiError {
    let errorCode = 'HTTP3_ERROR'
    let errorMessage = 'HTTP3 request failed'

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorCode = 'NETWORK_ERROR'
      errorMessage = 'Network connection failed'
    } else if (error.name === 'AbortError') {
      errorCode = 'TIMEOUT_ERROR'
      errorMessage = 'Request timeout'
    } else if (error.status) {
      errorCode = `HTTP_${error.status}`
      errorMessage = `HTTP ${error.status} error`
    }

    return {
      code: errorCode,
      message: errorMessage,
      details: {
        originalError: error,
        context,
        protocol: currentProtocol.value,
        timestamp: new Date(),
      },
    }
  }

  // ============================================================================
  // Performance Optimization
  // ============================================================================

  /**
   * Optimize for South African network conditions
   */
  function optimizeForSouthAfrica(): void {
    // South Africa typically has higher latency and variable bandwidth
    optimizationSettings.requestTimeout = 45000 // 45 seconds
    optimizationSettings.retryAttempts = 5
    optimizationSettings.retryDelay = 2000 // 2 seconds
    optimizationSettings.maxConcurrentRequests = 4
    optimizationSettings.chunkSize = 4096 // 4KB chunks
    optimizationSettings.compressionLevel = 9 // Maximum compression

    log('Optimized for South African network conditions')
  }

  /**
   * Get optimal settings for current connection
   */
  function getOptimalSettings(): OptimizationSettings {
    return { ...optimizationSettings }
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const isHttp3Active = computed(() => http3Config.enabled && currentProtocol.value === 'http/3')

  const connectionQuality = computed(() => {
    const { latency, bandwidth } = connectionMetrics

    if (latency < 100 && bandwidth > 5000) return 'excellent'
    if (latency < 300 && bandwidth > 2000) return 'good'
    if (latency < 1000 && bandwidth > 500) return 'fair'
    return 'poor'
  })

  const successRate = computed(() => {
    if (performanceStats.totalRequests === 0) return 0
    return (performanceStats.successfulRequests / performanceStats.totalRequests) * 100
  })

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Initialize HTTP3 optimization
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    try {
      // Check HTTP3 support
      isSupported.value = await checkHttp3Support()

      // Test connection performance
      await testConnectionPerformance()

      // Adapt to connection quality
      adaptToConnectionQuality()

      // Optimize for South African conditions
      optimizeForSouthAfrica()

      isInitialized.value = true

      log('HTTP3 optimization initialized', {
        supported: isSupported.value,
        protocol: currentProtocol.value,
        quality: connectionQuality.value,
      })
    } catch (error) {
      log('HTTP3 optimization initialization failed:', error)
      throw error
    }
  }

  /**
   * Cleanup HTTP3 optimization
   */
  function cleanup(): void {
    isInitialized.value = false
    isSupported.value = false
    currentProtocol.value = 'unknown'

    // Reset metrics
    Object.assign(connectionMetrics, {
      protocol: 'unknown',
      latency: 0,
      bandwidth: 0,
      packetLoss: 0,
      jitter: 0,
      lastTested: new Date(),
    })

    // Reset performance stats
    Object.assign(performanceStats, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      totalBytesTransferred: 0,
      compressionRatio: 0,
    })

    log('HTTP3 optimization cleaned up')
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  function log(...args: any[]): void {
    if (http3Config.debug) {
      console.log('[Http3Optimization]', ...args)
    }
  }

  // ============================================================================
  // Composable API
  // ============================================================================

  return {
    // State
    isSupported: computed(() => isSupported.value),
    isInitialized: computed(() => isInitialized.value),
    currentProtocol: computed(() => currentProtocol.value),
    connectionMetrics: computed(() => connectionMetrics),
    optimizationSettings: computed(() => optimizationSettings),
    performanceStats: computed(() => performanceStats),

    // Computed
    isHttp3Active,
    connectionQuality,
    successRate,

    // Functions
    checkHttp3Support,
    testConnectionPerformance,
    optimizeRequest,
    optimizeRequestBody,
    adaptToConnectionQuality,
    monitorRequest,
    handleHttp3Error,
    optimizeForSouthAfrica,
    getOptimalSettings,

    // Lifecycle
    initialize,
    cleanup,
  }
}
