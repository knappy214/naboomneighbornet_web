<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-key</v-icon>
        {{ $t('profile.changePassword') }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-text-field
            v-model="formData.current_password"
            :label="$t('profile.currentPassword')"
            :type="showCurrentPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            :error-messages="errors.current_password"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
          />

          <v-text-field
            v-model="formData.new_password"
            :label="$t('profile.newPassword')"
            :type="showNewPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.passwordStrength]"
            :error-messages="errors.new_password"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showNewPassword = !showNewPassword"
          />

          <v-text-field
            v-model="formData.confirm_password"
            :label="$t('profile.confirmPassword')"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.passwordMatch]"
            :error-messages="errors.confirm_password"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />

          <!-- Password Strength Indicator -->
          <div v-if="formData.new_password" class="mt-2">
            <v-progress-linear
              :model-value="passwordStrength"
              :color="passwordStrengthColor"
              height="4"
              rounded
            />
            <div class="text-caption mt-1">
              {{ passwordStrengthText }}
            </div>
          </div>

          <!-- Password Requirements -->
          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
            :text="$t('profile.passwordRequirements')"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false" :disabled="changing">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn @click="handleSubmit" color="primary" :loading="changing" :disabled="!isFormValid">
          <v-icon start>mdi-key</v-icon>
          {{ $t('profile.changePassword') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'change',
    data: { current_password: string; new_password: string; confirm_password: string },
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// State
const changing = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const errors = ref({
  current_password: [] as string[],
  new_password: [] as string[],
  confirm_password: [] as string[],
})

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const passwordStrength = computed(() => {
  const password = formData.value.new_password
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 20
  if (/[a-z]/.test(password)) strength += 20
  if (/[A-Z]/.test(password)) strength += 20
  if (/[0-9]/.test(password)) strength += 10
  if (/[^A-Za-z0-9]/.test(password)) strength += 10

  return strength
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength < 40) return 'error'
  if (strength < 70) return 'warning'
  return 'success'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 40) return t('profile.passwordStrength.weak')
  if (strength < 70) return t('profile.passwordStrength.medium')
  return t('profile.passwordStrength.strong')
})

const isFormValid = computed(() => {
  return (
    formData.value.current_password &&
    formData.value.new_password &&
    formData.value.confirm_password &&
    formData.value.new_password === formData.value.confirm_password &&
    passwordStrength.value >= 40
  )
})

// Validation rules
const rules = {
  required: (value: any) => !!value || t('validation.required'),
  passwordStrength: (value: string) => {
    if (!value) return true
    if (value.length < 8) return t('validation.passwordMinLength')
    return true
  },
  passwordMatch: (value: string) => {
    return value === formData.value.new_password || t('validation.passwordMatch')
  },
}

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return

  changing.value = true
  try {
    emit('change', { ...formData.value })
    resetForm()
  } finally {
    changing.value = false
  }
}

const resetForm = () => {
  formData.value = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  }
  errors.value = {
    current_password: [],
    new_password: [],
    confirm_password: [],
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      resetForm()
    }
  },
)
</script>
