<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/components/AuthLayout.vue'

const router = useRouter()
const store = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function submit() {
  error.value = ''
  isLoading.value = true

  try {
    await store.login({
      username: email.value, // Use email as username for the API
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
</script>

<template>
  <AuthLayout>
    <!-- Hero Section with Login Form -->
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content flex-col lg:flex-row-reverse w-full max-w-6xl">
        <!-- Right Side - Login Form -->
        <div class="card bg-base-100 w-full max-w-md shrink-0 shadow-2xl">
          <div class="card-body p-8">
            <!-- Header -->
            <div class="text-center mb-6">
              <div class="avatar placeholder mb-4">
                <div
                  class="bg-primary text-primary-content rounded-full w-16 flex items-center justify-center"
                >
                  <img
                    src="/logo.png"
                    alt="Naboom NeighborNet Logo"
                    class="w-10 h-10 object-contain"
                  />
                </div>
              </div>
              <h1 class="text-3xl font-bold text-base-content">{{ t('app.login') }}</h1>
              <p class="text-base-content/70 mt-2">
                Welcome back to your community security dashboard
              </p>
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

            <!-- Login Form using Fieldset -->
            <fieldset class="fieldset">
              <form @submit.prevent="submit" class="space-y-4">
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

                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">{{ t('auth.password') }}</span>
                  </label>
                  <input
                    v-model="password"
                    type="password"
                    :placeholder="t('auth.password')"
                    class="input input-bordered w-full focus:input-primary"
                    autocomplete="current-password"
                    required
                  />
                </div>

                <div class="form-control mt-6">
                  <button
                    type="submit"
                    class="btn btn-primary w-full"
                    :class="{ loading: isLoading }"
                    :disabled="isLoading"
                  >
                    <span v-if="!isLoading" class="flex items-center gap-2">
                      <span>🔑</span>
                      {{ t('app.login') }}
                    </span>
                    <span v-else>Signing in...</span>
                  </button>
                </div>
              </form>

              <!-- Forgot Password Link -->
              <div class="text-center mt-4">
                <router-link to="/forgot" class="link link-primary hover:link-hover text-sm">
                  {{ t('auth.forgot') }}
                </router-link>
              </div>
            </fieldset>
          </div>
        </div>

        <!-- Left Side - Welcome Content -->
        <div class="text-center lg:text-left lg:pr-12">
          <h1 class="text-5xl font-bold text-base-content">Welcome to</h1>
          <h1 class="text-5xl font-bold text-primary mb-6">Naboom NeighborNet</h1>
          <p class="py-6 text-lg text-base-content/80 leading-relaxed">
            Your trusted agricultural community security platform. Stay connected, stay safe, and
            protect your farm together.
          </p>

          <!-- Features List -->
          <div class="space-y-3 mb-8">
            <div class="flex items-center gap-3">
              <div class="badge badge-secondary badge-sm">✓</div>
              <span class="text-base-content/80">Farm security monitoring</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="badge badge-secondary badge-sm">✓</div>
              <span class="text-base-content/80">Neighbor farm communication</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="badge badge-accent badge-sm">✓</div>
              <span class="text-base-content/80">Emergency farm alerts</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="badge badge-secondary badge-sm">✓</div>
              <span class="text-base-content/80">Agricultural event coordination</span>
            </div>
          </div>

          <!-- Register Section -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body p-6">
              <h3 class="card-title text-lg mb-2">New to the farm community?</h3>
              <p class="text-base-content/70 text-sm mb-4">
                Join your farming neighbors and help build a safer agricultural community together.
              </p>
              <router-link to="/register" class="btn btn-outline btn-sm">
                <span class="mr-1">✨</span>
                {{ t('app.register') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
