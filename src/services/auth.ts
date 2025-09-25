import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

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
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const authStore = useAuthStore()
  return !!authStore.accessToken
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
