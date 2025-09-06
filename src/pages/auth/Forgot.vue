<script setup lang="ts">
import { ref } from 'vue'
import api from '@/lib/api'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/components/AuthLayout.vue'

const { t } = useI18n()

const email = ref('')
const message = ref('')
const error = ref('')
const isLoading = ref(false)

async function sendLink() {
  error.value = ''
  message.value = ''
  isLoading.value = true

  try {
    await api.post('/auth/password-reset/', { email: email.value })
    message.value = 'Password reset link sent! Check your email.'
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Failed to send reset link'
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
            <div
              class="bg-warning text-warning-content rounded-full w-16 flex items-center justify-center"
            >
              <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-10 h-10 object-contain" />
            </div>
          </div>
          <h1 class="text-3xl font-bold text-base-content">{{ t('auth.forgot') }}</h1>
          <p class="text-base-content/70 mt-2">Enter your email to receive a password reset link</p>
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
        <form @submit.prevent="sendLink" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('auth.email') }}</span>
            </label>
            <input
              v-model="email"
              type="email"
              :placeholder="t('auth.email')"
              class="input input-bordered w-full focus:input-primary"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-warning btn-lg w-full"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">📧 {{ t('auth.sendLink') }}</span>
              <span v-else>Sending...</span>
            </button>
          </div>
        </form>

        <!-- Links -->
        <div class="divider">OR</div>

        <div class="text-center space-y-3">
          <router-link to="/login" class="link link-primary hover:link-hover font-medium">
            🔙 Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
