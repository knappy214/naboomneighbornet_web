<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Notification Settings -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Notification Settings</h3>

          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Email Notifications</span>
                <input
                  v-model="formData.email_notifications"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">SMS Notifications</span>
                <input
                  v-model="formData.sms_notifications"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Push Notifications</span>
                <input
                  v-model="formData.push_notifications"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Emergency Alerts</span>
                <input
                  v-model="formData.emergency_alerts"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Privacy Settings</h3>

          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Profile Visibility</span>
              </label>
              <select v-model="formData.profile_visibility" class="select select-bordered w-full">
                <option value="public">Public - Everyone can see your profile</option>
                <option value="community">Community - Only community members can see</option>
                <option value="private">Private - Only you can see your profile</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Show Contact Information</span>
                <input
                  v-model="formData.show_contact_info"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Show Location</span>
                <input
                  v-model="formData.show_location"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Security Settings</h3>

          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Two-Factor Authentication</span>
                <input
                  v-model="formData.two_factor_enabled"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">Login Notifications</span>
                <input
                  v-model="formData.login_notifications"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">Change Password</div>
                <div class="text-sm text-base-content/70">Update your account password</div>
              </div>
              <button
                @click="handleChangePassword"
                type="button"
                class="btn btn-outline btn-primary"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Language and Region -->
      <div class="card bg-base-200 shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">Language and Region</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Language</span>
              </label>
              <select v-model="formData.language" class="select select-bordered w-full">
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Time Zone</span>
              </label>
              <select v-model="formData.timezone" class="select select-bordered w-full">
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="btn btn-primary"
          :class="{ loading: loading }"
          :disabled="!hasChanges || loading"
        >
          <span v-if="!loading" class="text-lg">💾</span>
          {{ loading ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { UserProfile } from '@/stores/profile'

interface Props {
  profile: UserProfile
}

interface Emits {
  (e: 'update', data: Partial<UserProfile>): void
  (e: 'change-password'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const formData = ref({
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  emergency_alerts: true,
  profile_visibility: 'community',
  show_contact_info: true,
  show_location: false,
  two_factor_enabled: false,
  login_notifications: true,
  language: 'en',
  timezone: 'Africa/Johannesburg',
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Methods
const initializeForm = () => {
  formData.value = {
    email_notifications: props.profile.email_notifications ?? true,
    sms_notifications: props.profile.sms_notifications ?? false,
    push_notifications: props.profile.push_notifications ?? true,
    emergency_alerts: props.profile.emergency_alerts ?? true,
    profile_visibility: props.profile.profile_visibility || 'community',
    show_contact_info: props.profile.show_contact_info ?? true,
    show_location: props.profile.show_location ?? false,
    two_factor_enabled: props.profile.two_factor_enabled ?? false,
    login_notifications: props.profile.login_notifications ?? true,
    language: props.profile.language || 'en',
    timezone: props.profile.timezone || 'Africa/Johannesburg',
  }
  originalData.value = { ...formData.value }
}

const handleSubmit = async () => {
  if (!hasChanges.value) return

  loading.value = true
  try {
    emit('update', formData.value)
    originalData.value = { ...formData.value }
  } finally {
    loading.value = false
  }
}

const handleChangePassword = () => {
  emit('change-password')
}

// Watchers
watch(() => props.profile, initializeForm, { immediate: true })
</script>
