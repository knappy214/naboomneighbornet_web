import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'

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
  permissions: Record<string, any>
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
      const response = await api.get('/user-profiles/')
      profile.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch profile'
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
      const response = await api.patch('/user-profiles/update/', data)
      profile.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update profile'
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
      const response = await api.patch('/user-profiles/basic-info/', data)
      if (profile.value) {
        profile.value.first_name = response.data.first_name
        profile.value.last_name = response.data.last_name
        profile.value.email = response.data.email
      }
      return response.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to update basic info'
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
      const response = await api.post('/user-profiles/change-password/', data)
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to change password'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-profiles/stats/')
      stats.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to fetch profile stats'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Group management
  const fetchGroups = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-groups/')
      groups.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch groups'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-roles/')
      roles.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch roles'
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
      const response = await api.post('/user-profiles/join-group/', data)
      // Refresh profile to get updated group memberships
      await fetchProfile()
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to join group'
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
      const response = await api.post('/user-profiles/leave-group/', data)
      // Refresh profile to get updated group memberships
      await fetchProfile()
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to leave group'
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

      const response = await api.post('/user-profiles/avatar/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      profile.value = response.data.profile
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload avatar'
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
      const response = await api.delete('/user-profiles/avatar/delete/')

      // Refresh profile to get updated avatar info
      await fetchProfile()
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete avatar'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchAvatarInfo = async () => {
    try {
      setLoading(true)
      clearError()
      const response = await api.get('/user-profiles/avatar/info/')
      avatarInfo.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to fetch avatar info'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setExistingAvatar = async (imageId: number) => {
    try {
      setLoading(true)
      clearError()
      const response = await api.post('/user-profiles/avatar/set-existing/', { image_id: imageId })

      profile.value = response.data.profile
      return response.data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || 'Failed to set existing avatar'
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
    await Promise.all([fetchProfile(), fetchStats(), fetchAvatarInfo()])
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
