<template>
  <div>
    <v-form @submit.prevent="handleSubmit" ref="form">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.first_name"
            :label="$t('profile.firstName')"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.last_name"
            :label="$t('profile.lastName')"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.email"
            :label="$t('profile.email')"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
            type="email"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.date_of_birth"
            :label="$t('profile.dateOfBirth')"
            variant="outlined"
            density="comfortable"
            type="date"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="formData.gender"
            :label="$t('profile.gender')"
            :items="genderOptions"
            variant="outlined"
            density="comfortable"
            clearable
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.preferred_language"
            :label="$t('profile.preferredLanguage')"
            variant="outlined"
            density="comfortable"
            readonly
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="formData.allergies"
            :label="$t('profile.allergies')"
            variant="outlined"
            density="comfortable"
            rows="3"
            :placeholder="$t('profile.allergiesPlaceholder')"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="formData.medical_conditions"
            :label="$t('profile.medicalConditions')"
            variant="outlined"
            density="comfortable"
            rows="3"
            :placeholder="$t('profile.medicalConditionsPlaceholder')"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="formData.current_medications"
            :label="$t('profile.currentMedications')"
            variant="outlined"
            density="comfortable"
            rows="3"
            :placeholder="$t('profile.currentMedicationsPlaceholder')"
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
  first_name: '',
  last_name: '',
  email: '',
  date_of_birth: '',
  gender: '',
  preferred_language: '',
  allergies: '',
  medical_conditions: '',
  current_medications: '',
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Validation rules
const rules = {
  required: (value: any) => !!value || t('validation.required'),
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('validation.email')
  },
}

// Gender options
const genderOptions = [
  { title: t('profile.genderOptions.male'), value: 'Male' },
  { title: t('profile.genderOptions.female'), value: 'Female' },
  { title: t('profile.genderOptions.other'), value: 'Other' },
  { title: t('profile.genderOptions.preferNotToSay'), value: 'Prefer not to say' },
]

// Methods
const initializeForm = () => {
  formData.value = {
    first_name: props.profile.first_name || '',
    last_name: props.profile.last_name || '',
    email: props.profile.email || '',
    date_of_birth: props.profile.date_of_birth || '',
    gender: props.profile.gender || '',
    preferred_language: props.profile.preferred_language || '',
    allergies: props.profile.allergies || '',
    medical_conditions: props.profile.medical_conditions || '',
    current_medications: props.profile.current_medications || '',
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
