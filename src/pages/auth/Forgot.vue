<template>
  <LoginLayout>
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Left Side - Welcome Content -->
      <div
        class="flex-1 flex items-center p-8 lg:p-16 bg-gradient-to-br from-warning/15 via-accent/10 to-error/10"
      >
        <div class="w-full max-w-2xl mx-auto text-center lg:text-left">
          <h1 class="text-5xl font-bold text-base-content mb-4 leading-tight">
            {{ t('auth.forgot') }}
          </h1>
          <h1 class="text-5xl font-bold text-warning mb-8 leading-tight drop-shadow-sm">
            {{ t('app.title') }}
          </h1>
          <p class="text-xl text-base-content/85 leading-relaxed mb-12 font-medium">
            Don't worry! We'll help you reset your password and get back to securing your farm.
          </p>

          <!-- Features List -->
          <div class="space-y-4 mb-12">
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-success badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                Secure password reset process
              </span>
            </div>
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-success badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                Email verification required
              </span>
            </div>
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-warning badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                Quick and secure recovery
              </span>
            </div>
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-success badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                Back to securing your farm
              </span>
            </div>
          </div>

          <!-- Trust Indicators -->
          <div
            class="card bg-base-100/60 backdrop-blur-md shadow-lg border border-base-300/70 hover:shadow-xl transition-all duration-300"
          >
            <div class="card-body p-6">
              <h3 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg class="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 0 00-1.414 1.414l2 2a1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t('auth.trustedBy') }}
              </h3>
              <p class="text-base-content/80 text-base font-medium leading-relaxed">
                Your security is our priority. We'll help you regain access to your farm security
                dashboard quickly and safely.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Password Reset Form Card -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Completely Recreated daisyUI Card -->
          <div class="card bg-base-100 shadow-2xl">
            <div class="card-body p-6">
              <!-- Header -->
              <div class="text-center mb-6">
                <div class="avatar placeholder mb-4">
                  <div
                    class="bg-warning text-warning-content rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  >
                    <img src="/logo.png" alt="Logo" class="w-10 h-10 object-contain" />
                  </div>
                </div>
                <h1 class="text-2xl font-bold text-warning mb-2">{{ t('auth.forgot') }}</h1>
                <p class="text-base-content/70 text-sm">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <!-- Success Alert -->
              <div v-if="message" role="alert" class="alert alert-success mb-4">
                <svg class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-sm">{{ message }}</span>
              </div>

              <!-- Error Alert -->
              <div v-if="error" role="alert" class="alert alert-error mb-4">
                <svg class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-sm">{{ error }}</span>
              </div>

              <!-- Password Reset Form -->
              <form @submit.prevent="sendLink" class="space-y-4">
                <!-- Email Field -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">{{ t('auth.email') }}</span>
                  </label>
                  <input
                    v-model="email"
                    type="email"
                    :placeholder="t('auth.email')"
                    class="input input-bordered input-sm w-full"
                    autocomplete="email"
                    required
                  />
                </div>

                <!-- Send Link Button -->
                <button
                  type="submit"
                  class="btn btn-warning btn-sm w-full mt-4"
                  :disabled="!email || isLoading"
                >
                  <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
                  <svg
                    v-else
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {{ isLoading ? 'Sending...' : t('auth.sendLink') }}
                </button>
              </form>

              <!-- Divider -->
              <div class="divider my-4 text-base-content/60">
                <span class="px-3 bg-base-100 text-xs">{{ t('common.or') }}</span>
              </div>

              <!-- Back to Login Link -->
              <div class="text-center">
                <router-link :to="getLocalizedPath('/login')" class="btn btn-outline btn-sm w-full">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {{ t('app.login') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LoginLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import api from '@/lib/api'
import LoginLayout from '@/components/LoginLayout.vue'

const { t } = useI18n()
const { getLocalizedPath } = useLocaleRouter()

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
