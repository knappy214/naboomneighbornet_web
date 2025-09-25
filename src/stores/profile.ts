import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import { getAbsoluteAvatarUrl, getAbsoluteAvatarUrls } from '@/utils/avatarUrl'

// Helper function to safely extract error message from unknown error
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const errorObj = err as Record<string, unknown>

    // Check for axios error response
    if (errorObj.response && typeof errorObj.response === 'object') {
      const response = errorObj.response as Record<string, unknown>
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>
        if (typeof data.detail === 'string') {
          return data.detail
        }
      }
    }

    // Check for direct message property
    if (typeof errorObj.message === 'string') {
      return errorObj.message
    }
  }

  return fallback
}

// Types based on the API documentation
export interface UserProfile {
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
  last_login: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  allergies?: string
  medical_conditions?: string
  current_medications?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  preferred_language: string
  timezone: string
  email_notifications: boolean
  sms_notifications: boolean
  mfa_enabled: boolean
  created_at: string
  updated_at: string
  avatar?: {
    id: number
    title: string
    url: string
    width: number
    height: number
  }
  avatar_url?: string
  avatar_small?: string
  avatar_medium?: string
  avatar_large?: string
  group_memberships: GroupMembership[]
}

export interface GroupMembership {
  id: number
  group: {
    id: number
    name: string
    description: string
  }
  role: {
    id: number
    name: string
    description: string
  }
  joined_at: string
  is_active: boolean
  notes: string
}

export interface UserGroup {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: number
  name: string
  description: string
  permissions: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProfileStats {
  profile_completion_percentage: number
  completed_fields: number
  total_fields: number
  group_memberships_count: number
  active_groups: string[]
  profile_created_at: string
  profile_updated_at: string
  user_joined_at: string
  last_login: string
}

export interface AvatarInfo {
  has_avatar: boolean
  avatar?: {
    id: number
    title: string
    url: string
    width: number
    height: number
    file_size: number
    created_at: string
    urls: {
      original: string
      small: string
      medium: string
      large: string
    }
  }
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<UserProfile | null>(null)
  const groups = ref<UserGroup[]>([])
  const roles = ref<UserRole[]>([])
  const stats = ref<ProfileStats | null>(null)
  const avatarInfo = ref<AvatarInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isProfileLoaded = computed(() => profile.value !== null)
  const profileCompletion = computed(() => stats.value?.profile_completion_percentage || 0)
  const activeGroups = computed(
    () => profile.value?.group_memberships?.filter((m) => m.is_active) || [],
  )
  const hasAvatar = computed(() => avatarInfo.value?.has_avatar || false)

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Profile management
  const fetchProfile = async () => {
    try {
      setLoading(true)
      clearError()
      console.log('Fetching profile from:', api.defaults.baseURL + '/user-profiles/')
      // Use the correct endpoint pattern for the current API
      const response = await api.get('/user-profiles/?fields=stats,avatar_info')
      console.log('Profile response:', response.data)

      // Handle Wagtail API v2 response format
      if (response.data.items && response.data.items.length > 0) {
        const profileData = response.data.items[0]
        console.log('Profile data structure:', profileData)
        profile.value = profileData
        // Extract stats and avatar info from custom fields
        if (profileData.stats) {
          stats.value = profileData.stats
          console.log('Stats data:', profileData.stats)
          // Extract group information from stats
          if (profileData.stats.active_groups) {
            console.log('Active groups from stats:', profileData.stats.active_groups)
            groups.value = profileData.stats.active_groups.map(
              (groupName: string, index: number) => ({
                id: index + 1,
                name: groupName,
                description: `${groupName} group`,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }),
            )
          }
        }
        if (profileData.avatar_info) {
          // Convert avatar URLs to absolute URLs
          avatarInfo.value = {
            ...profileData.avatar_info,
            avatar: profileData.avatar_info.avatar
              ? getAbsoluteAvatarUrls(profileData.avatar_info.avatar)
              : undefined,
          }
          // Set avatar_url on profile for easy access
          if (profile.value) {
            profile.value.avatar_url = getAbsoluteAvatarUrl(profileData.avatar_info.avatar?.url)
          }
        }
      } else {
        // Fallback for single item response
        profile.value = response.data
        if (response.data.stats) {
          stats.value = response.data.stats
          // Extract group information from stats
          if (response.data.stats.active_groups) {
            groups.value = response.data.stats.active_groups.map(
              (groupName: string, index: number) => ({
                id: index + 1,
                name: groupName,
                description: `${groupName} group`,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }),
            )
          }
        }
        if (response.data.avatar_info) {
          // Convert avatar URLs to absolute URLs
          avatarInfo.value = {
            ...response.data.avatar_info,
            avatar: response.data.avatar_info.avatar
              ? getAbsoluteAvatarUrls(response.data.avatar_info.avatar)
              : undefined,
          }
          // Set avatar_url on profile for easy access
          if (profile.value) {
            profile.value.avatar_url = getAbsoluteAvatarUrl(response.data.avatar_info.avatar?.url)
          }
        }
      }

      return profile.value
    } catch (err: unknown) {
      console.error('Profile fetch error:', err)
      const errorMessage = getErrorMessage(err, 'Failed to fetch profile')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true)
      clearError()
      // Try PUT method first, then fallback to POST
      let response
      try {
        response = await api.put('/user-profiles/', data)
      } catch (putError: unknown) {
        if (putError && typeof putError === 'object' && 'response' in putError) {
          const errorObj = putError as { response?: { status?: number } }
          if (errorObj.response?.status === 405) {
            // If PUT is not allowed, try POST
            response = await api.post('/user-profiles/update/', data)
          } else {
            throw putError
          }
        } else {
          throw putError
        }
      }
      profile.value = response.data
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to update profile')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateBasicInfo = async (data: {
    first_name?: string
    last_name?: string
    email?: string
  }) => {
    try {
      setLoading(true)
      clearError()
      // Try PUT method first, then fallback to POST
      let response
      try {
        response = await api.put('/user-profiles/', data)
      } catch (putError: unknown) {
        if (putError && typeof putError === 'object' && 'response' in putError) {
          const errorObj = putError as { response?: { status?: number } }
          if (errorObj.response?.status === 405) {
            // If PUT is not allowed, try POST
            response = await api.post('/user-profiles/update/', data)
          } else {
            throw putError
          }
        } else {
          throw putError
        }
      }
      if (profile.value) {
        profile.value.first_name = response.data.first_name
        profile.value.last_name = response.data.last_name
        profile.value.email = response.data.email
      }
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to update basic info')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (data: {
    current_password: string
    new_password: string
    confirm_password: string
  }) => {
    try {
      setLoading(true)
      clearError()
      const response = await api.post('/user-profile/change-password/', data)
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to change password')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Stats are now included in fetchProfile via ?fields=stats parameter
  const fetchStats = async () => {
    // This method is now handled by fetchProfile with ?fields=stats
    console.log('Stats are now fetched as part of profile data via ?fields=stats parameter')
    return stats.value
  }

  // Group management
  const fetchGroups = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-groups/')
      console.log('Groups response:', response.data)
      // Handle Wagtail API v2 format - extract items array
      groups.value = response.data.items || response.data
      return groups.value
    } catch (err: unknown) {
      console.warn('Groups endpoint not available:', err)
      // Set empty groups array as fallback
      groups.value = []
      // Don't set error or throw - this is optional data
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-roles/')
      console.log('Roles response:', response.data)
      // Handle Wagtail API v2 format - extract items array
      roles.value = response.data.items || response.data
      return roles.value
    } catch (err: unknown) {
      console.warn('Roles endpoint not available:', err)
      // Set empty roles array as fallback
      roles.value = []
      // Don't set error or throw - this is optional data
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupMemberships = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-profile/group-memberships/')
      console.log('Group memberships response:', response.data)
      // Update profile group memberships
      if (profile.value) {
        profile.value.group_memberships = response.data
      }
      return response.data
    } catch (err: unknown) {
      console.warn('Group memberships endpoint not available:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createGroupMembership = async (data: { group_id: number; role_id: number }) => {
    try {
      setLoading(true)
      clearError()
      const response = await api.post('/user-profile/group-memberships/', data)
      // Refresh group memberships
      await fetchGroupMemberships()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to create group membership')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateGroupMembership = async (id: number, data: Partial<GroupMembership>) => {
    try {
      setLoading(true)
      clearError()
      const response = await api.patch(`/user-profile/group-memberships/${id}/`, data)
      // Refresh group memberships
      await fetchGroupMemberships()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to update group membership')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteGroupMembership = async (id: number) => {
    try {
      setLoading(true)
      clearError()
      const response = await api.delete(`/user-profile/group-memberships/${id}/`)
      // Refresh group memberships
      await fetchGroupMemberships()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to delete group membership')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const joinGroup = async (data: { group_id: number; role_id: number }) => {
    try {
      setLoading(true)
      clearError()
      // Use the correct endpoint for joining groups
      const response = await api.post('/user-profile/join-group/', data)
      // Refresh profile to get updated group memberships
      await fetchProfile()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to join group')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const leaveGroup = async (data: { group_id: number }) => {
    try {
      setLoading(true)
      clearError()
      // Use the correct endpoint for leaving groups
      const response = await api.post('/user-profile/leave-group/', data)
      // Refresh profile to get updated group memberships
      await fetchProfile()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to leave group')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Avatar management
  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true)
      clearError()
      const formData = new FormData()
      formData.append('image', file)

      // Use Wagtail API v2 pattern for avatar upload
      const response = await api.post('/user-profiles/avatar/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Refresh profile to get updated avatar info
      await fetchProfile()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to upload avatar')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAvatar = async () => {
    try {
      setLoading(true)
      clearError()
      // Use Wagtail API v2 pattern for avatar deletion
      const response = await api.delete('/user-profiles/avatar/delete/')

      // Refresh profile to get updated avatar info
      await fetchProfile()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to delete avatar')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Avatar info is now included in fetchProfile via ?fields=avatar_info parameter
  const fetchAvatarInfo = async () => {
    // This method is now handled by fetchProfile with ?fields=avatar_info
    console.log(
      'Avatar info is now fetched as part of profile data via ?fields=avatar_info parameter',
    )
    return avatarInfo.value
  }

  const setExistingAvatar = async (imageId: number) => {
    try {
      setLoading(true)
      clearError()
      // Use Wagtail API v2 pattern for setting existing avatar
      const response = await api.post('/user-profiles/avatar/set-existing/', { image_id: imageId })

      // Refresh profile to get updated avatar info
      await fetchProfile()
      return response.data
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to set existing avatar')
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Utility methods
  const reset = () => {
    profile.value = null
    groups.value = []
    roles.value = []
    stats.value = null
    avatarInfo.value = null
    loading.value = false
    error.value = null
  }

  const refreshProfile = async () => {
    // fetchProfile now includes stats and avatar_info via ?fields=stats,avatar_info
    await fetchProfile()
    // Try to fetch groups, roles, and group memberships separately, but don't fail if they're not available
    try {
      await Promise.all([fetchGroups(), fetchRoles(), fetchGroupMemberships()])
    } catch (error) {
      console.warn(
        'Groups, roles, or group memberships endpoints not available or returning errors:',
        error,
      )
      // Don't throw the error, just log it and continue
    }
  }

  return {
    // State
    profile,
    groups,
    roles,
    stats,
    avatarInfo,
    loading,
    error,

    // Getters
    isProfileLoaded,
    profileCompletion,
    activeGroups,
    hasAvatar,

    // Actions
    fetchProfile,
    updateProfile,
    updateBasicInfo,
    changePassword,
    fetchStats,
    fetchGroups,
    fetchRoles,
    fetchGroupMemberships,
    createGroupMembership,
    updateGroupMembership,
    deleteGroupMembership,
    joinGroup,
    leaveGroup,
    uploadAvatar,
    deleteAvatar,
    fetchAvatarInfo,
    setExistingAvatar,
    reset,
    refreshProfile,
    setLoading,
    setError,
    clearError,
  }
})
