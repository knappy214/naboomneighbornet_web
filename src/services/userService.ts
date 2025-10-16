// src/services/userService.ts
import { api } from './api'
import type {
  UserProfile,
  CreateUserProfilePayload,
  UpdateUserProfilePayload,
  UserSearchQuery,
  UserSearchResult,
  UserActivity,
  UserStats,
  UserBadge,
  RolePermission,
  PermissionCheck,
  UserInvite,
  UserSession,
  UserReport,
  UserBlock,
  UserMute,
  UserFollow,
  UserFriend,
  UserRole,
  Permission,
} from '@/types/user'

class UserService {
  private baseUrl = '/api/users'

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get(`${this.baseUrl}/me`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch current user profile:', error)
      throw error
    }
  }

  /**
   * Create a new user profile
   */
  async createUserProfile(payload: CreateUserProfilePayload): Promise<UserProfile> {
    try {
      const response = await api.post(`${this.baseUrl}`, payload)
      return response.data
    } catch (error) {
      console.error('Failed to create user profile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, payload: UpdateUserProfilePayload): Promise<UserProfile> {
    try {
      const response = await api.patch(`${this.baseUrl}/${userId}`, payload)
      return response.data
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  /**
   * Delete user profile
   */
  async deleteUserProfile(userId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${userId}`)
    } catch (error) {
      console.error('Failed to delete user profile:', error)
      throw error
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: UserSearchQuery): Promise<UserSearchResult> {
    try {
      const response = await api.post(`${this.baseUrl}/search`, query)
      return response.data
    } catch (error) {
      console.error('Failed to search users:', error)
      throw error
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(userId: string, limit = 50, offset = 0): Promise<UserActivity[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/activity`, {
        params: { limit, offset },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch user activity:', error)
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/stats`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      throw error
    }
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/badges`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user badges:', error)
      throw error
    }
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    try {
      const response = await api.post(`${this.baseUrl}/${userId}/badges`, { badgeId })
      return response.data
    } catch (error) {
      console.error('Failed to award badge:', error)
      throw error
    }
  }

  /**
   * Get all available roles and permissions
   */
  async getRolesAndPermissions(): Promise<RolePermission[]> {
    try {
      const response = await api.get(`${this.baseUrl}/roles`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch roles and permissions:', error)
      throw error
    }
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(userId: string, permission: Permission): Promise<PermissionCheck> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/permissions/${permission}`)
      return response.data
    } catch (error) {
      console.error('Failed to check permission:', error)
      throw error
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<UserProfile> {
    try {
      const response = await api.patch(`${this.baseUrl}/${userId}/role`, { role })
      return response.data
    } catch (error) {
      console.error('Failed to update user role:', error)
      throw error
    }
  }

  /**
   * Grant permission to user
   */
  async grantPermission(userId: string, permission: Permission): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${userId}/permissions`, { permission })
    } catch (error) {
      console.error('Failed to grant permission:', error)
      throw error
    }
  }

  /**
   * Revoke permission from user
   */
  async revokePermission(userId: string, permission: Permission): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${userId}/permissions/${permission}`)
    } catch (error) {
      console.error('Failed to revoke permission:', error)
      throw error
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/sessions`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user sessions:', error)
      throw error
    }
  }

  /**
   * Terminate user session
   */
  async terminateSession(userId: string, sessionId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${userId}/sessions/${sessionId}`)
    } catch (error) {
      console.error('Failed to terminate session:', error)
      throw error
    }
  }

  /**
   * Terminate all user sessions
   */
  async terminateAllSessions(userId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${userId}/sessions`)
    } catch (error) {
      console.error('Failed to terminate all sessions:', error)
      throw error
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post(`${this.baseUrl}/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      throw error
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${userId}/avatar`)
    } catch (error) {
      console.error('Failed to delete avatar:', error)
      throw error
    }
  }

  /**
   * Send user invite
   */
  async sendUserInvite(invite: Omit<UserInvite, 'id' | 'createdAt'>): Promise<UserInvite> {
    try {
      const response = await api.post(`${this.baseUrl}/invites`, invite)
      return response.data
    } catch (error) {
      console.error('Failed to send user invite:', error)
      throw error
    }
  }

  /**
   * Get user invites
   */
  async getUserInvites(): Promise<UserInvite[]> {
    try {
      const response = await api.get(`${this.baseUrl}/invites`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user invites:', error)
      throw error
    }
  }

  /**
   * Accept user invite
   */
  async acceptInvite(inviteId: string): Promise<UserProfile> {
    try {
      const response = await api.post(`${this.baseUrl}/invites/${inviteId}/accept`)
      return response.data
    } catch (error) {
      console.error('Failed to accept invite:', error)
      throw error
    }
  }

  /**
   * Decline user invite
   */
  async declineInvite(inviteId: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/invites/${inviteId}/decline`)
    } catch (error) {
      console.error('Failed to decline invite:', error)
      throw error
    }
  }

  /**
   * Report user
   */
  async reportUser(
    report: Omit<UserReport, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserReport> {
    try {
      const response = await api.post(`${this.baseUrl}/reports`, report)
      return response.data
    } catch (error) {
      console.error('Failed to report user:', error)
      throw error
    }
  }

  /**
   * Block user
   */
  async blockUser(block: Omit<UserBlock, 'id' | 'createdAt'>): Promise<UserBlock> {
    try {
      const response = await api.post(`${this.baseUrl}/blocks`, block)
      return response.data
    } catch (error) {
      console.error('Failed to block user:', error)
      throw error
    }
  }

  /**
   * Unblock user
   */
  async unblockUser(blockedUserId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/blocks/${blockedUserId}`)
    } catch (error) {
      console.error('Failed to unblock user:', error)
      throw error
    }
  }

  /**
   * Mute user
   */
  async muteUser(mute: Omit<UserMute, 'id' | 'createdAt'>): Promise<UserMute> {
    try {
      const response = await api.post(`${this.baseUrl}/mutes`, mute)
      return response.data
    } catch (error) {
      console.error('Failed to mute user:', error)
      throw error
    }
  }

  /**
   * Unmute user
   */
  async unmuteUser(mutedUserId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/mutes/${mutedUserId}`)
    } catch (error) {
      console.error('Failed to unmute user:', error)
      throw error
    }
  }

  /**
   * Follow user
   */
  async followUser(follow: Omit<UserFollow, 'id' | 'createdAt'>): Promise<UserFollow> {
    try {
      const response = await api.post(`${this.baseUrl}/follows`, follow)
      return response.data
    } catch (error) {
      console.error('Failed to follow user:', error)
      throw error
    }
  }

  /**
   * Unfollow user
   */
  async unfollowUser(followingId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/follows/${followingId}`)
    } catch (error) {
      console.error('Failed to unfollow user:', error)
      throw error
    }
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(
    friend: Omit<UserFriend, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserFriend> {
    try {
      const response = await api.post(`${this.baseUrl}/friends`, friend)
      return response.data
    } catch (error) {
      console.error('Failed to send friend request:', error)
      throw error
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(friendId: string): Promise<UserFriend> {
    try {
      const response = await api.patch(`${this.baseUrl}/friends/${friendId}/accept`)
      return response.data
    } catch (error) {
      console.error('Failed to accept friend request:', error)
      throw error
    }
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest(friendId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/friends/${friendId}/decline`)
    } catch (error) {
      console.error('Failed to decline friend request:', error)
      throw error
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(friendId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/friends/${friendId}`)
    } catch (error) {
      console.error('Failed to remove friend:', error)
      throw error
    }
  }

  /**
   * Get user's friends
   */
  async getUserFriends(userId: string): Promise<UserProfile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/friends`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user friends:', error)
      throw error
    }
  }

  /**
   * Get user's followers
   */
  async getUserFollowers(userId: string): Promise<UserProfile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/followers`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user followers:', error)
      throw error
    }
  }

  /**
   * Get user's following
   */
  async getUserFollowing(userId: string): Promise<UserProfile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${userId}/following`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user following:', error)
      throw error
    }
  }

  /**
   * Get online users
   */
  async getOnlineUsers(limit = 50): Promise<UserProfile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/online`, {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch online users:', error)
      throw error
    }
  }

  /**
   * Get recently active users
   */
  async getRecentlyActiveUsers(limit = 50): Promise<UserProfile[]> {
    try {
      const response = await api.get(`${this.baseUrl}/recent`, {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch recently active users:', error)
      throw error
    }
  }
}

export const userService = new UserService()
export default userService
