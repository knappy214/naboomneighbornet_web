<template>
  <div>
    <v-form @submit.prevent="handleSubmit" ref="form">
      <!-- Notification Settings -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>
          <v-icon class="me-2">mdi-bell</v-icon>
          {{ $t('profile.notificationSettings') }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.email_notifications"
                :label="$t('profile.emailNotifications')"
                color="primary"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.sms_notifications"
                :label="$t('profile.smsNotifications')"
                color="primary"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Security Settings -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>
          <v-icon class="me-2">mdi-shield</v-icon>
          {{ $t('profile.securitySettings') }}
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.mfa_enabled"
                :label="$t('profile.mfaEnabled')"
                color="primary"
                hide-details
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-btn @click="$emit('change-password')" color="primary" variant="outlined">
            <v-icon start>mdi-key</v-icon>
            {{ $t('profile.changePassword') }}
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Account Information -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title>
          <v-icon class="me-2">mdi-account</v-icon>
          {{ $t('profile.accountInfo') }}
        </v-card-title>

        <v-card-text>
          <v-list density="comfortable">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ $t('profile.username') }}</v-list-item-title>
              <template #append>
                <span class="text-grey">{{ profile.username }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon>mdi-calendar</v-icon>
              </template>
              <v-list-item-title>{{ $t('profile.memberSince') }}</v-list-item-title>
              <template #append>
                <span class="text-grey">{{ formatDate(profile.date_joined) }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon>mdi-clock</v-icon>
              </template>
              <v-list-item-title>{{ $t('profile.lastLogin') }}</v-list-item-title>
              <template #append>
                <span class="text-grey">{{ formatDate(profile.last_login) }}</span>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon>mdi-update</v-icon>
              </template>
              <v-list-item-title>{{ $t('profile.lastUpdated') }}</v-list-item-title>
              <template #append>
                <span class="text-grey">{{ formatDate(profile.updated_at) }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-row class="mt-4">
        <v-col cols="12" class="d-flex justify-end">
          <v-btn type="submit" color="primary" :loading="loading" :disabled="!hasChanges">
            <v-icon start>mdi-content-save</v-icon>
            {{ $t('common.save') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

// State
const loading = ref(false)
const formData = ref({
  email_notifications: false,
  sms_notifications: false,
  mfa_enabled: false,
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const initializeForm = () => {
  formData.value = {
    email_notifications: props.profile.email_notifications || false,
    sms_notifications: props.profile.sms_notifications || false,
    mfa_enabled: props.profile.mfa_enabled || false,
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

// Watchers
watch(() => props.profile, initializeForm, { immediate: true })
</script>
