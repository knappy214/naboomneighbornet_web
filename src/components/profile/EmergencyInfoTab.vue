<template>
  <div>
    <v-form @submit.prevent="handleSubmit" ref="form">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.emergency_contact_name"
            :label="$t('profile.emergencyContactName')"
            variant="outlined"
            density="comfortable"
            :placeholder="$t('profile.emergencyContactNamePlaceholder')"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.emergency_contact_phone"
            :label="$t('profile.emergencyContactPhone')"
            variant="outlined"
            density="comfortable"
            type="tel"
            :placeholder="$t('profile.emergencyContactPhonePlaceholder')"
          />
        </v-col>

        <v-col cols="12">
          <v-select
            v-model="formData.emergency_contact_relationship"
            :label="$t('profile.emergencyContactRelationship')"
            :items="relationshipOptions"
            variant="outlined"
            density="comfortable"
            clearable
            :placeholder="$t('profile.emergencyContactRelationshipPlaceholder')"
          />
        </v-col>
      </v-row>

      <v-alert type="info" variant="tonal" class="mt-4" :text="$t('profile.emergencyInfoNote')" />

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
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Relationship options
const relationshipOptions = [
  { title: t('profile.relationshipOptions.spouse'), value: 'Spouse' },
  { title: t('profile.relationshipOptions.parent'), value: 'Parent' },
  { title: t('profile.relationshipOptions.child'), value: 'Child' },
  { title: t('profile.relationshipOptions.sibling'), value: 'Sibling' },
  { title: t('profile.relationshipOptions.friend'), value: 'Friend' },
  { title: t('profile.relationshipOptions.other'), value: 'Other' },
]

// Methods
const initializeForm = () => {
  formData.value = {
    emergency_contact_name: props.profile.emergency_contact_name || '',
    emergency_contact_phone: props.profile.emergency_contact_phone || '',
    emergency_contact_relationship: props.profile.emergency_contact_relationship || '',
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
