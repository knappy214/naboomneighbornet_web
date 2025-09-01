<script setup lang="ts">
import api from '@/lib/api'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
let email = ''
let username = ''
let password = ''
let error = ''
let ok = ''

async function submit() {
  error = ''
  ok = ''
  try {
    await api.post('/auth/register', { email, username, password })
    ok = 'Registered. You can now log in.'
    setTimeout(() => router.push('/login'), 800)
  } catch (e: any) {
    error = e?.response?.data || 'Registration failed'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6">
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-3">
        <h2 class="card-title">{{ t('app.register') }}</h2>
        <input v-model="email" type="email" :placeholder="t('auth.email')" class="input input-bordered w-full" />
        <input v-model="username" type="text" placeholder="Username" class="input input-bordered w-full" />
        <input v-model="password" type="password" :placeholder="t('auth.password')" class="input input-bordered w-full" />
        <p v-if="error" class="text-error">{{ error }}</p>
        <p v-if="ok" class="text-success">{{ ok }}</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" @click="submit">{{ t('app.register') }}</button>
        </div>
        <div class="text-sm opacity-70">
          {{ t('auth.haveAccount') }} <router-link to="/login" class="link">{{ t('app.login') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

