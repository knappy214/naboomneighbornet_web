import { ref, computed, onMounted, onUnmounted } from 'vue'

// Uptime monitoring types
export interface UptimeStatus {
  isOnline: boolean
  lastOnline: Date | null
  lastOffline: Date | null
  totalUptime: number
  totalDowntime: number
  uptimePercentage: number
  consecutiveOfflineTime: number
  consecutiveOnlineTime: number
}

export interface UptimeEvent {
  id: string
  type: 'online' | 'offline'
  timestamp: Date
  duration?: number
  reason?: string
}

export interface UptimeReport {
  sessionId: string
  startTime: Date
  endTime: Date
  totalUptime: number
  totalDowntime: number
  uptimePercentage: number
  events: UptimeEvent[]
  averageUptime: number
  longestDowntime: number
  longestUptime: number
}

// Uptime monitoring state
const isOnline = ref(navigator.onLine)
const startTime = ref(new Date())
const lastOnline = ref<Date | null>(navigator.onLine ? new Date() : null)
const lastOffline = ref<Date | null>(navigator.onLine ? null : new Date())
const events = ref<UptimeEvent[]>([])
const totalUptime = ref(0)
const totalDowntime = ref(0)
const consecutiveOfflineTime = ref(0)
const consecutiveOnlineTime = ref(0)
const sessionId = ref('')

export function useUptimeMonitoring() {
  // Computed properties
  const uptimeStatus = computed((): UptimeStatus => {
    const now = new Date()
    const sessionDuration = now.getTime() - startTime.value.getTime()
    const uptimePercentage = sessionDuration > 0 ? (totalUptime.value / sessionDuration) * 100 : 100

    return {
      isOnline: isOnline.value,
      lastOnline: lastOnline.value,
      lastOffline: lastOffline.value,
      totalUptime: totalUptime.value,
      totalDowntime: totalDowntime.value,
      uptimePercentage,
      consecutiveOfflineTime: consecutiveOfflineTime.value,
      consecutiveOnlineTime: consecutiveOnlineTime.value,
    }
  })

  const recentEvents = computed(() =>
    events.value.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
  )

  const onlineEvents = computed(() => events.value.filter((event) => event.type === 'online'))

  const offlineEvents = computed(() => events.value.filter((event) => event.type === 'offline'))

  const currentStreak = computed(() => {
    if (events.value.length === 0) return 0

    const lastEvent = events.value[events.value.length - 1]
    const now = new Date()
    return now.getTime() - lastEvent.timestamp.getTime()
  })

  // Initialize monitoring
  function initializeMonitoring() {
    sessionId.value = getSessionId()

    // Set up event listeners
    setupEventListeners()

    // Start periodic checks
    startPeriodicChecks()

    // Record initial state
    recordInitialState()
  }

  function getSessionId(): string {
    let id = sessionStorage.getItem('uptime_session_id')
    if (!id) {
      id = `uptime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('uptime_session_id', id)
    }
    return id
  }

  // Event listeners setup
  function setupEventListeners() {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Monitor beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  function handleOnline() {
    const now = new Date()
    const wasOffline = !isOnline.value

    isOnline.value = true
    lastOnline.value = now

    if (wasOffline) {
      // Calculate downtime
      const downtime = lastOffline.value ? now.getTime() - lastOffline.value.getTime() : 0
      totalDowntime.value += downtime
      consecutiveOfflineTime.value = 0
      consecutiveOnlineTime.value = 0

      // Record online event
      recordEvent('online', now, downtime)
    }
  }

  function handleOffline() {
    const now = new Date()
    const wasOnline = isOnline.value

    isOnline.value = false
    lastOffline.value = now

    if (wasOnline) {
      // Calculate uptime
      const uptime = lastOnline.value ? now.getTime() - lastOnline.value.getTime() : 0
      totalUptime.value += uptime
      consecutiveOnlineTime.value = 0
      consecutiveOfflineTime.value = 0

      // Record offline event
      recordEvent('offline', now, uptime)
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, but we're still technically online
      // This could indicate the user switched tabs or minimized the window
      recordEvent('offline', new Date(), 0, 'page_hidden')
    } else {
      // Page is visible again
      recordEvent('online', new Date(), 0, 'page_visible')
    }
  }

  function handleBeforeUnload() {
    // Record final uptime before page unload
    const now = new Date()
    if (isOnline.value && lastOnline.value) {
      const uptime = now.getTime() - lastOnline.value.getTime()
      totalUptime.value += uptime
      recordEvent('offline', now, uptime, 'page_unload')
    }
  }

  // Event recording
  function recordEvent(
    type: 'online' | 'offline',
    timestamp: Date,
    duration?: number,
    reason?: string,
  ) {
    const event: UptimeEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp,
      duration,
      reason,
    }

    events.value.push(event)

    // Keep only the most recent events (last 1000)
    if (events.value.length > 1000) {
      events.value = events.value.slice(-1000)
    }

    // Update consecutive times
    if (type === 'online') {
      consecutiveOnlineTime.value = duration || 0
      consecutiveOfflineTime.value = 0
    } else {
      consecutiveOfflineTime.value = duration || 0
      consecutiveOnlineTime.value = 0
    }
  }

  function recordInitialState() {
    const now = new Date()
    if (isOnline.value) {
      recordEvent('online', now, 0, 'initial_state')
    } else {
      recordEvent('offline', now, 0, 'initial_state')
    }
  }

  // Periodic checks
  let checkInterval: NodeJS.Timeout | null = null

  function startPeriodicChecks() {
    checkInterval = setInterval(() => {
      performUptimeCheck()
    }, 5000) // Check every 5 seconds
  }

  function stopPeriodicChecks() {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  async function performUptimeCheck() {
    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (response.ok && !isOnline.value) {
        // We're actually online but our state was offline
        handleOnline()
      }
    } catch (error) {
      if (isOnline.value) {
        // We're actually offline but our state was online
        handleOffline()
      }
    }
  }

  // Uptime calculations
  function calculateUptimePercentage(startTime: Date, endTime: Date): number {
    const totalTime = endTime.getTime() - startTime.getTime()
    if (totalTime <= 0) return 100

    const uptime = events.value
      .filter((event) => event.type === 'online' && event.duration)
      .reduce((sum, event) => sum + (event.duration || 0), 0)

    return (uptime / totalTime) * 100
  }

  function getLongestUptime(): number {
    return events.value
      .filter((event) => event.type === 'online' && event.duration)
      .reduce((max, event) => Math.max(max, event.duration || 0), 0)
  }

  function getLongestDowntime(): number {
    return events.value
      .filter((event) => event.type === 'offline' && event.duration)
      .reduce((max, event) => Math.max(max, event.duration || 0), 0)
  }

  // Generate uptime report
  function generateUptimeReport(): UptimeReport {
    const now = new Date()
    const uptimePercentage = calculateUptimePercentage(startTime.value, now)
    const longestUptime = getLongestUptime()
    const longestDowntime = getLongestDowntime()

    return {
      sessionId: sessionId.value,
      startTime: startTime.value,
      endTime: now,
      totalUptime: totalUptime.value,
      totalDowntime: totalDowntime.value,
      uptimePercentage,
      events: events.value,
      averageUptime: events.value.length > 0 ? totalUptime.value / events.value.length : 0,
      longestDowntime,
      longestUptime,
    }
  }

  // Uptime analytics
  function getUptimeAnalytics() {
    const totalEvents = events.value.length
    const onlineCount = onlineEvents.value.length
    const offlineCount = offlineEvents.value.length
    const currentStatus = uptimeStatus.value

    // Calculate uptime trends
    const recentEvents = events.value.slice(-10)
    const recentUptime = recentEvents
      .filter((event) => event.type === 'online' && event.duration)
      .reduce((sum, event) => sum + (event.duration || 0), 0)
    const recentTotal = recentEvents.reduce((sum, event) => sum + (event.duration || 0), 0)
    const recentUptimePercentage = recentTotal > 0 ? (recentUptime / recentTotal) * 100 : 100

    return {
      totalEvents,
      onlineCount,
      offlineCount,
      currentStatus,
      recentUptimePercentage,
      longestUptime: getLongestUptime(),
      longestDowntime: getLongestDowntime(),
      currentStreak: currentStreak.value,
    }
  }

  // Check if uptime meets success criteria
  function checkUptimeSuccessCriteria(): {
    meetsCriteria: boolean
    currentUptime: number
    requiredUptime: number
    message: string
  } {
    const currentUptime = uptimeStatus.value.uptimePercentage
    const requiredUptime = 99.5 // SC-008: 99.5% uptime requirement

    const meetsCriteria = currentUptime >= requiredUptime

    return {
      meetsCriteria,
      currentUptime,
      requiredUptime,
      message: meetsCriteria
        ? `Uptime meets requirements (${currentUptime.toFixed(2)}% >= ${requiredUptime}%)`
        : `Uptime below requirements (${currentUptime.toFixed(2)}% < ${requiredUptime}%)`,
    }
  }

  // Export uptime data
  function exportUptimeData(format: 'json' | 'csv' = 'json'): string {
    const report = generateUptimeReport()

    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    } else {
      // CSV format
      const headers = ['timestamp', 'type', 'duration', 'reason']
      const csvRows = [headers.join(',')]

      events.value.forEach((event) => {
        const row = [
          event.timestamp.toISOString(),
          event.type,
          event.duration || 0,
          event.reason || '',
        ]
        csvRows.push(row.join(','))
      })

      return csvRows.join('\n')
    }
  }

  // Clear uptime data
  function clearUptimeData() {
    events.value = []
    totalUptime.value = 0
    totalDowntime.value = 0
    consecutiveOfflineTime.value = 0
    consecutiveOnlineTime.value = 0
    startTime.value = new Date()
  }

  // Lifecycle
  onMounted(() => {
    initializeMonitoring()
  })

  onUnmounted(() => {
    stopPeriodicChecks()

    // Remove event listeners
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  return {
    // State
    isOnline,
    uptimeStatus,
    recentEvents,
    onlineEvents,
    offlineEvents,
    currentStreak,

    // Methods
    initializeMonitoring,
    stopPeriodicChecks,
    performUptimeCheck,
    generateUptimeReport,
    getUptimeAnalytics,
    checkUptimeSuccessCriteria,
    exportUptimeData,
    clearUptimeData,
  }
}
