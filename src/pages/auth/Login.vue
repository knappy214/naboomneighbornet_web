<script setup lang="ts">
import { ref } from 'vue'
import api from '@/lib/api'
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
    const { data } = await api.post('/auth/jwt/create', {
      email: email.value,
      password: password.value,
    })
    store.setAccessToken(data.access)
    store.setRefreshToken(data.refresh)
    router.push('/')
  } catch (e: any) {
    error.value = e?.response?.data?.detail || 'Login failed'
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
            <div class="bg-primary text-primary-content rounded-full w-16">
              <span class="text-2xl">🔐</span>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-base-content">{{ t('app.login') }}</h1>
          <p class="text-base-content/70 mt-2">Welcome back to your community security dashboard</p>
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

          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-primary btn-lg w-full"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">🔑 {{ t('app.login') }}</span>
              <span v-else>Signing in...</span>
            </button>
          </div>
        </form>

        <!-- Links -->
        <div class="divider">OR</div>

        <div class="text-center space-y-3">
          <router-link to="/forgot" class="link link-primary hover:link-hover font-medium">
            🔗 {{ t('auth.forgot') }}
          </router-link>

          <div class="text-sm text-base-content/70">
            {{ t('auth.needAccount') }}
            <router-link to="/register" class="link link-accent hover:link-hover font-medium">
              {{ t('app.register') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
