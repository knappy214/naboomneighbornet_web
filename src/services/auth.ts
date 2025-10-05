import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { jwtDecode } from 'jwt-decode'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface RefreshResponse {
  access: string
}

export interface JWTPayload {
  exp: number
  iat: number
  user_id: number
  username: string
  [key: string]: unknown
}

/**
 * Check if a JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JWTPayload>(token)
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.warn('🔍 [AUTH] Failed to decode token:', error)
    return true // Consider invalid tokens as expired
  }
}

/**
 * Authenticate user and get JWT tokens
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    console.log('🔐 [AUTH] Attempting login for user:', credentials.username)

    const response = await api.post<LoginResponse>('../auth/jwt/create/', {
      username: credentials.username,
      password: credentials.password,
    })

    console.log('✅ [AUTH] Login successful')
    return response.data
  } catch (error) {
    console.error('❌ [AUTH] Login failed:', error)
    throw error
  }
}

/**
 * Refresh JWT access token using refresh token
 */
export async function refreshToken(): Promise<RefreshResponse> {
  const authStore = useAuthStore()

  if (!authStore.refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    console.log('🔄 [AUTH] Refreshing token')

    const response = await api.post<RefreshResponse>('../auth/jwt/refresh/', {
      refresh: authStore.refreshToken,
    })

    console.log('✅ [AUTH] Token refresh successful')
    return response.data
  } catch (error) {
    console.error('❌ [AUTH] Token refresh failed:', error)
    // Clear tokens if refresh fails
    authStore.clear()
    throw error
  }
}

/**
 * Logout user and clear tokens
 */
export function logout(): void {
  const authStore = useAuthStore()
  console.log('🚪 [AUTH] Logging out user')
  authStore.clear()
}

/**
 * Check if user is authenticated with valid token
 */
export function isAuthenticated(): boolean {
  const authStore = useAuthStore()

  if (!authStore.accessToken) {
    return false
  }

  // Check if token is expired
  if (isTokenExpired(authStore.accessToken)) {
    console.log('🔍 [AUTH] Access token is expired')
    return false
  }

  return true
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  const authStore = useAuthStore()
  return authStore.accessToken || null
}

/**
 * Set authentication tokens
 */
export function setTokens(access: string, refresh: string): void {
  const authStore = useAuthStore()
  authStore.setAccessToken(access)
  authStore.setRefreshToken(refresh)
  console.log('🔑 [AUTH] Tokens set successfully')
}

/**
 * Validate token and refresh if needed
 * Returns true if user is authenticated with valid token, false otherwise
 */
export async function validateAndRefreshToken(): Promise<boolean> {
  const authStore = useAuthStore()

  // If no tokens at all, user is not authenticated
  if (!authStore.accessToken || !authStore.refreshToken) {
    console.log('🔍 [AUTH] No tokens available')
    return false
  }

  // Check if access token is expired
  if (!isTokenExpired(authStore.accessToken)) {
    console.log('✅ [AUTH] Access token is valid')
    return true
  }

  // Access token is expired, try to refresh
  console.log('🔄 [AUTH] Access token expired, attempting refresh')
  try {
    const response = await refreshToken()
    authStore.setAccessToken(response.access)
    console.log('✅ [AUTH] Token refresh successful')
    return true
  } catch (error) {
    console.log('❌ [AUTH] Token refresh failed:', error)
    // Tokens are cleared in refreshToken() on failure
    return false
  }
}
