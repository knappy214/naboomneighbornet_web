<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- First Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">First Name *</span>
          </label>
          <input
            v-model="formData.first_name"
            type="text"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.first_name }"
            placeholder="Enter your first name"
            required
          />
          <label v-if="errors.first_name" class="label">
            <span class="label-text-alt text-error">{{ errors.first_name }}</span>
          </label>
        </div>

        <!-- Last Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Last Name *</span>
          </label>
          <input
            v-model="formData.last_name"
            type="text"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.last_name }"
            placeholder="Enter your last name"
            required
          />
          <label v-if="errors.last_name" class="label">
            <span class="label-text-alt text-error">{{ errors.last_name }}</span>
          </label>
        </div>

        <!-- Email -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Email *</span>
          </label>
          <input
            v-model="formData.email"
            type="email"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.email }"
            placeholder="Enter your email"
            required
          />
          <label v-if="errors.email" class="label">
            <span class="label-text-alt text-error">{{ errors.email }}</span>
          </label>
        </div>

        <!-- Date of Birth -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Date of Birth</span>
          </label>
          <input v-model="formData.date_of_birth" type="date" class="input input-bordered w-full" />
        </div>

        <!-- Gender -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Gender</span>
          </label>
          <select v-model="formData.gender" class="select select-bordered w-full">
            <option value="">Select gender</option>
            <option v-for="option in genderOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Preferred Language -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Preferred Language</span>
          </label>
          <input
            v-model="formData.preferred_language"
            type="text"
            class="input input-bordered w-full"
            readonly
            placeholder="English"
          />
        </div>
      </div>

      <!-- Allergies -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Allergies</span>
        </label>
        <textarea
          v-model="formData.allergies"
          class="textarea textarea-bordered w-full"
          rows="3"
          placeholder="List any allergies you have..."
        ></textarea>
      </div>

      <!-- Medical Conditions -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Medical Conditions</span>
        </label>
        <textarea
          v-model="formData.medical_conditions"
          class="textarea textarea-bordered w-full"
          rows="3"
          placeholder="List any medical conditions..."
        ></textarea>
      </div>

      <!-- Current Medications -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Current Medications</span>
        </label>
        <textarea
          v-model="formData.current_medications"
          class="textarea textarea-bordered w-full"
          rows="3"
          placeholder="List current medications..."
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

// Gender options
const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
]

// Validation
const validateForm = () => {
  errors.value = {}

  if (!formData.value.first_name.trim()) {
    errors.value.first_name = 'First name is required'
  }

  if (!formData.value.last_name.trim()) {
    errors.value.last_name = 'Last name is required'
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.value.email)) {
      errors.value.email = 'Please enter a valid email address'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Methods
const initializeForm = () => {
  formData.value = {
    first_name: props.profile.first_name || '',
    last_name: props.profile.last_name || '',
    email: props.profile.email || '',
    date_of_birth: props.profile.date_of_birth || '',
    gender: props.profile.gender || '',
    preferred_language: props.profile.preferred_language || 'English',
    allergies: props.profile.allergies || '',
    medical_conditions: props.profile.medical_conditions || '',
    current_medications: props.profile.current_medications || '',
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
