// src/types/user.ts
import type { Event } from './events'

export type UserRole = 'admin' | 'moderator' | 'member' | 'guest' | 'banned'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'
export type Permission =
  | 'create_channels'
  | 'manage_channels'
  | 'delete_messages'
  | 'manage_users'
  | 'manage_roles'
  | 'view_analytics'
  | 'create_events'
  | 'manage_events'
  | 'moderate_content'
  | 'access_admin_panel'

export interface UserProfile {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    facebook?: string
    instagram?: string
  }
  preferences: UserPreferences
  role: UserRole
  status: UserStatus
  permissions: Permission[]
  joinedAt: Date
  lastActiveAt: Date
  isOnline: boolean
  timezone: string
  language: string
  // Activity statistics
  stats: UserStats
  // Activity history
  activityHistory: UserActivity[]
  // Associated entities
  createdEvents: Event[]
  attendingEvents: Event[]
  // Profile visibility settings
  visibility: ProfileVisibility
  // Notification preferences
  notificationSettings: NotificationSettings
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  privacyLevel: 'public' | 'community' | 'private'
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowDirectMessages: boolean
  allowEventInvites: boolean
  allowFriendRequests: boolean
}

export interface UserStats {
  totalMessages: number
  totalEventsCreated: number
  totalEventsAttended: number
  totalChannelsJoined: number
  totalReactionsGiven: number
  totalReactionsReceived: number
  averageResponseTime: number // in minutes
  lastLoginAt: Date
  consecutiveDaysActive: number
  reputationScore: number
  badges: UserBadge[]
}

export interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earnedAt: Date
  category: 'participation' | 'leadership' | 'achievement' | 'special'
}

export interface UserActivity {
  id: string
  type: ActivityType
  description: string
  timestamp: Date
  metadata?: Record<string, any>
  relatedEntityId?: string
  relatedEntityType?: 'channel' | 'event' | 'message' | 'user'
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'message_sent'
  | 'message_edited'
  | 'message_deleted'
  | 'channel_joined'
  | 'channel_left'
  | 'channel_created'
  | 'event_created'
  | 'event_joined'
  | 'event_left'
  | 'profile_updated'
  | 'role_changed'
  | 'permission_granted'
  | 'permission_revoked'
  | 'badge_earned'
  | 'reaction_given'
  | 'reaction_received'

export interface ProfileVisibility {
  email: 'public' | 'community' | 'private'
  phone: 'public' | 'community' | 'private'
  location: 'public' | 'community' | 'private'
  bio: 'public' | 'community' | 'private'
  socialLinks: 'public' | 'community' | 'private'
  activityHistory: 'public' | 'community' | 'private'
  onlineStatus: 'public' | 'community' | 'private'
  lastSeen: 'public' | 'community' | 'private'
}

export interface NotificationSettings {
  email: {
    newMessages: boolean
    mentions: boolean
    eventInvites: boolean
    eventReminders: boolean
    roleChanges: boolean
    systemUpdates: boolean
  }
  push: {
    newMessages: boolean
    mentions: boolean
    eventInvites: boolean
    eventReminders: boolean
    roleChanges: boolean
    systemUpdates: boolean
  }
  sms: {
    urgentMessages: boolean
    emergencyAlerts: boolean
    systemUpdates: boolean
  }
  inApp: {
    newMessages: boolean
    mentions: boolean
    reactions: boolean
    eventUpdates: boolean
    roleChanges: boolean
    systemUpdates: boolean
  }
}

export interface CreateUserProfilePayload {
  username: string
  displayName: string
  email: string
  password: string
  role?: UserRole
  preferences?: Partial<UserPreferences>
  visibility?: Partial<ProfileVisibility>
  notificationSettings?: Partial<NotificationSettings>
}

export interface UpdateUserProfilePayload {
  displayName?: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  socialLinks?: Partial<UserProfile['socialLinks']>
  preferences?: Partial<UserPreferences>
  visibility?: Partial<ProfileVisibility>
  notificationSettings?: Partial<NotificationSettings>
}

export interface UserSearchQuery {
  query?: string
  role?: UserRole
  status?: UserStatus
  location?: string
  hasPermission?: Permission
  isOnline?: boolean
  joinedAfter?: Date
  joinedBefore?: Date
  limit?: number
  offset?: number
  sortBy?: 'username' | 'displayName' | 'joinedAt' | 'lastActiveAt' | 'reputationScore'
  sortOrder?: 'asc' | 'desc'
}

export interface UserSearchResult {
  users: UserProfile[]
  total: number
  hasMore: boolean
}

export interface RolePermission {
  role: UserRole
  permissions: Permission[]
  description: string
  color: string
  canManageRoles: boolean
  canManageUsers: boolean
  canAccessAdminPanel: boolean
}

export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
  requiredRole?: UserRole
  requiredPermissions?: Permission[]
}

export interface UserInvite {
  id: string
  email: string
  invitedBy: string
  role: UserRole
  message?: string
  expiresAt: Date
  acceptedAt?: Date
  createdAt: Date
}

export interface UserSession {
  id: string
  userId: string
  deviceInfo: {
    userAgent: string
    platform: string
    browser: string
    isMobile: boolean
  }
  ipAddress: string
  location?: {
    country: string
    region: string
    city: string
  }
  isActive: boolean
  lastActivityAt: Date
  createdAt: Date
  expiresAt: Date
}

export interface UserReport {
  id: string
  reporterId: string
  reportedUserId: string
  reason: ReportReason
  description: string
  evidence?: string[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  moderatorId?: string
  moderatorNotes?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_profile'
  | 'impersonation'
  | 'other'

export interface UserBlock {
  id: string
  blockerId: string
  blockedUserId: string
  reason?: string
  createdAt: Date
}

export interface UserMute {
  id: string
  muterId: string
  mutedUserId: string
  reason?: string
  expiresAt?: Date
  createdAt: Date
}

export interface UserFollow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export interface UserFriend {
  id: string
  requesterId: string
  addresseeId: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  createdAt: Date
  updatedAt: Date
}
