<script setup lang="ts">
import { ref } from 'vue'
import api from '@/lib/api'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/components/AuthLayout.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const error = ref('')
const isLoading = ref(false)

async function reset() {
  error.value = ''
  message.value = ''

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  const uid = String(route.query.uid || '')
  const token = String(route.query.token || '')

  if (!uid || !token) {
    error.value = 'Invalid reset link'
    return
  }

  isLoading.value = true

  try {
    await api.post('/auth/password-reset/confirm', {
      uid,
      token,
      new_password: newPassword.value,
    })
    message.value = 'Password reset successful! Redirecting to login...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Invalid or expired link'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="card bg-base-100 shadow-2xl border border-base-300">
      <div class="card-body p-8">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="avatar placeholder mb-4">
            <div class="bg-accent text-accent-content rounded-full w-16">
              <span class="text-2xl">🔒</span>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-base-content">{{ t('auth.resetPassword') }}</h1>
          <p class="text-base-content/70 mt-2">Enter your new password below</p>
        </div>

        <!-- Success Alert -->
        <div v-if="message" role="alert" class="alert alert-success mb-4">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ message }}</span>
        </div>

        <!-- Error Alert -->
        <div v-if="error" role="alert" class="alert alert-error mb-4">
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="reset" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('auth.newPassword') }}</span>
            </label>
            <input
              v-model="newPassword"
              type="password"
              :placeholder="t('auth.newPassword')"
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Confirm New Password</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-accent btn-lg w-full"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">🔐 {{ t('auth.confirm') }}</span>
              <span v-else>Resetting...</span>
            </button>
          </div>
        </form>

        <!-- Links -->
        <div class="divider">OR</div>

        <div class="text-center">
          <router-link to="/login" class="link link-primary hover:link-hover font-medium">
            🔙 Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
