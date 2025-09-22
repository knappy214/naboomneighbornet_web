/**
 * Authentication Debugging Utilities
 * Use these functions in the browser console to debug authentication issues
 */

import { useAuthStore } from '@/stores/auth'

export interface TokenInfo {
  token: string | null
  isValid: boolean
  isExpired: boolean
  expiresAt: Date | null
  issuedAt: Date | null
  payload: any
  error?: string
}

export interface AuthDebugInfo {
  accessToken: TokenInfo
  refreshToken: TokenInfo
  localStorage: {
    accessToken: string | null
    refreshToken: string | null
  }
  isAuthenticated: boolean
  timestamp: Date
}

/**
 * Decode JWT token and extract information
 */
export function decodeJWT(token: string | null): TokenInfo {
  if (!token) {
    return {
      token: null,
      isValid: false,
      isExpired: false,
      expiresAt: null,
      issuedAt: null,
      payload: null,
      error: 'No token provided',
    }
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return {
        token,
        isValid: false,
        isExpired: false,
        expiresAt: null,
        issuedAt: null,
        payload: null,
        error: 'Invalid JWT format - expected 3 parts',
      }
    }

    const payload = JSON.parse(atob(parts[1] || ''))
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null
    const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null
    const isExpired = payload.exp ? now > payload.exp : false

    return {
      token,
      isValid: true,
      isExpired,
      expiresAt,
      issuedAt,
      payload,
      error: undefined,
    }
  } catch (error) {
    return {
      token,
      isValid: false,
      isExpired: false,
      expiresAt: null,
      issuedAt: null,
      payload: null,
      error: `Failed to decode token: ${error}`,
    }
  }
}

/**
 * Get comprehensive authentication debug information
 */
export function getAuthDebugInfo(): AuthDebugInfo {
  const authStore = useAuthStore()

  return {
    accessToken: decodeJWT(authStore.accessToken),
    refreshToken: decodeJWT(authStore.refreshToken),
    localStorage: {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    },
    isAuthenticated: !!authStore.accessToken,
    timestamp: new Date(),
  }
}

/**
 * Log authentication status to console
 */
export function logAuthStatus(): void {
  console.log('🔐 Authentication Debug Information')
  console.log('=====================================')

  const info = getAuthDebugInfo()

  console.log('📊 Store State:')
  console.log('  - Access Token:', info.accessToken.token ? 'Present' : 'Missing')
  console.log('  - Refresh Token:', info.refreshToken.token ? 'Present' : 'Missing')
  console.log('  - Is Authenticated:', info.isAuthenticated)

  console.log('💾 Local Storage:')
  console.log('  - Access Token:', info.localStorage.accessToken ? 'Present' : 'Missing')
  console.log('  - Refresh Token:', info.localStorage.refreshToken ? 'Present' : 'Missing')

  if (info.accessToken.token) {
    console.log('🎫 Access Token Details:')
    console.log('  - Valid:', info.accessToken.isValid)
    console.log('  - Expired:', info.accessToken.isExpired)
    console.log('  - Expires At:', info.accessToken.expiresAt)
    console.log('  - Issued At:', info.accessToken.issuedAt)
    console.log('  - Payload:', info.accessToken.payload)
    if (info.accessToken.error) {
      console.error('  - Error:', info.accessToken.error)
    }
  }

  if (info.refreshToken.token) {
    console.log('🔄 Refresh Token Details:')
    console.log('  - Valid:', info.refreshToken.isValid)
    console.log('  - Expired:', info.refreshToken.isExpired)
    console.log('  - Expires At:', info.refreshToken.expiresAt)
    console.log('  - Issued At:', info.refreshToken.issuedAt)
    console.log('  - Payload:', info.refreshToken.payload)
    if (info.refreshToken.error) {
      console.error('  - Error:', info.refreshToken.error)
    }
  }

  console.log('⏰ Debug Time:', info.timestamp)
  console.log('=====================================')
}

/**
 * Test API authentication by making a test request
 */
export async function testAPIAuth(): Promise<void> {
  console.log('🧪 Testing API Authentication...')

  try {
    // Import the API instance that has auth interceptors
    const { default: api } = await import('@/lib/api')

    console.log('📡 Making test request to /user-profiles/...')
    const response = await api.get('/user-profiles/')

    console.log('✅ API Authentication Test SUCCESSFUL')
    console.log('  - Status:', response.status)
    console.log('  - Data:', response.data)
  } catch (error: any) {
    console.error('❌ API Authentication Test FAILED')
    console.error('  - Status:', error.response?.status)
    console.error('  - Message:', error.message)
    console.error('  - Response:', error.response?.data)

    if (error.response?.status === 401) {
      console.error('  - This is an authentication error (401 Unauthorized)')
      console.error('  - Check if your token is valid and not expired')
    }
  }
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  console.log('🧹 Clearing all authentication data...')

  const authStore = useAuthStore()
  authStore.clear()

  // Also clear any other auth-related localStorage items
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')

  console.log('✅ Authentication data cleared')
}

/**
 * Check network requests in DevTools
 */
export function checkNetworkRequests(): void {
  console.log('🌐 Network Request Debugging Guide')
  console.log('=====================================')
  console.log('1. Open Chrome DevTools (F12)')
  console.log('2. Go to Network tab')
  console.log('3. Look for requests to:')
  console.log('   - /api/v2/user-profiles/')
  console.log('   - /api/auth/jwt/refresh/')
  console.log('4. Check the Request Headers for:')
  console.log('   - Authorization: Bearer <token>')
  console.log('5. Check the Response for error details')
  console.log('=====================================')
}

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  ;(window as any).authDebug = {
    logAuthStatus,
    testAPIAuth,
    clearAuth,
    checkNetworkRequests,
    getAuthDebugInfo,
    decodeJWT,
  }

  console.log('🔧 Auth debugging tools loaded!')
  console.log('Available commands:')
  console.log('  - authDebug.logAuthStatus() - Show current auth status')
  console.log('  - authDebug.testAPIAuth() - Test API authentication')
  console.log('  - authDebug.clearAuth() - Clear all auth data')
  console.log('  - authDebug.checkNetworkRequests() - Show network debugging guide')
}
