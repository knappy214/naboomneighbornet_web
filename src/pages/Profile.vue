<template>
  <div class="min-h-screen bg-base-100">
    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="profileStore.loading" class="flex justify-center items-center min-h-96">
        <div class="text-center max-w-md">
          <div class="loading loading-spinner loading-lg text-primary mb-6"></div>
          <h2 class="text-2xl font-bold text-base-content mb-4">Loading your profile...</h2>
          <p class="text-base-content/70 mb-8">Please wait while we fetch your information</p>

          <!-- Profile skeleton -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="skeleton w-16 h-16 rounded-full"></div>
                <div class="space-y-2">
                  <div class="skeleton h-4 w-32"></div>
                  <div class="skeleton h-3 w-48"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="skeleton h-3 w-full"></div>
                <div class="skeleton h-3 w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="profileStore.error" class="flex justify-center items-center min-h-96">
        <div class="text-center max-w-md">
          <div class="alert alert-error shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="font-bold text-lg">Unable to load profile</h3>
              <div class="text-sm mt-1">{{ profileStore.error }}</div>
            </div>
          </div>
          <button @click="profileStore.refreshProfile()" class="btn btn-primary btn-lg mt-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profileStore.profile" class="max-w-6xl mx-auto">
        <!-- Profile Header -->
        <div class="hero bg-gradient-to-r from-primary/5 to-secondary/5 mb-8">
          <div class="hero-content">
            <div class="max-w-6xl w-full">
              <div class="card bg-base-100 shadow-xl border border-base-300">
                <div class="card-body p-8">
                  <div class="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                    <!-- Avatar Section -->
                    <div class="text-center lg:text-left">
                      <div class="avatar mb-6">
                        <div
                          class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4"
                        >
                          <img
                            v-if="profileStore.profile.avatar_url"
                            :src="profileStore.profile.avatar_url"
                            :alt="profileStore.profile.first_name"
                            class="mask mask-squircle"
                          />
                          <div
                            v-else
                            class="bg-primary text-primary-content flex items-center justify-center text-4xl font-bold mask mask-squircle"
                          >
                            {{ profileStore.profile.first_name?.charAt(0)
                            }}{{ profileStore.profile.last_name?.charAt(0) }}
                          </div>
                        </div>
                      </div>
                      <button @click="showAvatarDialog = true" class="btn btn-primary btn-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Change Avatar
                      </button>
                    </div>

                    <!-- Profile Info -->
                    <div class="flex-1">
                      <h1 class="text-4xl font-bold text-base-content mb-2">
                        {{ profileStore.profile.first_name }} {{ profileStore.profile.last_name }}
                      </h1>
                      <p class="text-lg text-base-content/70 mb-6">
                        {{ profileStore.profile.email }}
                      </p>

                      <!-- Status Badges -->
                      <div class="flex flex-wrap gap-3 mb-6">
                        <div class="badge badge-success badge-lg gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {{ profileStore.profile.is_active ? 'Active' : 'Inactive' }}
                        </div>
                        <div class="badge badge-info badge-lg gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          {{ profileStore.stats?.group_memberships_count || 0 }} Groups
                        </div>
                        <div class="badge badge-secondary badge-lg gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Member since {{ formatDate(profileStore.stats?.user_joined_at || '') }}
                        </div>
                      </div>

                      <!-- Profile Completion -->
                      <div v-if="profileStore.stats" class="mb-4">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-sm font-medium text-base-content"
                            >Profile Completion</span
                          >
                          <span class="text-sm text-base-content/70"
                            >{{ Math.round(profileStore.profileCompletion) }}%</span
                          >
                        </div>
                        <progress
                          class="progress progress-primary w-full h-3"
                          :value="profileStore.profileCompletion"
                          max="100"
                        ></progress>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Tabs -->
        <div class="tabs tabs-boxed mb-6 bg-base-200" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="['tab', activeTab === tab.key ? 'tab-active' : '']"
            class="gap-2"
            :aria-selected="activeTab === tab.key"
            :aria-controls="`tab-panel-${tab.key}`"
            role="tab"
            :tabindex="activeTab === tab.key ? 0 : -1"
          >
            <svg
              v-if="tab.key === 'personal'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <svg
              v-else-if="tab.key === 'contact'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <svg
              v-else-if="tab.key === 'emergency'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <svg
              v-else-if="tab.key === 'groups'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <svg
              v-else-if="tab.key === 'settings'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body p-8">
            <!-- Personal Information Tab -->
            <div
              v-if="activeTab === 'personal'"
              class="space-y-8"
              id="tab-panel-personal"
              role="tabpanel"
              :aria-labelledby="`tab-personal`"
            >
              <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-primary/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-base-content">Personal Information</h2>
              </div>
              <PersonalInfoTab :profile="profileStore.profile" @update="handleProfileUpdate" />
            </div>

            <!-- Contact Information Tab -->
            <div
              v-else-if="activeTab === 'contact'"
              class="space-y-8"
              id="tab-panel-contact"
              role="tabpanel"
              :aria-labelledby="`tab-contact`"
            >
              <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-info/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-info"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-base-content">Contact Information</h2>
              </div>
              <ContactInfoTab :profile="profileStore.profile" @update="handleProfileUpdate" />
            </div>

            <!-- Emergency Information Tab -->
            <div
              v-else-if="activeTab === 'emergency'"
              class="space-y-8"
              id="tab-panel-emergency"
              role="tabpanel"
              :aria-labelledby="`tab-emergency`"
            >
              <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-error/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-error"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-base-content">Emergency Information</h2>
              </div>
              <EmergencyInfoTab :profile="profileStore.profile" @update="handleProfileUpdate" />
            </div>

            <!-- Groups Tab -->
            <div
              v-else-if="activeTab === 'groups'"
              class="space-y-8"
              id="tab-panel-groups"
              role="tabpanel"
              :aria-labelledby="`tab-groups`"
            >
              <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-secondary/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-base-content">Groups & Roles</h2>
              </div>
              <GroupsTab
                :profile="profileStore.profile"
                :groups="profileStore.groups"
                :roles="profileStore.roles"
                @join-group="handleJoinGroup"
                @leave-group="handleLeaveGroup"
              />
            </div>

            <!-- Settings Tab -->
            <div
              v-else-if="activeTab === 'settings'"
              class="space-y-8"
              id="tab-panel-settings"
              role="tabpanel"
              :aria-labelledby="`tab-settings`"
            >
              <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-accent/10 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-base-content">Settings</h2>
              </div>
              <SettingsTab
                :profile="profileStore.profile"
                @update="handleProfileUpdate"
                @change-password="handleChangePassword"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Management Dialog -->
    <AvatarDialog
      v-model="showAvatarDialog"
      :avatar-info="profileStore.avatarInfo || undefined"
      @upload="handleAvatarUpload"
      @delete="handleAvatarDelete"
      @set-existing="handleSetExistingAvatar"
    />

    <!-- Change Password Dialog -->
    <ChangePasswordDialog v-model="showPasswordDialog" @change="handlePasswordChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useI18n } from 'vue-i18n'
import PersonalInfoTab from '@/components/profile/PersonalInfoTab.vue'
import ContactInfoTab from '@/components/profile/ContactInfoTab.vue'
import EmergencyInfoTab from '@/components/profile/EmergencyInfoTab.vue'
import GroupsTab from '@/components/profile/GroupsTab.vue'
import SettingsTab from '@/components/profile/SettingsTab.vue'
import AvatarDialog from '@/components/profile/AvatarDialog.vue'
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog.vue'

const { t } = useI18n()
const profileStore = useProfileStore()

// State
const activeTab = ref('personal')
const showAvatarDialog = ref(false)
const showPasswordDialog = ref(false)

// Tabs configuration
const tabs = computed(() => [
  { key: 'personal', label: 'Personal Info', icon: '👤' },
  { key: 'contact', label: 'Contact Info', icon: '📞' },
  { key: 'emergency', label: 'Emergency Info', icon: '🚨' },
  { key: 'groups', label: 'Groups', icon: '👥' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
])

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const handleProfileUpdate = async (data: any) => {
  try {
    await profileStore.updateProfile(data)
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

const handleJoinGroup = async (data: { group_id: number; role_id: number }) => {
  try {
    await profileStore.joinGroup(data)
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

const handleLeaveGroup = async (data: { group_id: number }) => {
  try {
    await profileStore.leaveGroup(data)
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

const handleAvatarUpload = async (file: File) => {
  try {
    await profileStore.uploadAvatar(file)
    showAvatarDialog.value = false
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

const handleAvatarDelete = async () => {
  try {
    await profileStore.deleteAvatar()
    showAvatarDialog.value = false
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

const handleSetExistingAvatar = async (imageId: number) => {
  try {
    await profileStore.setExistingAvatar(imageId)
    showAvatarDialog.value = false
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

const handleChangePassword = () => {
  showPasswordDialog.value = true
}

const handlePasswordChange = async (data: {
  current_password: string
  new_password: string
  confirm_password: string
}) => {
  try {
    await profileStore.changePassword(data)
    showPasswordDialog.value = false
    // Show success message
  } catch (error) {
    // Error handling is done in the store
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Initialize API configuration similar to Home page
    const isProduction = window.location.hostname === 'naboomneighbornet.net.za'
    const base = import.meta.env.DEV
      ? 'http://localhost:8000/api'
      : import.meta.env.VITE_API_V2_BASE ||
        (isProduction ? 'https://naboomneighbornet.net.za/api' : 'http://localhost:8000/api')
    console.log('Profile API Base:', base)

    // Load profile data (this now includes groups and roles fetching with error handling)
    await profileStore.refreshProfile()
  } catch (error: any) {
    console.error('Error initializing profile:', error)

    // If it's an authentication error, redirect to login
    if (error.response?.status === 401) {
      // Clear any stored auth data
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // Redirect to login page
      window.location.href = '/login'
    }
  }
})
</script>
