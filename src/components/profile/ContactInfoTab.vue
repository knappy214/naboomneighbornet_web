<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Phone Number -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Phone Number</span>
          </label>
          <input
            v-model="formData.phone_number"
            type="tel"
            class="input input-bordered w-full"
            placeholder="Enter your phone number"
          />
        </div>

        <!-- Mobile Number -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Mobile Number</span>
          </label>
          <input
            v-model="formData.mobile_number"
            type="tel"
            class="input input-bordered w-full"
            placeholder="Enter your mobile number"
          />
        </div>

        <!-- Address -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text font-medium">Address</span>
          </label>
          <textarea
            v-model="formData.address"
            class="textarea textarea-bordered w-full"
            rows="3"
            placeholder="Enter your address"
          ></textarea>
        </div>

        <!-- City -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">City</span>
          </label>
          <input
            v-model="formData.city"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter your city"
          />
        </div>

        <!-- State/Province -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">State/Province</span>
          </label>
          <input
            v-model="formData.state"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter your state or province"
          />
        </div>

        <!-- Postal Code -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Postal Code</span>
          </label>
          <input
            v-model="formData.postal_code"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter your postal code"
          />
        </div>

        <!-- Country -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Country</span>
          </label>
          <select v-model="formData.country" class="select select-bordered w-full">
            <option value="">Select country</option>
            <option value="South Africa">South Africa</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
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
const formData = ref({
  phone_number: '',
  mobile_number: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
})

const originalData = ref({ ...formData.value })

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Methods
const initializeForm = () => {
  formData.value = {
    phone_number: props.profile.phone_number || '',
    mobile_number: props.profile.mobile_number || '',
    address: props.profile.address || '',
    city: props.profile.city || '',
    state: props.profile.state || '',
    postal_code: props.profile.postal_code || '',
    country: props.profile.country || '',
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
