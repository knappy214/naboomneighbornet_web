<template>
  <div>
    <v-form @submit.prevent="handleSubmit" ref="form">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.phone"
            :label="$t('profile.phone')"
            variant="outlined"
            density="comfortable"
            type="tel"
            :placeholder="$t('profile.phonePlaceholder')"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.timezone"
            :label="$t('profile.timezone')"
            variant="outlined"
            density="comfortable"
            readonly
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="formData.address"
            :label="$t('profile.address')"
            variant="outlined"
            density="comfortable"
            :placeholder="$t('profile.addressPlaceholder')"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.city"
            :label="$t('profile.city')"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.province"
            :label="$t('profile.province')"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.postal_code"
            :label="$t('profile.postalCode')"
            variant="outlined"
            density="comfortable"
            :placeholder="$t('profile.postalCodePlaceholder')"
          />
        </v-col>
      </v-row>

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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// State
const loading = ref(false)
const formData = ref({
  phone: '',
  timezone: '',
  address: '',
  city: '',
  province: '',
  postal_code: '',
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Methods
const initializeForm = () => {
  formData.value = {
    phone: props.profile.phone || '',
    timezone: props.profile.timezone || '',
    address: props.profile.address || '',
    city: props.profile.city || '',
    province: props.profile.province || '',
    postal_code: props.profile.postal_code || '',
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
