import axios from 'axios'
import { handleApiError, createUserErrorMessage, type ErrorContext } from '@/utils/errorHandler'
import { useAuthStore } from '@/stores/auth'

// Determine the correct Community Hub API base URL
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'
const isProduction = window.location.hostname === 'naboomneighbornet.net.za'

const getCommunityHubBaseUrl = () => {
  // If environment variables are set, use them
  if (import.meta.env.VITE_COMMUNITY_HUB_BASE) return import.meta.env.VITE_COMMUNITY_HUB_BASE

  // Check if we have API base URL and convert it to community-hub
  if (import.meta.env.VITE_API_BASE_URL) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    if (baseUrl.includes('/api/v2')) {
      return baseUrl.replace('/api/v2', '/api/community')
    }
    // If the base URL already ends with /api, just replace it
    if (baseUrl.endsWith('/api')) {
      return baseUrl.replace('/api', '/api/community')
    }
    // Otherwise, add /api/community
    return baseUrl + '/api/community'
  }

  if (import.meta.env.VITE_API_BASE) {
    const baseUrl = import.meta.env.VITE_API_BASE
    if (baseUrl.includes('/api/v2')) {
      return baseUrl.replace('/api/v2', '/api/community')
    }
    // If the base URL already ends with /api, just replace it
    if (baseUrl.endsWith('/api')) {
      return baseUrl.replace('/api', '/api/community')
    }
    // Otherwise, add /api/community
    return baseUrl + '/api/community'
  }

  // If running on production domain, use production Community Hub API
  if (isProduction) return 'https://naboomneighbornet.net.za/api/community'

  // For development, use localhost Community Hub API
  if (isDevelopment) return 'http://localhost:8000/api/community'

  // Fallback to production Community Hub API
  return 'https://naboomneighbornet.net.za/api/community'
}

// Create a separate API instance for Community Hub
const communityHubAPI = axios.create({
  baseURL: getCommunityHubBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Debug the Community Hub API configuration
const communityHubBaseUrl = getCommunityHubBaseUrl()
console.log('Community Hub API Configuration:', {
  baseURL: communityHubBaseUrl,
  isDevelopment,
  isProduction,
  hostname: window.location.hostname,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  VITE_COMMUNITY_HUB_BASE: import.meta.env.VITE_COMMUNITY_HUB_BASE,
})

// Add auth interceptor
communityHubAPI.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
communityHubAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh if needed
      const authStore = useAuthStore()
      if (authStore.refreshToken) {
        try {
          await authStore.refreshToken()
          // Retry the original request
          return communityHubAPI.request(error.config)
        } catch (refreshError) {
          // Redirect to login or handle auth failure
          authStore.clear()
        }
      }
    }
    return Promise.reject(error)
  },
)

// Types based on the API documentation
export interface Channel {
  id: number
  slug: string
  name: string
  name_translations: Record<string, string>
  description: string
  description_translations: Record<string, string>
  kind: 'discussion' | 'announcement' | 'event'
  posting_policy: 'members' | 'moderators' | 'managers'
  is_private: boolean
  is_active: boolean
  allow_alerts: boolean
  broadcast_scope: 'members' | 'all'
  allow_join_requests: boolean
  default_alerts_enabled: boolean
  default_posts_enabled: boolean
  teaser_character_limit: number
  created_at: string
  updated_at: string
  is_member: boolean
  membership_role: 'member' | 'moderator' | 'manager' | null
}

export interface Thread {
  id: number
  title: string
  title_translations: Record<string, string>
  channel: number
  author: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
  created_at: string
  updated_at: string
  posts: Post[]
}

export interface Post {
  id: number
  content: string
  content_translations: Record<string, string>
  thread: number
  channel: number
  author: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
  kind: 'post' | 'alert'
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: number
  thread: number
  event_date: string
  location: string
  max_attendees: number | null
  created_at: string
  updated_at: string
}

export interface EventRSVP {
  id: number
  event: number
  user: number
  status: 'attending' | 'maybe' | 'not_attending'
  created_at: string
  updated_at: string
}

export interface Alert {
  id: number
  content: string
  thread: number
  channel: number
  created_at: string
  updated_at: string
}

export interface ChannelInvite {
  id: number
  channel: number
  email: string
  role: 'member' | 'moderator' | 'manager'
  created_at: string
  updated_at: string
}

export interface JoinRequest {
  id: number
  channel: number
  user: number
  message: string
  status: 'pending' | 'approved' | 'declined'
  created_at: string
  updated_at: string
}

export interface Report {
  id: number
  channel: number
  thread: number | null
  post: number | null
  reason: string
  description: string
  created_at: string
  updated_at: string
}

export interface Device {
  id: number
  device_id: string
  platform: 'ios' | 'android' | 'web'
  push_token: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VapidKey {
  publicKey: string
}

// API Request/Response types
export interface CreateThreadRequest {
  title: string
  channel: number
  posts: Array<{
    content: string
  }>
}

export interface CreatePostRequest {
  content: string
  thread: number
  channel: number
}

export interface CreateAlertRequest {
  content: string
  thread: number
  channel: number
}

export interface CreateEventRequest {
  thread: number
  event_date: string
  location: string
  max_attendees?: number
}

export interface CreateEventRSVPRequest {
  event: number
  status: 'attending' | 'maybe' | 'not_attending'
}

export interface CreateInviteRequest {
  channel: number
  email: string
  role: 'member' | 'moderator' | 'manager'
}

export interface CreateJoinRequestRequest {
  channel: number
  message: string
}

export interface CreateReportRequest {
  channel: number
  thread?: number
  post?: number
  reason: string
  description: string
}

export interface RegisterDeviceRequest {
  device_id: string
  platform: 'ios' | 'android' | 'web'
  push_token: string
  is_active: boolean
}

// Channels API
export async function getChannels(): Promise<Channel[]> {
  const context: ErrorContext = {
    operation: 'Get Channels',
    endpoint: '/channels/',
  }

  try {
    const fullUrl = communityHubAPI.defaults.baseURL + '/channels/'
    console.log('Making Community Hub API request to:', fullUrl)
    const response = await communityHubAPI.get<Channel[]>('/channels/')
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch channels:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function joinChannel(channelId: number): Promise<{
  id: number
  user: number
  channel: number
  role: string
  is_active: boolean
  joined_at: string
}> {
  const context: ErrorContext = {
    operation: 'Join Channel',
    endpoint: `/channels/${channelId}/join/`,
  }

  try {
    const response = await communityHubAPI.post(`/channels/${channelId}/join/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to join channel:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function leaveChannel(channelId: number): Promise<void> {
  const context: ErrorContext = {
    operation: 'Leave Channel',
    endpoint: `/channels/${channelId}/leave/`,
  }

  try {
    await communityHubAPI.post(`/channels/${channelId}/leave/`)
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to leave channel:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Threads API
export async function getThreads(
  params: { channel?: number; page?: number; page_size?: number } = {},
): Promise<Thread[]> {
  const context: ErrorContext = {
    operation: 'Get Threads',
    endpoint: '/threads/',
    params,
  }

  try {
    const response = await communityHubAPI.get<Thread[]>(`/threads/`, { params })
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch threads:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function getThread(threadId: number): Promise<Thread> {
  const context: ErrorContext = {
    operation: 'Get Thread',
    endpoint: `/threads/${threadId}/`,
  }

  try {
    const response = await communityHubAPI.get<Thread>(`/threads/${threadId}/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch thread:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createThread(data: CreateThreadRequest): Promise<Thread> {
  const context: ErrorContext = {
    operation: 'Create Thread',
    endpoint: '/threads/',
    data,
  }

  try {
    const response = await communityHubAPI.post<Thread>(`/threads/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create thread:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function updateThread(
  threadId: number,
  data: Partial<CreateThreadRequest>,
): Promise<Thread> {
  const context: ErrorContext = {
    operation: 'Update Thread',
    endpoint: `/threads/${threadId}/`,
    data,
  }

  try {
    const response = await communityHubAPI.put<Thread>(`/threads/${threadId}/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to update thread:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function deleteThread(threadId: number): Promise<void> {
  const context: ErrorContext = {
    operation: 'Delete Thread',
    endpoint: `/threads/${threadId}/`,
  }

  try {
    await communityHubAPI.delete(`/threads/${threadId}/`)
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to delete thread:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Posts API
export async function getPosts(
  params: { thread?: number; channel?: number } = {},
): Promise<Post[]> {
  const context: ErrorContext = {
    operation: 'Get Posts',
    endpoint: '/posts/',
    params,
  }

  try {
    const response = await communityHubAPI.get<Post[]>(`/posts/`, { params })
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch posts:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
  const context: ErrorContext = {
    operation: 'Create Post',
    endpoint: '/posts/',
    data,
  }

  try {
    const response = await communityHubAPI.post<Post>(`/posts/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create post:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function updatePost(postId: number, data: Partial<CreatePostRequest>): Promise<Post> {
  const context: ErrorContext = {
    operation: 'Update Post',
    endpoint: `/posts/${postId}/`,
    data,
  }

  try {
    const response = await communityHubAPI.put<Post>(`/posts/${postId}/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to update post:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function softDeletePost(postId: number): Promise<void> {
  const context: ErrorContext = {
    operation: 'Soft Delete Post',
    endpoint: `/posts/${postId}/soft_delete/`,
  }

  try {
    await communityHubAPI.post(`/posts/${postId}/soft_delete/`)
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to soft delete post:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function restorePost(postId: number): Promise<void> {
  const context: ErrorContext = {
    operation: 'Restore Post',
    endpoint: `/posts/${postId}/restore/`,
  }

  try {
    await communityHubAPI.post(`/posts/${postId}/restore/`)
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to restore post:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Alerts API
export async function getAlerts(): Promise<Alert[]> {
  const context: ErrorContext = {
    operation: 'Get Alerts',
    endpoint: '/alerts/',
  }

  try {
    const response = await communityHubAPI.get<Alert[]>(`/alerts/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch alerts:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createAlert(data: CreateAlertRequest): Promise<Alert> {
  const context: ErrorContext = {
    operation: 'Create Alert',
    endpoint: '/alerts/',
    data,
  }

  try {
    const response = await communityHubAPI.post<Alert>(`/alerts/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create alert:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Events API
export async function getEvents(): Promise<Event[]> {
  const context: ErrorContext = {
    operation: 'Get Events',
    endpoint: '/events/',
  }

  try {
    const response = await communityHubAPI.get<Event[]>(`/events/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch events:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createEvent(data: CreateEventRequest): Promise<Event> {
  const context: ErrorContext = {
    operation: 'Create Event',
    endpoint: '/events/',
    data,
  }

  try {
    const response = await communityHubAPI.post<Event>(`/events/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create event:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function rsvpEvent(data: CreateEventRSVPRequest): Promise<EventRSVP> {
  const context: ErrorContext = {
    operation: 'RSVP Event',
    endpoint: '/event-rsvps/',
    data,
  }

  try {
    const response = await communityHubAPI.post<EventRSVP>(`event-rsvps/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to RSVP to event:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Channel Invites API
export async function getInvites(): Promise<ChannelInvite[]> {
  const context: ErrorContext = {
    operation: 'Get Invites',
    endpoint: '/invites/',
  }

  try {
    const response = await communityHubAPI.get<ChannelInvite[]>(`/invites/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch invites:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createInvite(data: CreateInviteRequest): Promise<ChannelInvite> {
  const context: ErrorContext = {
    operation: 'Create Invite',
    endpoint: '/invites/',
    data,
  }

  try {
    const response = await communityHubAPI.post<ChannelInvite>(`/invites/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create invite:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Join Requests API
export async function getJoinRequests(): Promise<JoinRequest[]> {
  const context: ErrorContext = {
    operation: 'Get Join Requests',
    endpoint: '/join-requests/',
  }

  try {
    const response = await communityHubAPI.get<JoinRequest[]>(`/join-requests/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch join requests:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createJoinRequest(data: CreateJoinRequestRequest): Promise<JoinRequest> {
  const context: ErrorContext = {
    operation: 'Create Join Request',
    endpoint: '/join-requests/',
    data,
  }

  try {
    const response = await communityHubAPI.post<JoinRequest>(`/join-requests/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create join request:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function approveJoinRequest(requestId: number): Promise<void> {
  const context: ErrorContext = {
    operation: 'Approve Join Request',
    endpoint: `/join-requests/${requestId}/approve/`,
  }

  try {
    await communityHubAPI.post(`/join-requests/${requestId}/approve/`)
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to approve join request:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function declineJoinRequest(requestId: number): Promise<void> {
  const context: ErrorContext = {
    operation: 'Decline Join Request',
    endpoint: `/join-requests/${requestId}/decline/`,
  }

  try {
    await communityHubAPI.post(`/join-requests/${requestId}/decline/`)
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to decline join request:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Reports API
export async function getReports(): Promise<Report[]> {
  const context: ErrorContext = {
    operation: 'Get Reports',
    endpoint: '/reports/',
  }

  try {
    const response = await communityHubAPI.get<Report[]>(`/reports/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch reports:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function createReport(data: CreateReportRequest): Promise<Report> {
  const context: ErrorContext = {
    operation: 'Create Report',
    endpoint: '/reports/',
    data,
  }

  try {
    const response = await communityHubAPI.post<Report>(`/reports/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to create report:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Search API
export async function searchThreads(query: string, channelId?: number): Promise<Thread[]> {
  const context: ErrorContext = {
    operation: 'Search Threads',
    endpoint: '/search/threads/',
    params: { q: query, channel: channelId },
  }

  try {
    const params: Record<string, any> = { q: query }
    if (channelId) params.channel = channelId

    const response = await communityHubAPI.get<Thread[]>(`/search/threads/`, { params })
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to search threads:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

// Devices API
export async function getDevices(): Promise<Device[]> {
  const context: ErrorContext = {
    operation: 'Get Devices',
    endpoint: '/devices/',
  }

  try {
    const response = await communityHubAPI.get<Device[]>(`/devices/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch devices:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function registerDevice(data: RegisterDeviceRequest): Promise<Device> {
  const context: ErrorContext = {
    operation: 'Register Device',
    endpoint: '/devices/',
    data,
  }

  try {
    const response = await communityHubAPI.post<Device>(`/devices/`, data)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to register device:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}

export async function getVapidKey(): Promise<VapidKey> {
  const context: ErrorContext = {
    operation: 'Get VAPID Key',
    endpoint: '/vapid-key/',
  }

  try {
    const response = await communityHubAPI.get<VapidKey>(`/vapid-key/`)
    return response.data
  } catch (error) {
    const apiError = handleApiError(error, context)
    const userMessage = createUserErrorMessage(apiError, context)
    console.error('Failed to fetch VAPID key:', { error: apiError, userMessage })
    throw new Error(userMessage)
  }
}
