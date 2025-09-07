<template>
  <!-- Modal -->
  <div v-if="isOpen" class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="text-2xl">🔐</span>
        Change Password
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Current Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Current Password *</span>
          </label>
          <input
            v-model="formData.current_password"
            type="password"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.current_password }"
            placeholder="Enter your current password"
            required
          />
          <label v-if="errors.current_password" class="label">
            <span class="label-text-alt text-error">{{ errors.current_password }}</span>
          </label>
        </div>

        <!-- New Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">New Password *</span>
          </label>
          <input
            v-model="formData.new_password"
            type="password"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.new_password }"
            placeholder="Enter your new password"
            required
          />
          <label v-if="errors.new_password" class="label">
            <span class="label-text-alt text-error">{{ errors.new_password }}</span>
          </label>
        </div>

        <!-- Confirm New Password -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Confirm New Password *</span>
          </label>
          <input
            v-model="formData.confirm_password"
            type="password"
            class="input input-bordered w-full"
            :class="{ 'input-error': errors.confirm_password }"
            placeholder="Confirm your new password"
            required
          />
          <label v-if="errors.confirm_password" class="label">
            <span class="label-text-alt text-error">{{ errors.confirm_password }}</span>
          </label>
        </div>

        <!-- Password Requirements -->
        <div class="alert alert-info">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 class="font-bold">Password Requirements</h3>
            <div class="text-xs">• At least 8 characters long</div>
            <div class="text-xs">• Contains uppercase and lowercase letters</div>
            <div class="text-xs">• Contains at least one number</div>
            <div class="text-xs">• Contains at least one special character</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button @click="closeDialog" type="button" class="btn btn-ghost" :disabled="loading">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :class="{ loading: loading }"
            :disabled="loading || !isFormValid"
          >
            <span v-if="!loading" class="text-lg">🔐</span>
            {{ loading ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'change',
    data: {
      current_password: string
      new_password: string
      confirm_password: string
    },
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const formData = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isFormValid = computed(() => {
  return (
    formData.value.current_password.trim() !== '' &&
    formData.value.new_password.trim() !== '' &&
    formData.value.confirm_password.trim() !== '' &&
    formData.value.new_password === formData.value.confirm_password
  )
})

// Validation
const validateForm = () => {
  errors.value = {}

  if (!formData.value.current_password.trim()) {
    errors.value.current_password = 'Current password is required'
  }

  if (!formData.value.new_password.trim()) {
    errors.value.new_password = 'New password is required'
  } else {
    // Password strength validation
    const password = formData.value.new_password
    if (password.length < 8) {
      errors.value.new_password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.value.new_password = 'Password must contain at least one lowercase letter'
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.value.new_password = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*\d)/.test(password)) {
      errors.value.new_password = 'Password must contain at least one number'
    } else if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.value.new_password = 'Password must contain at least one special character'
    }
  }

  if (!formData.value.confirm_password.trim()) {
    errors.value.confirm_password = 'Please confirm your new password'
  } else if (formData.value.new_password !== formData.value.confirm_password) {
    errors.value.confirm_password = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

// Methods
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    emit('change', { ...formData.value })
    // Reset form
    formData.value = {
      current_password: '',
      new_password: '',
      confirm_password: '',
    }
    closeDialog()
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  isOpen.value = false
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      // Reset form when dialog closes
      formData.value = {
        current_password: '',
        new_password: '',
        confirm_password: '',
      }
      errors.value = {}
      loading.value = false
    }
  },
)
</script>
