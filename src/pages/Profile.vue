<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-account</v-icon>
            {{ $t('profile.title') }}
          </v-card-title>

          <v-card-text>
            <v-row v-if="profileStore.loading">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">{{ $t('common.loading') }}</p>
              </v-col>
            </v-row>

            <v-row v-else-if="profileStore.error">
              <v-col cols="12">
                <v-alert type="error" variant="tonal">
                  {{ profileStore.error }}
                </v-alert>
                <v-btn @click="profileStore.refreshProfile()" color="primary">
                  {{ $t('common.retry') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-row v-else-if="profileStore.profile">
              <!-- Profile Header -->
              <v-col cols="12" md="4">
                <v-card variant="outlined" class="text-center pa-4">
                  <v-avatar size="120" class="mb-4">
                    <v-img
                      v-if="profileStore.profile.avatar_url"
                      :src="profileStore.profile.avatar_url"
                      :alt="$t('profile.avatar')"
                    />
                    <v-icon v-else size="60" color="grey">mdi-account</v-icon>
                  </v-avatar>

                  <h3>
                    {{ profileStore.profile.first_name }} {{ profileStore.profile.last_name }}
                  </h3>
                  <p class="text-grey">{{ profileStore.profile.email }}</p>

                  <v-chip
                    :color="profileStore.profile.is_active ? 'success' : 'error'"
                    variant="tonal"
                    class="mb-2"
                  >
                    {{
                      profileStore.profile.is_active ? $t('profile.active') : $t('profile.inactive')
                    }}
                  </v-chip>

                  <v-btn
                    @click="showAvatarDialog = true"
                    color="primary"
                    variant="outlined"
                    size="small"
                    class="mt-2"
                  >
                    <v-icon start>mdi-camera</v-icon>
                    {{ $t('profile.changeAvatar') }}
                  </v-btn>
                </v-card>

                <!-- Profile Stats -->
                <v-card variant="outlined" class="mt-4" v-if="profileStore.stats">
                  <v-card-title class="text-h6">
                    <v-icon class="me-2">mdi-chart-line</v-icon>
                    {{ $t('profile.stats') }}
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-3">
                      <div class="d-flex justify-space-between mb-1">
                        <span>{{ $t('profile.completion') }}</span>
                        <span>{{ Math.round(profileStore.profileCompletion) }}%</span>
                      </div>
                      <v-progress-linear
                        :model-value="profileStore.profileCompletion"
                        color="primary"
                        height="8"
                        rounded
                      />
                    </div>

                    <v-list density="compact">
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-account-group</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('profile.groups') }}</v-list-item-title>
                        <template #append>
                          <v-chip size="small">{{
                            profileStore.stats.group_memberships_count
                          }}</v-chip>
                        </template>
                      </v-list-item>

                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-calendar</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('profile.memberSince') }}</v-list-item-title>
                        <template #append>
                          <span class="text-caption">
                            {{ formatDate(profileStore.stats.user_joined_at) }}
                          </span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Profile Details -->
              <v-col cols="12" md="8">
                <v-tabs v-model="activeTab" color="primary">
                  <v-tab value="personal">
                    <v-icon class="me-2">mdi-account-details</v-icon>
                    {{ $t('profile.personalInfo') }}
                  </v-tab>
                  <v-tab value="contact">
                    <v-icon class="me-2">mdi-phone</v-icon>
                    {{ $t('profile.contactInfo') }}
                  </v-tab>
                  <v-tab value="emergency">
                    <v-icon class="me-2">mdi-alert</v-icon>
                    {{ $t('profile.emergencyInfo') }}
                  </v-tab>
                  <v-tab value="groups">
                    <v-icon class="me-2">mdi-account-group</v-icon>
                    {{ $t('profile.groups') }}
                  </v-tab>
                  <v-tab value="settings">
                    <v-icon class="me-2">mdi-cog</v-icon>
                    {{ $t('profile.settings') }}
                  </v-tab>
                </v-tabs>

                <v-card-text>
                  <v-window v-model="activeTab">
                    <!-- Personal Information Tab -->
                    <v-window-item value="personal">
                      <PersonalInfoTab
                        :profile="profileStore.profile"
                        @update="handleProfileUpdate"
                      />
                    </v-window-item>

                    <!-- Contact Information Tab -->
                    <v-window-item value="contact">
                      <ContactInfoTab
                        :profile="profileStore.profile"
                        @update="handleProfileUpdate"
                      />
                    </v-window-item>

                    <!-- Emergency Information Tab -->
                    <v-window-item value="emergency">
                      <EmergencyInfoTab
                        :profile="profileStore.profile"
                        @update="handleProfileUpdate"
                      />
                    </v-window-item>

                    <!-- Groups Tab -->
                    <v-window-item value="groups">
                      <GroupsTab
                        :profile="profileStore.profile"
                        :groups="profileStore.groups"
                        :roles="profileStore.roles"
                        @join-group="handleJoinGroup"
                        @leave-group="handleLeaveGroup"
                      />
                    </v-window-item>

                    <!-- Settings Tab -->
                    <v-window-item value="settings">
                      <SettingsTab
                        :profile="profileStore.profile"
                        @update="handleProfileUpdate"
                        @change-password="handleChangePassword"
                      />
                    </v-window-item>
                  </v-window>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Avatar Management Dialog -->
    <AvatarDialog
      v-model="showAvatarDialog"
      :avatar-info="profileStore.avatarInfo"
      @upload="handleAvatarUpload"
      @delete="handleAvatarDelete"
      @set-existing="handleSetExistingAvatar"
    />

    <!-- Change Password Dialog -->
    <ChangePasswordDialog v-model="showPasswordDialog" @change="handlePasswordChange" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

// Methods
const formatDate = (dateString: string) => {
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
  await profileStore.refreshProfile()
  await profileStore.fetchGroups()
  await profileStore.fetchRoles()
})
</script>
