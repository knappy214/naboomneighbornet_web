<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Emergency Contact Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Emergency Contact Name *</span>
          </label>
          <input
            v-model="formData.emergency_contact_name"
            type="text"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.emergency_contact_name }"
            placeholder="Enter emergency contact name"
            required
          />
          <label v-if="errors.emergency_contact_name" class="label">
            <span class="label-text-alt text-error">{{ errors.emergency_contact_name }}</span>
          </label>
        </div>

        <!-- Emergency Contact Phone -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Emergency Contact Phone *</span>
          </label>
          <input
            v-model="formData.emergency_contact_phone"
            type="tel"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.emergency_contact_phone }"
            placeholder="Enter emergency contact phone"
            required
          />
          <label v-if="errors.emergency_contact_phone" class="label">
            <span class="label-text-alt text-error">{{ errors.emergency_contact_phone }}</span>
          </label>
        </div>

        <!-- Emergency Contact Relationship -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Relationship</span>
          </label>
          <select
            v-model="formData.emergency_contact_relationship"
            class="select select-bordered w-full"
          >
            <option value="">Select relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Blood Type -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Blood Type</span>
          </label>
          <select v-model="formData.blood_type" class="select select-bordered w-full">
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <!-- Medical Insurance -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Medical Insurance Provider</span>
          </label>
          <input
            v-model="formData.medical_insurance"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter medical insurance provider"
          />
        </div>

        <!-- Insurance Policy Number -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Insurance Policy Number</span>
          </label>
          <input
            v-model="formData.insurance_policy_number"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter policy number"
          />
        </div>
      </div>

      <!-- Additional Emergency Notes -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Additional Emergency Information</span>
        </label>
        <textarea
          v-model="formData.emergency_notes"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="Any additional information that might be helpful in an emergency..."
        ></textarea>
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
          {{ loading ? 'Saving...' : 'Save Changes' }}
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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const formData = ref({
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  blood_type: '',
  medical_insurance: '',
  insurance_policy_number: '',
  emergency_notes: '',
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Validation
const validateForm = () => {
  errors.value = {}

  if (!formData.value.emergency_contact_name.trim()) {
    errors.value.emergency_contact_name = 'Emergency contact name is required'
  }

  if (!formData.value.emergency_contact_phone.trim()) {
    errors.value.emergency_contact_phone = 'Emergency contact phone is required'
  }

  return Object.keys(errors.value).length === 0
}

// Methods
const initializeForm = () => {
  formData.value = {
    emergency_contact_name: props.profile.emergency_contact_name || '',
    emergency_contact_phone: props.profile.emergency_contact_phone || '',
    emergency_contact_relationship: props.profile.emergency_contact_relationship || '',
    blood_type: props.profile.blood_type || '',
    medical_insurance: props.profile.medical_insurance || '',
    insurance_policy_number: props.profile.insurance_policy_number || '',
    emergency_notes: props.profile.emergency_notes || '',
  }
  originalData.value = { ...formData.value }
}

const handleSubmit = async () => {
  if (!hasChanges.value) return

  if (!validateForm()) return

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
