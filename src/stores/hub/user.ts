// src/stores/hub/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/userService'
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

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const currentUser = ref<UserProfile | null>(null)
    const users = ref<UserProfile[]>([])
    const userStats = ref<UserStats | null>(null)
    const userActivity = ref<UserActivity[]>([])
    const userBadges = ref<UserBadge[]>([])
    const rolesAndPermissions = ref<RolePermission[]>([])
    const userSessions = ref<UserSession[]>([])
    const userInvites = ref<UserInvite[]>([])
    const userFriends = ref<UserProfile[]>([])
    const userFollowers = ref<UserProfile[]>([])
    const userFollowing = ref<UserProfile[]>([])
    const onlineUsers = ref<UserProfile[]>([])
    const recentlyActiveUsers = ref<UserProfile[]>([])
    const searchResults = ref<UserSearchResult | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const isAuthenticated = computed(() => currentUser.value !== null)
    const userRole = computed(() => currentUser.value?.role || 'guest')
    const userPermissions = computed(() => currentUser.value?.permissions || [])
    const isOnline = computed(() => currentUser.value?.isOnline || false)
    const userDisplayName = computed(() => currentUser.value?.displayName || 'Guest')
    const userAvatar = computed(() => currentUser.value?.avatar || '')
    const userReputation = computed(() => currentUser.value?.stats.reputationScore || 0)
    const userBadgeCount = computed(() => currentUser.value?.stats.badges.length || 0)

    const hasPermission = computed(() => (permission: Permission) => {
      return userPermissions.value.includes(permission)
    })

    const hasRole = computed(() => (role: UserRole) => {
      return userRole.value === role
    })

    const hasAnyRole = computed(() => (roles: UserRole[]) => {
      return roles.includes(userRole.value)
    })

    const canManageUsers = computed(() => {
      return hasPermission.value('manage_users') || hasRole.value('admin')
    })

    const canManageRoles = computed(() => {
      return hasPermission.value('manage_roles') || hasRole.value('admin')
    })

    const canAccessAdminPanel = computed(() => {
      return hasPermission.value('access_admin_panel') || hasRole.value('admin')
    })

    const canModerateContent = computed(() => {
      return hasPermission.value('moderate_content') || hasAnyRole.value(['admin', 'moderator'])
    })

    const canCreateEvents = computed(() => {
      return (
        hasPermission.value('create_events') || hasAnyRole.value(['admin', 'moderator', 'member'])
      )
    })

    const canManageEvents = computed(() => {
      return hasPermission.value('manage_events') || hasAnyRole.value(['admin', 'moderator'])
    })

    const canCreateChannels = computed(() => {
      return (
        hasPermission.value('create_channels') || hasAnyRole.value(['admin', 'moderator', 'member'])
      )
    })

    const canManageChannels = computed(() => {
      return hasPermission.value('manage_channels') || hasAnyRole.value(['admin', 'moderator'])
    })

    const canViewAnalytics = computed(() => {
      return hasPermission.value('view_analytics') || hasAnyRole.value(['admin', 'moderator'])
    })

    // Actions
    async function fetchCurrentUser() {
      loading.value = true
      error.value = null

      try {
        currentUser.value = await userService.getCurrentUserProfile()
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch current user'
        console.error('Error fetching current user:', err)
      } finally {
        loading.value = false
      }
    }

    async function fetchUserProfile(userId: string) {
      loading.value = true
      error.value = null

      try {
        const user = await userService.getUserProfile(userId)

        // Update user in users array if it exists
        const index = users.value.findIndex((u) => u.id === userId)
        if (index !== -1) {
          users.value[index] = user
        } else {
          users.value.push(user)
        }

        return user
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch user profile'
        console.error('Error fetching user profile:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function createUserProfile(payload: CreateUserProfilePayload) {
      loading.value = true
      error.value = null

      try {
        const user = await userService.createUserProfile(payload)
        users.value.push(user)
        return user
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to create user profile'
        console.error('Error creating user profile:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function updateUserProfile(userId: string, payload: UpdateUserProfilePayload) {
      loading.value = true
      error.value = null

      try {
        const updatedUser = await userService.updateUserProfile(userId, payload)

        // Update user in users array
        const index = users.value.findIndex((u) => u.id === userId)
        if (index !== -1) {
          users.value[index] = updatedUser
        }

        // Update current user if it's the same
        if (currentUser.value?.id === userId) {
          currentUser.value = updatedUser
        }

        return updatedUser
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to update user profile'
        console.error('Error updating user profile:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function deleteUserProfile(userId: string) {
      loading.value = true
      error.value = null

      try {
        await userService.deleteUserProfile(userId)

        // Remove user from users array
        users.value = users.value.filter((u) => u.id !== userId)

        // Clear current user if it's the same
        if (currentUser.value?.id === userId) {
          currentUser.value = null
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to delete user profile'
        console.error('Error deleting user profile:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function searchUsers(query: UserSearchQuery) {
      loading.value = true
      error.value = null

      try {
        const result = await userService.searchUsers(query)
        searchResults.value = result
        return result
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to search users'
        console.error('Error searching users:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchUserActivity(userId: string, limit = 50, offset = 0) {
      loading.value = true
      error.value = null

      try {
        const activity = await userService.getUserActivity(userId, limit, offset)
        userActivity.value = activity
        return activity
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch user activity'
        console.error('Error fetching user activity:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchUserStats(userId: string) {
      loading.value = true
      error.value = null

      try {
        const stats = await userService.getUserStats(userId)
        userStats.value = stats
        return stats
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch user stats'
        console.error('Error fetching user stats:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchUserBadges(userId: string) {
      loading.value = true
      error.value = null

      try {
        const badges = await userService.getUserBadges(userId)
        userBadges.value = badges
        return badges
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch user badges'
        console.error('Error fetching user badges:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchRolesAndPermissions() {
      loading.value = true
      error.value = null

      try {
        const roles = await userService.getRolesAndPermissions()
        rolesAndPermissions.value = roles
        return roles
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch roles and permissions'
        console.error('Error fetching roles and permissions:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function checkPermission(userId: string, permission: Permission) {
      try {
        const result = await userService.checkPermission(userId, permission)
        return result
      } catch (err) {
        console.error('Error checking permission:', err)
        throw err
      }
    }

    async function updateUserRole(userId: string, role: UserRole) {
      loading.value = true
      error.value = null

      try {
        const updatedUser = await userService.updateUserRole(userId, role)

        // Update user in users array
        const index = users.value.findIndex((u) => u.id === userId)
        if (index !== -1) {
          users.value[index] = updatedUser
        }

        // Update current user if it's the same
        if (currentUser.value?.id === userId) {
          currentUser.value = updatedUser
        }

        return updatedUser
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to update user role'
        console.error('Error updating user role:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function grantPermission(userId: string, permission: Permission) {
      try {
        await userService.grantPermission(userId, permission)

        // Update user permissions in local state
        const user = users.value.find((u) => u.id === userId)
        if (user && !user.permissions.includes(permission)) {
          user.permissions.push(permission)
        }

        if (
          currentUser.value?.id === userId &&
          !currentUser.value.permissions.includes(permission)
        ) {
          currentUser.value.permissions.push(permission)
        }
      } catch (err) {
        console.error('Error granting permission:', err)
        throw err
      }
    }

    async function revokePermission(userId: string, permission: Permission) {
      try {
        await userService.revokePermission(userId, permission)

        // Update user permissions in local state
        const user = users.value.find((u) => u.id === userId)
        if (user) {
          user.permissions = user.permissions.filter((p) => p !== permission)
        }

        if (currentUser.value?.id === userId) {
          currentUser.value.permissions = currentUser.value.permissions.filter(
            (p) => p !== permission,
          )
        }
      } catch (err) {
        console.error('Error revoking permission:', err)
        throw err
      }
    }

    async function fetchUserSessions(userId: string) {
      loading.value = true
      error.value = null

      try {
        const sessions = await userService.getUserSessions(userId)
        userSessions.value = sessions
        return sessions
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch user sessions'
        console.error('Error fetching user sessions:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function terminateSession(userId: string, sessionId: string) {
      try {
        await userService.terminateSession(userId, sessionId)
        userSessions.value = userSessions.value.filter((s) => s.id !== sessionId)
      } catch (err) {
        console.error('Error terminating session:', err)
        throw err
      }
    }

    async function terminateAllSessions(userId: string) {
      try {
        await userService.terminateAllSessions(userId)
        userSessions.value = []
      } catch (err) {
        console.error('Error terminating all sessions:', err)
        throw err
      }
    }

    async function uploadAvatar(userId: string, file: File) {
      try {
        const result = await userService.uploadAvatar(userId, file)

        // Update user avatar in local state
        const user = users.value.find((u) => u.id === userId)
        if (user) {
          user.avatar = result.avatarUrl
        }

        if (currentUser.value?.id === userId) {
          currentUser.value.avatar = result.avatarUrl
        }

        return result
      } catch (err) {
        console.error('Error uploading avatar:', err)
        throw err
      }
    }

    async function deleteAvatar(userId: string) {
      try {
        await userService.deleteAvatar(userId)

        // Update user avatar in local state
        const user = users.value.find((u) => u.id === userId)
        if (user) {
          user.avatar = undefined
        }

        if (currentUser.value?.id === userId) {
          currentUser.value.avatar = undefined
        }
      } catch (err) {
        console.error('Error deleting avatar:', err)
        throw err
      }
    }

    async function fetchOnlineUsers(limit = 50) {
      try {
        const users = await userService.getOnlineUsers(limit)
        onlineUsers.value = users
        return users
      } catch (err) {
        console.error('Error fetching online users:', err)
        throw err
      }
    }

    async function fetchRecentlyActiveUsers(limit = 50) {
      try {
        const users = await userService.getRecentlyActiveUsers(limit)
        recentlyActiveUsers.value = users
        return users
      } catch (err) {
        console.error('Error fetching recently active users:', err)
        throw err
      }
    }

    async function fetchUserFriends(userId: string) {
      try {
        const friends = await userService.getUserFriends(userId)
        userFriends.value = friends
        return friends
      } catch (err) {
        console.error('Error fetching user friends:', err)
        throw err
      }
    }

    async function fetchUserFollowers(userId: string) {
      try {
        const followers = await userService.getUserFollowers(userId)
        userFollowers.value = followers
        return followers
      } catch (err) {
        console.error('Error fetching user followers:', err)
        throw err
      }
    }

    async function fetchUserFollowing(userId: string) {
      try {
        const following = await userService.getUserFollowing(userId)
        userFollowing.value = following
        return following
      } catch (err) {
        console.error('Error fetching user following:', err)
        throw err
      }
    }

    function clearError() {
      error.value = null
    }

    function setCurrentUser(user: UserProfile | null) {
      currentUser.value = user
    }

    function addUser(user: UserProfile) {
      const index = users.value.findIndex((u) => u.id === user.id)
      if (index !== -1) {
        users.value[index] = user
      } else {
        users.value.push(user)
      }
    }

    function removeUser(userId: string) {
      users.value = users.value.filter((u) => u.id !== userId)
    }

    function updateUser(user: UserProfile) {
      const index = users.value.findIndex((u) => u.id === user.id)
      if (index !== -1) {
        users.value[index] = user
      }
    }

    // Reset store
    function $reset() {
      currentUser.value = null
      users.value = []
      userStats.value = null
      userActivity.value = []
      userBadges.value = []
      rolesAndPermissions.value = []
      userSessions.value = []
      userInvites.value = []
      userFriends.value = []
      userFollowers.value = []
      userFollowing.value = []
      onlineUsers.value = []
      recentlyActiveUsers.value = []
      searchResults.value = null
      loading.value = false
      error.value = null
    }

    return {
      // State
      currentUser,
      users,
      userStats,
      userActivity,
      userBadges,
      rolesAndPermissions,
      userSessions,
      userInvites,
      userFriends,
      userFollowers,
      userFollowing,
      onlineUsers,
      recentlyActiveUsers,
      searchResults,
      loading,
      error,

      // Getters
      isAuthenticated,
      userRole,
      userPermissions,
      isOnline,
      userDisplayName,
      userAvatar,
      userReputation,
      userBadgeCount,
      hasPermission,
      hasRole,
      hasAnyRole,
      canManageUsers,
      canManageRoles,
      canAccessAdminPanel,
      canModerateContent,
      canCreateEvents,
      canManageEvents,
      canCreateChannels,
      canManageChannels,
      canViewAnalytics,

      // Actions
      fetchCurrentUser,
      fetchUserProfile,
      createUserProfile,
      updateUserProfile,
      deleteUserProfile,
      searchUsers,
      fetchUserActivity,
      fetchUserStats,
      fetchUserBadges,
      fetchRolesAndPermissions,
      checkPermission,
      updateUserRole,
      grantPermission,
      revokePermission,
      fetchUserSessions,
      terminateSession,
      terminateAllSessions,
      uploadAvatar,
      deleteAvatar,
      fetchOnlineUsers,
      fetchRecentlyActiveUsers,
      fetchUserFriends,
      fetchUserFollowers,
      fetchUserFollowing,
      clearError,
      setCurrentUser,
      addUser,
      removeUser,
      updateUser,
      $reset,
    }
  },
  {
    persist: {
      key: 'user-store',
      storage: localStorage,
      paths: ['currentUser', 'users', 'userStats', 'userBadges'],
    },
  },
)
