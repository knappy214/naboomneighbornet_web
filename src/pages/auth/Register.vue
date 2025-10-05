<template>
  <LoginLayout>
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Left Side - Welcome Content -->
      <div
        class="flex-1 flex items-center p-8 lg:p-16 bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10"
      >
        <div class="w-full max-w-2xl mx-auto text-center lg:text-left">
          <h1 class="text-5xl font-bold text-base-content mb-4 leading-tight">
            {{ t('auth.welcomeTo') }}
          </h1>
          <h1 class="text-5xl font-bold text-primary mb-8 leading-tight drop-shadow-sm">
            {{ t('app.title') }}
          </h1>
          <p class="text-xl text-base-content/85 leading-relaxed mb-12 font-medium">
            {{ t('auth.subtitle') }}
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
                {{ t('auth.farmSecurity') }}
              </span>
            </div>
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-success badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 0 01-1.414 0l-4-4a1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                {{ t('auth.neighborCommunication') }}
              </span>
            </div>
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-warning badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 0 01-1.414 0l-4-4a1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                {{ t('auth.emergencyAlerts') }}
              </span>
            </div>
            <div
              class="flex items-center gap-4 p-3 rounded-lg bg-base-100/30 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/50 transition-all duration-200"
            >
              <div class="badge badge-success badge-md p-3 shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 0 01-1.414 0l-4-4a1 0 011.414-1.414L8 12.586l7.293-7.293a1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/90 font-semibold">
                {{ t('auth.eventCoordination') }}
              </span>
            </div>
          </div>

          <!-- Trust Indicators -->
          <div
            class="card bg-base-100/60 backdrop-blur-md shadow-lg border border-base-300/70 hover:shadow-xl transition-all duration-300"
          >
            <div class="card-body p-6">
              <h3 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 0 00-1.414 1.414l2 2a1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t('auth.trustedBy') }}
              </h3>
              <p class="text-base-content/80 text-base font-medium leading-relaxed">
                {{ t('auth.joinCommunity') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Registration Form Card -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Completely Recreated daisyUI Card -->
          <div class="card bg-base-100 shadow-2xl">
            <div class="card-body p-6">
              <!-- Header -->
              <div class="text-center mb-6">
                <div class="avatar placeholder mb-4">
                  <div
                    class="bg-primary text-primary-content rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  >
                    <img src="/logo.png" alt="Logo" class="w-10 h-10 object-contain" />
                  </div>
                </div>
                <h1 class="text-2xl font-bold text-primary mb-2">{{ t('app.register') }}</h1>
                <p class="text-base-content/70 text-sm">{{ t('auth.welcomeBack') }}</p>
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

              <!-- Success Alert -->
              <div v-if="success" role="alert" class="alert alert-success mb-4">
                <svg class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-sm">{{ success }}</span>
              </div>

              <!-- Registration Form -->
              <form @submit.prevent="submit" class="space-y-4">
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

                <!-- Username Field -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">{{ t('auth.username') }}</span>
                  </label>
                  <input
                    v-model="username"
                    type="text"
                    :placeholder="t('auth.username')"
                    class="input input-bordered input-sm w-full"
                    autocomplete="username"
                    required
                  />
                </div>

                <!-- Password Field -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">{{ t('auth.password') }}</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      :placeholder="t('auth.password')"
                      class="input input-bordered input-sm w-full pr-10"
                      autocomplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      @click="togglePasswordVisibility"
                      class="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-base-200 rounded-r-lg"
                    >
                      <svg
                        v-if="!showPassword"
                        class="h-4 w-4 text-base-content/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <svg
                        v-else
                        class="h-4 w-4 text-base-content/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Confirm Password Field -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Confirm Password</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="Confirm your password"
                      class="input input-bordered input-sm w-full pr-10"
                      autocomplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      @click="toggleConfirmPasswordVisibility"
                      class="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-base-200 rounded-r-lg"
                    >
                      <svg
                        v-if="!showConfirmPassword"
                        class="h-4 w-4 text-base-content/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <svg
                        v-else
                        class="h-4 w-4 text-base-content/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Register Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-sm w-full mt-4"
                  :disabled="!isFormValid || isLoading"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  {{ isLoading ? t('auth.creatingAccount') : t('app.register') }}
                </button>
              </form>

              <!-- Divider -->
              <div class="divider my-4 text-base-content/60">
                <span class="px-3 bg-base-100 text-xs">{{ t('common.or') }}</span>
              </div>

              <!-- Login Link -->
              <div class="text-center">
                <p class="text-base-content/70 mb-3 text-sm">{{ t('auth.haveAccount') }}</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import api from '@/lib/api'
import LoginLayout from '@/components/LoginLayout.vue'

const router = useRouter()
const { t } = useI18n()
const { getLocalizedPath } = useLocaleRouter()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isFormValid = computed(() => {
  return (
    email.value &&
    username.value &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value
  )
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

async function submit() {
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    await api.post('/auth/register/', {
      email: email.value,
      username: username.value,
      password: password.value,
    })
    success.value = 'Registration successful! Redirecting to login...'
    setTimeout(() => router.push(getLocalizedPath('/login')), 2000)
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>
