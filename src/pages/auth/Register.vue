<script setup lang="ts">
import { ref } from 'vue'
import api from '@/lib/api'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/components/AuthLayout.vue'

const router = useRouter()
const { t } = useI18n()

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)

async function submit() {
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    await api.post('/auth/register', {
      email: email.value,
      username: username.value,
      password: password.value,
    })
    success.value = 'Registration successful! Redirecting to login...'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Registration failed'
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
            <div class="bg-secondary text-secondary-content rounded-full w-16">
              <span class="text-2xl">👤</span>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-base-content">{{ t('app.register') }}</h1>
          <p class="text-base-content/70 mt-2">Join your community security network</p>
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

        <!-- Success Alert -->
        <div v-if="success" role="alert" class="alert alert-success mb-4">
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
          <span>{{ success }}</span>
        </div>

        <!-- Form -->
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
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Username</span>
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="Choose a username"
              class="input input-bordered w-full focus:input-primary"
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
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Confirm Password</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-secondary btn-lg w-full"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">✨ {{ t('app.register') }}</span>
              <span v-else>Creating account...</span>
            </button>
          </div>
        </form>

        <!-- Links -->
        <div class="divider">OR</div>

        <div class="text-center">
          <div class="text-sm text-base-content/70">
            {{ t('auth.haveAccount') }}
            <router-link to="/login" class="link link-primary hover:link-hover font-medium">
              {{ t('app.login') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
