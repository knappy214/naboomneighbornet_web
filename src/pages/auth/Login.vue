<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import LoginLayout from '@/components/LoginLayout.vue'

const router = useRouter()
const store = useAuthStore()
const { t } = useI18n()
const { getLocalizedPath } = useLocaleRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

// Form validation
const isFormValid = computed(() => {
  return username.value.trim().length > 0 && password.value.length > 0
})

async function submit() {
  if (!isFormValid.value) return

  error.value = ''
  isLoading.value = true

  try {
    await store.login({
      username: username.value.trim(),
      password: password.value,
    })
    router.push('/')
  } catch (e: unknown) {
    console.error('Login error:', e)
    const errorMessage =
      (e as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
        ?.detail ||
      (e as { response?: { data?: { detail?: string; error?: string } } })?.response?.data?.error ||
      'Login failed'
    error.value = errorMessage
  } finally {
    isLoading.value = false
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <LoginLayout>
    <!-- Main Login Container -->
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Right Side - Login Form Card -->
      <div class="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div class="w-full max-w-md">
          <div class="card bg-base-100 shadow-2xl">
            <div class="card-body p-8">
              <!-- Logo and Header -->
              <div class="text-center mb-8">
                <div class="avatar placeholder mb-6">
                  <div
                    class="bg-primary text-primary-content rounded-full w-20 h-20 flex items-center justify-center shadow-lg"
                  >
                    <img
                      src="/logo.png"
                      alt="Naboom NeighborNet Logo"
                      class="w-12 h-12 object-contain"
                    />
                  </div>
                </div>
                <h1 class="text-4xl font-bold text-base-content mb-2">{{ t('app.login') }}</h1>
                <p class="text-base-content/70 text-lg">
                  {{ t('auth.welcomeBack') }}
                </p>
              </div>

              <!-- Error Alert -->
              <div v-if="error" role="alert" class="alert alert-error mb-6">
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
                <span class="font-medium">{{ error }}</span>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="submit" class="space-y-6">
                <!-- Username Field -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">{{ t('auth.username') }}</span>
                  </label>
                  <input
                    v-model="username"
                    type="text"
                    :placeholder="t('auth.username')"
                    class="input input-bordered input-lg w-full"
                    autocomplete="username"
                    required
                  />
                </div>

                <!-- Password Field -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">{{ t('auth.password') }}</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      :placeholder="t('auth.password')"
                      class="input input-bordered input-lg w-full pr-12"
                      autocomplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      @click="togglePasswordVisibility"
                      class="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <svg
                        v-if="!showPassword"
                        class="h-5 w-5 text-base-content/50"
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
                        class="h-5 w-5 text-base-content/50"
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

                <!-- Forgot Password Link -->
                <div class="text-right">
                  <router-link
                    to="/forgot"
                    class="link link-primary hover:link-hover text-sm font-medium"
                  >
                    {{ t('auth.forgot') }}?
                  </router-link>
                </div>

                <!-- Login Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-full mt-8"
                  :disabled="!isFormValid || isLoading"
                >
                  <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                  <svg
                    v-else
                    class="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {{ isLoading ? t('auth.signingIn') : t('app.login') }}
                </button>
              </form>

              <!-- Divider -->
              <div class="divider my-8">or</div>

              <!-- Register Link -->
              <div class="text-center">
                <p class="text-base-content/70 mb-4">{{ t('auth.dontHaveAccount') }}</p>
                <router-link
                  :to="getLocalizedPath('/register')"
                  class="btn btn-outline btn-lg w-full"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  {{ t('app.register') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Left Side - Welcome Content -->
      <div
        class="flex-1 flex items-center p-8 lg:p-16 bg-gradient-to-br from-primary/10 to-secondary/10"
      >
        <div class="w-full max-w-2xl mx-auto text-center lg:text-left">
          <h1 class="text-6xl font-bold text-base-content mb-4 leading-tight">
            {{ t('auth.welcomeTo') }}
          </h1>
          <h1 class="text-6xl font-bold text-primary mb-8 leading-tight">
            {{ t('app.title') }}
          </h1>
          <p class="text-xl text-base-content/80 leading-relaxed mb-12">
            {{ t('auth.subtitle') }}
          </p>

          <!-- Features List -->
          <div class="space-y-4 mb-12">
            <div class="flex items-center gap-4">
              <div class="badge badge-success badge-lg p-3">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/80 font-medium">
                {{ t('auth.farmSecurity') }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <div class="badge badge-success badge-lg p-3">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/80 font-medium">
                {{ t('auth.neighborCommunication') }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <div class="badge badge-warning badge-lg p-3">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/80 font-medium">
                {{ t('auth.emergencyAlerts') }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <div class="badge badge-success badge-lg p-3">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span class="text-lg text-base-content/80 font-medium">
                {{ t('auth.eventCoordination') }}
              </span>
            </div>
          </div>

          <!-- Trust Indicators -->
          <div class="card bg-base-100/50 backdrop-blur-sm shadow-lg border border-base-300">
            <div class="card-body p-6">
              <h3 class="card-title text-xl mb-4 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ t('auth.trustedBy') }}
              </h3>
              <p class="text-base-content/70 text-sm">
                {{ t('auth.joinCommunity') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LoginLayout>
</template>
