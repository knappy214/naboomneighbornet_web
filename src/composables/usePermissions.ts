import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/hub/user'
import type { Permission, UserRole } from '@/types/user'

export function usePermissions() {
  const userStore = useUserStore()

  // Reactive state
  const permissionChecks = ref<Map<string, boolean>>(new Map())

  // Computed properties
  const currentUser = computed(() => userStore.currentUser)
  const userRole = computed(() => userStore.userRole)
  const userPermissions = computed(() => userStore.userPermissions)
  const isAuthenticated = computed(() => userStore.isAuthenticated)

  // Permission checking functions
  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated.value) return false
    return userPermissions.value.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!isAuthenticated.value) return false
    return permissions.some((permission) => userPermissions.value.includes(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!isAuthenticated.value) return false
    return permissions.every((permission) => userPermissions.value.includes(permission))
  }

  const hasRole = (role: UserRole): boolean => {
    if (!isAuthenticated.value) return false
    return userRole.value === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!isAuthenticated.value) return false
    return roles.includes(userRole.value)
  }

  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!isAuthenticated.value) return false
    return roles.every((role) => userRole.value === role)
  }

  // Role-based permission checks
  const canManageUsers = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canManageRoles = computed(() => {
    return hasPermission('manage_roles') || hasRole('admin')
  })

  const canAccessAdminPanel = computed(() => {
    return hasPermission('access_admin_panel') || hasRole('admin')
  })

  const canModerateContent = computed(() => {
    return hasPermission('moderate_content') || hasAnyRole(['admin', 'moderator'])
  })

  const canCreateEvents = computed(() => {
    return hasPermission('create_events') || hasAnyRole(['admin', 'moderator', 'member'])
  })

  const canManageEvents = computed(() => {
    return hasPermission('manage_events') || hasAnyRole(['admin', 'moderator'])
  })

  const canCreateChannels = computed(() => {
    return hasPermission('create_channels') || hasAnyRole(['admin', 'moderator', 'member'])
  })

  const canManageChannels = computed(() => {
    return hasPermission('manage_channels') || hasAnyRole(['admin', 'moderator'])
  })

  const canViewAnalytics = computed(() => {
    return hasPermission('view_analytics') || hasAnyRole(['admin', 'moderator'])
  })

  const canDeleteMessages = computed(() => {
    return hasPermission('delete_messages') || hasAnyRole(['admin', 'moderator'])
  })

  const canManageUserProfiles = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canViewUserActivity = computed(() => {
    return hasPermission('view_analytics') || hasAnyRole(['admin', 'moderator'])
  })

  const canManageUserRoles = computed(() => {
    return hasPermission('manage_roles') || hasRole('admin')
  })

  const canGrantPermissions = computed(() => {
    return hasPermission('manage_roles') || hasRole('admin')
  })

  const canRevokePermissions = computed(() => {
    return hasPermission('manage_roles') || hasRole('admin')
  })

  const canSuspendUsers = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canBanUsers = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canViewUserReports = computed(() => {
    return hasPermission('moderate_content') || hasAnyRole(['admin', 'moderator'])
  })

  const canResolveUserReports = computed(() => {
    return hasPermission('moderate_content') || hasAnyRole(['admin', 'moderator'])
  })

  const canViewUserSessions = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canTerminateUserSessions = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canViewUserInvites = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canSendUserInvites = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  const canManageUserInvites = computed(() => {
    return hasPermission('manage_users') || hasRole('admin')
  })

  // Permission checking with caching
  const checkPermission = async (permission: Permission): Promise<boolean> => {
    const cacheKey = `permission_${permission}`

    if (permissionChecks.value.has(cacheKey)) {
      return permissionChecks.value.get(cacheKey)!
    }

    try {
      const result = await userStore.checkPermission(currentUser.value!.id, permission)
      const hasPermission = result.hasPermission
      permissionChecks.value.set(cacheKey, hasPermission)
      return hasPermission
    } catch (error) {
      console.error('Failed to check permission:', error)
      return false
    }
  }

  // Clear permission cache
  const clearPermissionCache = () => {
    permissionChecks.value.clear()
  }

  // Check if user can perform action on another user
  const canPerformActionOnUser = (targetUserId: string, action: string): boolean => {
    if (!isAuthenticated.value) return false
    if (currentUser.value!.id === targetUserId) return true // Can always perform actions on self

    switch (action) {
      case 'view_profile':
        return true // Everyone can view profiles
      case 'edit_profile':
        return hasRole('admin') || currentUser.value!.id === targetUserId
      case 'delete_profile':
        return hasRole('admin')
      case 'change_role':
        return hasRole('admin')
      case 'grant_permission':
        return hasRole('admin')
      case 'revoke_permission':
        return hasRole('admin')
      case 'suspend_user':
        return hasRole('admin')
      case 'ban_user':
        return hasRole('admin')
      case 'view_sessions':
        return hasRole('admin')
      case 'terminate_sessions':
        return hasRole('admin')
      case 'view_activity':
        return hasAnyRole(['admin', 'moderator'])
      case 'view_reports':
        return hasAnyRole(['admin', 'moderator'])
      case 'send_message':
        return true // Everyone can send messages
      case 'block_user':
        return true // Everyone can block users
      case 'report_user':
        return true // Everyone can report users
      case 'follow_user':
        return true // Everyone can follow users
      case 'send_friend_request':
        return true // Everyone can send friend requests
      default:
        return false
    }
  }

  // Check if user can access resource
  const canAccessResource = (resource: string, action: string): boolean => {
    if (!isAuthenticated.value) return false

    switch (resource) {
      case 'admin_panel':
        return canAccessAdminPanel.value
      case 'user_management':
        return canManageUsers.value
      case 'role_management':
        return canManageRoles.value
      case 'content_moderation':
        return canModerateContent.value
      case 'analytics':
        return canViewAnalytics.value
      case 'event_management':
        return canManageEvents.value
      case 'channel_management':
        return canManageChannels.value
      case 'user_profiles':
        return action === 'view' || canManageUserProfiles.value
      case 'user_activity':
        return canViewUserActivity.value
      case 'user_sessions':
        return canViewUserSessions.value
      case 'user_invites':
        return canViewUserInvites.value
      case 'user_reports':
        return canViewUserReports.value
      default:
        return false
    }
  }

  // Check if user can view specific user information
  const canViewUserInfo = (targetUserId: string, infoType: string): boolean => {
    if (!isAuthenticated.value) return false
    if (currentUser.value!.id === targetUserId) return true // Can always view own info

    switch (infoType) {
      case 'email':
        return hasRole('admin') || hasPermission('manage_users')
      case 'phone':
        return hasRole('admin') || hasPermission('manage_users')
      case 'location':
        return true // Public information
      case 'bio':
        return true // Public information
      case 'social_links':
        return true // Public information
      case 'activity_history':
        return hasAnyRole(['admin', 'moderator'])
      case 'online_status':
        return true // Public information
      case 'last_seen':
        return true // Public information
      case 'sessions':
        return hasRole('admin')
      case 'permissions':
        return hasRole('admin')
      case 'role':
        return true // Public information
      case 'stats':
        return true // Public information
      case 'badges':
        return true // Public information
      default:
        return false
    }
  }

  // Check if user can edit specific user information
  const canEditUserInfo = (targetUserId: string, infoType: string): boolean => {
    if (!isAuthenticated.value) return false
    if (currentUser.value!.id === targetUserId) return true // Can always edit own info

    switch (infoType) {
      case 'display_name':
        return hasRole('admin') || hasPermission('manage_users')
      case 'bio':
        return hasRole('admin') || hasPermission('manage_users')
      case 'location':
        return hasRole('admin') || hasPermission('manage_users')
      case 'phone':
        return hasRole('admin') || hasPermission('manage_users')
      case 'website':
        return hasRole('admin') || hasPermission('manage_users')
      case 'social_links':
        return hasRole('admin') || hasPermission('manage_users')
      case 'preferences':
        return hasRole('admin') || hasPermission('manage_users')
      case 'visibility':
        return hasRole('admin') || hasPermission('manage_users')
      case 'notification_settings':
        return hasRole('admin') || hasPermission('manage_users')
      case 'role':
        return hasRole('admin')
      case 'permissions':
        return hasRole('admin')
      case 'status':
        return hasRole('admin')
      default:
        return false
    }
  }

  // Get user's effective permissions (including role-based permissions)
  const getEffectivePermissions = (): Permission[] => {
    if (!isAuthenticated.value) return []

    const roleBasedPermissions: Record<UserRole, Permission[]> = {
      admin: [
        'create_channels',
        'manage_channels',
        'delete_messages',
        'manage_users',
        'manage_roles',
        'view_analytics',
        'create_events',
        'manage_events',
        'moderate_content',
        'access_admin_panel',
      ],
      moderator: [
        'create_channels',
        'manage_channels',
        'delete_messages',
        'view_analytics',
        'create_events',
        'manage_events',
        'moderate_content',
      ],
      member: ['create_channels', 'create_events'],
      guest: [],
      banned: [],
    }

    const rolePermissions = roleBasedPermissions[userRole.value] || []
    const explicitPermissions = userPermissions.value

    // Combine role-based and explicit permissions, removing duplicates
    return [...new Set([...rolePermissions, ...explicitPermissions])]
  }

  // Check if user has any of the required permissions for an action
  const hasRequiredPermissions = (action: string, requiredPermissions: Permission[]): boolean => {
    if (!isAuthenticated.value) return false
    return requiredPermissions.some((permission) => hasPermission(permission))
  }

  // Get permission requirements for an action
  const getPermissionRequirements = (action: string): Permission[] => {
    const requirements: Record<string, Permission[]> = {
      create_channel: ['create_channels'],
      manage_channel: ['manage_channels'],
      delete_message: ['delete_messages'],
      manage_user: ['manage_users'],
      manage_role: ['manage_roles'],
      view_analytics: ['view_analytics'],
      create_event: ['create_events'],
      manage_event: ['manage_events'],
      moderate_content: ['moderate_content'],
      access_admin: ['access_admin_panel'],
    }

    return requirements[action] || []
  }

  return {
    // State
    currentUser,
    userRole,
    userPermissions,
    isAuthenticated,
    permissionChecks,

    // Basic permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Computed permission checks
    canManageUsers,
    canManageRoles,
    canAccessAdminPanel,
    canModerateContent,
    canCreateEvents,
    canManageEvents,
    canCreateChannels,
    canManageChannels,
    canViewAnalytics,
    canDeleteMessages,
    canManageUserProfiles,
    canViewUserActivity,
    canManageUserRoles,
    canGrantPermissions,
    canRevokePermissions,
    canSuspendUsers,
    canBanUsers,
    canViewUserReports,
    canResolveUserReports,
    canViewUserSessions,
    canTerminateUserSessions,
    canViewUserInvites,
    canSendUserInvites,
    canManageUserInvites,

    // Advanced permission checks
    checkPermission,
    clearPermissionCache,
    canPerformActionOnUser,
    canAccessResource,
    canViewUserInfo,
    canEditUserInfo,
    getEffectivePermissions,
    hasRequiredPermissions,
    getPermissionRequirements,
  }
}
