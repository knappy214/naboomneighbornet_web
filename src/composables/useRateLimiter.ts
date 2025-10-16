import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useErrorHandler } from './useErrorHandler'
import { useLogging } from './useLogging'

// Rate limiting types
export type RateLimitAlgorithm = 'sliding-window' | 'token-bucket' | 'fixed-window'

export interface RateLimitConfig {
  algorithm: RateLimitAlgorithm
  maxRequests: number
  windowMs: number
  burstSize?: number // For token bucket
  refillRate?: number // For token bucket
  keyGenerator?: (context: RateLimitContext) => string
}

export interface RateLimitContext {
  userId?: string
  ipAddress?: string
  userAgent?: string
  action?: string
  resource?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
  reason?: string
}

export interface RateLimitEntry {
  key: string
  requests: number[]
  tokens?: number
  lastRefill?: number
  windowStart?: number
}

// Rate limiting state
const rateLimitEntries = ref<Map<string, RateLimitEntry>>(new Map())
const isRateLimitingEnabled = ref(true)
const sessionId = ref('')

// Default rate limit configurations for different actions
const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  // Message sending
  'message:send': {
    algorithm: 'sliding-window',
    maxRequests: 30, // 30 messages per minute
    windowMs: 60000, // 1 minute
  },

  // Message editing
  'message:edit': {
    algorithm: 'sliding-window',
    maxRequests: 10, // 10 edits per minute
    windowMs: 60000,
  },

  // Search requests
  'search:query': {
    algorithm: 'sliding-window',
    maxRequests: 60, // 60 searches per minute
    windowMs: 60000,
  },

  // API calls
  'api:call': {
    algorithm: 'token-bucket',
    maxRequests: 100, // 100 requests per minute
    windowMs: 60000,
    burstSize: 20, // Allow bursts of 20
    refillRate: 100, // Refill 100 tokens per minute
  },

  // User registration
  'auth:register': {
    algorithm: 'fixed-window',
    maxRequests: 3, // 3 registration attempts per hour
    windowMs: 3600000, // 1 hour
  },

  // Login attempts
  'auth:login': {
    algorithm: 'sliding-window',
    maxRequests: 5, // 5 login attempts per 15 minutes
    windowMs: 900000, // 15 minutes
  },

  // Password reset
  'auth:reset': {
    algorithm: 'fixed-window',
    maxRequests: 3, // 3 password reset attempts per hour
    windowMs: 3600000,
  },

  // File uploads
  'file:upload': {
    algorithm: 'token-bucket',
    maxRequests: 10, // 10 uploads per minute
    windowMs: 60000,
    burstSize: 3,
    refillRate: 10,
  },

  // Event creation
  'event:create': {
    algorithm: 'sliding-window',
    maxRequests: 5, // 5 events per hour
    windowMs: 3600000,
  },

  // Profile updates
  'profile:update': {
    algorithm: 'sliding-window',
    maxRequests: 20, // 20 updates per hour
    windowMs: 3600000,
  },
}

export function useRateLimiter() {
  const { handleError } = useErrorHandler()
  const { logSecurityEvent, logUserAction } = useLogging()

  // Computed properties
  const activeLimits = computed(() => rateLimitEntries.value.size)
  const isEnabled = computed(() => isRateLimitingEnabled.value)

  // Initialize rate limiter
  function initializeRateLimiter() {
    sessionId.value = getSessionId()

    // Clean up expired entries periodically
    startCleanupInterval()
  }

  function getSessionId(): string {
    let id = sessionStorage.getItem('rate_limiter_session_id')
    if (!id) {
      id = `rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('rate_limiter_session_id', id)
    }
    return id
  }

  // Generate rate limit key
  function generateKey(action: string, context: RateLimitContext): string {
    const parts = [action]

    if (context.userId) {
      parts.push(`user:${context.userId}`)
    } else if (context.ipAddress) {
      parts.push(`ip:${context.ipAddress}`)
    } else {
      parts.push(`session:${sessionId.value}`)
    }

    if (context.resource) {
      parts.push(`resource:${context.resource}`)
    }

    return parts.join(':')
  }

  // Sliding window algorithm
  function checkSlidingWindow(key: string, config: RateLimitConfig, now: number): RateLimitResult {
    const entry = rateLimitEntries.value.get(key)
    const windowStart = now - config.windowMs
    const limit = config.maxRequests

    if (!entry) {
      // First request
      const newEntry: RateLimitEntry = {
        key,
        requests: [now],
        windowStart: now,
      }
      rateLimitEntries.value.set(key, newEntry)

      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetTime: now + config.windowMs,
      }
    }

    // Remove old requests outside the window
    const validRequests = entry.requests.filter((time) => time > windowStart)
    validRequests.push(now)

    entry.requests = validRequests
    entry.windowStart = windowStart

    const requestCount = validRequests.length
    const success = requestCount <= limit
    const remaining = Math.max(0, limit - requestCount)
    const resetTime = validRequests[0] + config.windowMs

    return {
      success,
      limit,
      remaining,
      resetTime,
      retryAfter: success ? undefined : Math.ceil((resetTime - now) / 1000),
      reason: success ? undefined : 'Rate limit exceeded',
    }
  }

  // Token bucket algorithm
  function checkTokenBucket(key: string, config: RateLimitConfig, now: number): RateLimitResult {
    const entry = rateLimitEntries.value.get(key)
    const burstSize = config.burstSize || config.maxRequests
    const refillRate = config.refillRate || config.maxRequests
    const tokensPerMs = refillRate / config.windowMs

    if (!entry) {
      // First request - initialize with full bucket
      const newEntry: RateLimitEntry = {
        key,
        requests: [now],
        tokens: burstSize - 1,
        lastRefill: now,
      }
      rateLimitEntries.value.set(key, newEntry)

      return {
        success: true,
        limit: burstSize,
        remaining: burstSize - 1,
        resetTime: now + config.windowMs,
      }
    }

    // Refill tokens based on time elapsed
    const timeElapsed = now - (entry.lastRefill || now)
    const tokensToAdd = timeElapsed * tokensPerMs
    const currentTokens = Math.min(burstSize, (entry.tokens || 0) + tokensToAdd)

    const success = currentTokens >= 1
    const remaining = Math.max(0, Math.floor(currentTokens - 1))

    if (success) {
      entry.tokens = remaining
      entry.lastRefill = now
      entry.requests.push(now)
    }

    return {
      success,
      limit: burstSize,
      remaining,
      resetTime: now + config.windowMs,
      retryAfter: success ? undefined : Math.ceil(1000 / tokensPerMs),
      reason: success ? undefined : 'No tokens available',
    }
  }

  // Fixed window algorithm
  function checkFixedWindow(key: string, config: RateLimitConfig, now: number): RateLimitResult {
    const entry = rateLimitEntries.value.get(key)
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs
    const limit = config.maxRequests

    if (!entry || entry.windowStart !== windowStart) {
      // New window or first request
      const newEntry: RateLimitEntry = {
        key,
        requests: [now],
        windowStart,
      }
      rateLimitEntries.value.set(key, newEntry)

      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetTime: windowStart + config.windowMs,
      }
    }

    const requestCount = entry.requests.length
    const success = requestCount < limit

    if (success) {
      entry.requests.push(now)
    }

    const remaining = Math.max(0, limit - (requestCount + (success ? 1 : 0)))
    const resetTime = windowStart + config.windowMs

    return {
      success,
      limit,
      remaining,
      resetTime,
      retryAfter: success ? undefined : Math.ceil((resetTime - now) / 1000),
      reason: success ? undefined : 'Rate limit exceeded',
    }
  }

  // Main rate limit check
  function checkRateLimit(
    action: string,
    context: RateLimitContext = {},
    customConfig?: Partial<RateLimitConfig>,
  ): RateLimitResult {
    if (!isRateLimitingEnabled.value) {
      return {
        success: true,
        limit: Infinity,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      }
    }

    const config = { ...DEFAULT_CONFIGS[action], ...customConfig }
    if (!config) {
      throw new Error(`No rate limit configuration found for action: ${action}`)
    }

    const key = config.keyGenerator ? config.keyGenerator(context) : generateKey(action, context)

    const now = Date.now()
    let result: RateLimitResult

    switch (config.algorithm) {
      case 'sliding-window':
        result = checkSlidingWindow(key, config, now)
        break
      case 'token-bucket':
        result = checkTokenBucket(key, config, now)
        break
      case 'fixed-window':
        result = checkFixedWindow(key, config, now)
        break
      default:
        throw new Error(`Unknown rate limit algorithm: ${config.algorithm}`)
    }

    // Log rate limit events
    if (result.success) {
      logUserAction(`Rate limit check passed: ${action}`, {
        action,
        context,
        remaining: result.remaining,
        limit: result.limit,
      })
    } else {
      logSecurityEvent(`Rate limit exceeded: ${action}`, {
        action,
        context,
        limit: result.limit,
        remaining: result.remaining,
        retryAfter: result.retryAfter,
      })
    }

    return result
  }

  // Check if action is allowed
  function isAllowed(
    action: string,
    context: RateLimitContext = {},
    customConfig?: Partial<RateLimitConfig>,
  ): boolean {
    const result = checkRateLimit(action, context, customConfig)
    return result.success
  }

  // Execute action with rate limiting
  async function executeWithRateLimit<T>(
    action: string,
    operation: () => Promise<T> | T,
    context: RateLimitContext = {},
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<T> {
    const result = checkRateLimit(action, context, customConfig)

    if (!result.success) {
      const error = new Error(`Rate limit exceeded for action: ${action}`)
      handleError(error, {
        component: 'RateLimiter',
        context: {
          action,
          context,
          limit: result.limit,
          remaining: result.remaining,
          retryAfter: result.retryAfter,
        },
      })
      throw error
    }

    try {
      const operationResult = await operation()
      return operationResult
    } catch (error) {
      // Don't count failed operations against rate limit
      // (depending on the type of error)
      if (error instanceof Error && !error.message.includes('Rate limit')) {
        // This is a business logic error, not a rate limit error
        // We might want to count it depending on the action
        logUserAction(`Operation failed: ${action}`, {
          action,
          context,
          error: error.message,
        })
      }
      throw error
    }
  }

  // Spam detection
  function detectSpam(
    content: string,
    context: RateLimitContext = {},
  ): { isSpam: boolean; reason?: string; confidence: number } {
    const spamPatterns = [
      // Common spam patterns
      /(?:buy|sell|cheap|free|discount|offer|deal|promo|sale)\s+(?:now|today|limited|exclusive)/gi,
      /(?:click|visit|go to|check out)\s+(?:here|this|link|url)/gi,
      /(?:win|winner|prize|reward|gift|bonus)\s+(?:now|today|free|instant)/gi,
      /(?:urgent|important|alert|warning|notice)\s+(?:action|response|reply)/gi,
      /(?:guaranteed|promise|assure|ensure)\s+(?:results|success|profit|money)/gi,
      // Repeated characters
      /(.)\1{4,}/g,
      // Excessive punctuation
      /[!]{3,}|[?]{3,}|[.]{3,}/g,
      // All caps
      /^[A-Z\s]{20,}$/,
      // URLs (basic detection)
      /https?:\/\/[^\s]+/gi,
      // Phone numbers
      /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
      // Email addresses
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    ]

    let spamScore = 0
    const reasons: string[] = []

    // Check against spam patterns
    spamPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern)
      if (matches) {
        spamScore += matches.length * (index < 6 ? 2 : 1) // Higher weight for obvious spam
        reasons.push(`Pattern ${index + 1} detected: ${matches[0]}`)
      }
    })

    // Check for excessive repetition
    const words = content.toLowerCase().split(/\s+/)
    const wordCounts = new Map<string, number>()
    words.forEach((word) => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    })

    const maxWordCount = Math.max(...wordCounts.values())
    if (maxWordCount > 5) {
      spamScore += maxWordCount
      reasons.push(`Excessive word repetition: ${maxWordCount} times`)
    }

    // Check message length
    if (content.length > 1000) {
      spamScore += 2
      reasons.push('Message too long')
    }

    // Check for rapid successive messages (if we have context)
    if (context.userId) {
      const recentMessages = getRecentMessages(context.userId, 30000) // Last 30 seconds
      if (recentMessages > 10) {
        spamScore += recentMessages
        reasons.push(`Too many recent messages: ${recentMessages}`)
      }
    }

    const isSpam = spamScore >= 5
    const confidence = Math.min(100, (spamScore / 10) * 100)

    if (isSpam) {
      logSecurityEvent('Spam detected', {
        content: content.substring(0, 100),
        context,
        spamScore,
        confidence,
        reasons,
      })
    }

    return {
      isSpam,
      reason: reasons.join('; '),
      confidence,
    }
  }

  // Get recent message count for spam detection
  function getRecentMessages(userId: string, timeWindow: number): number {
    const now = Date.now()
    const cutoff = now - timeWindow

    let count = 0
    rateLimitEntries.value.forEach((entry) => {
      if (entry.key.includes(`user:${userId}`) && entry.key.includes('message:send')) {
        count += entry.requests.filter((time) => time > cutoff).length
      }
    })

    return count
  }

  // Cleanup expired entries
  function cleanupExpiredEntries() {
    const now = Date.now()
    const expiredKeys: string[] = []

    rateLimitEntries.value.forEach((entry, key) => {
      const isExpired = entry.requests.every(
        (time) => now - time > (DEFAULT_CONFIGS[entry.key.split(':')[0]]?.windowMs || 300000),
      )

      if (isExpired) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach((key) => {
      rateLimitEntries.value.delete(key)
    })

    if (expiredKeys.length > 0) {
      logUserAction('Cleaned up expired rate limit entries', {
        expiredCount: expiredKeys.length,
        remainingEntries: rateLimitEntries.value.size,
      })
    }
  }

  // Start cleanup interval
  let cleanupInterval: NodeJS.Timeout | null = null

  function startCleanupInterval() {
    cleanupInterval = setInterval(cleanupExpiredEntries, 60000) // Every minute
  }

  function stopCleanupInterval() {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
  }

  // Rate limit analytics
  function getRateLimitAnalytics() {
    const totalEntries = rateLimitEntries.value.size
    const entriesByAction: Record<string, number> = {}

    rateLimitEntries.value.forEach((entry) => {
      const action = entry.key.split(':')[0]
      entriesByAction[action] = (entriesByAction[action] || 0) + 1
    })

    return {
      totalEntries,
      entriesByAction,
      isEnabled: isRateLimitingEnabled.value,
    }
  }

  // Enable/disable rate limiting
  function enableRateLimiting() {
    isRateLimitingEnabled.value = true
    logUserAction('Rate limiting enabled')
  }

  function disableRateLimiting() {
    isRateLimitingEnabled.value = false
    logUserAction('Rate limiting disabled')
  }

  // Clear all rate limits
  function clearAllRateLimits() {
    rateLimitEntries.value.clear()
    logUserAction('All rate limits cleared')
  }

  // Clear rate limits for specific action
  function clearRateLimitsForAction(action: string) {
    const keysToDelete: string[] = []

    rateLimitEntries.value.forEach((entry, key) => {
      if (key.startsWith(`${action}:`)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => {
      rateLimitEntries.value.delete(key)
    })

    logUserAction(`Rate limits cleared for action: ${action}`, {
      action,
      clearedCount: keysToDelete.length,
    })
  }

  // Lifecycle
  onMounted(() => {
    initializeRateLimiter()
  })

  onUnmounted(() => {
    stopCleanupInterval()
  })

  return {
    // State
    activeLimits,
    isEnabled,

    // Methods
    checkRateLimit,
    isAllowed,
    executeWithRateLimit,
    detectSpam,
    getRateLimitAnalytics,
    enableRateLimiting,
    disableRateLimiting,
    clearAllRateLimits,
    clearRateLimitsForAction,
  }
}
