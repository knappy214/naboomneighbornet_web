<script setup lang="ts">
import api from '@/lib/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useAuthStore()
const { t } = useI18n()
let email = ''
let password = ''
let error = ''

async function submit() {
  error = ''
  try {
    const { data } = await api.post('/auth/jwt/create', { email, password })
    store.setAccessToken(data.access)
    store.setRefreshToken(data.refresh)
    router.push('/')
  } catch (e: any) {
    error = e?.response?.data?.detail || 'Login failed'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6">
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-3">
        <h2 class="card-title">{{ t('app.login') }}</h2>
        <input v-model="email" type="email" :placeholder="t('auth.email')" class="input input-bordered w-full" />
        <input v-model="password" type="password" :placeholder="t('auth.password')" class="input input-bordered w-full" />
        <p v-if="error" class="text-error">{{ error }}</p>
        <div class="card-actions justify-between">
          <router-link class="link" to="/forgot">{{ t('auth.forgot') }}</router-link>
          <button class="btn btn-primary" @click="submit">{{ t('app.login') }}</button>
        </div>
        <div class="text-sm opacity-70">
          {{ t('auth.needAccount') }} <router-link to="/register" class="link">{{ t('app.register') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

