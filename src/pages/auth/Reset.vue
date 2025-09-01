<script setup lang="ts">
import api from '@/lib/api'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
let new_password = ''
let msg = ''
let err = ''

async function reset() {
  err = ''
  msg = ''
  const uid = String(route.query.uid || '')
  const token = String(route.query.token || '')
  try {
    await api.post('/auth/password-reset/confirm', { uid, token, new_password })
    msg = t('auth.resetPassword')
    setTimeout(() => router.push('/login'), 1000)
  } catch {
    err = 'Invalid or expired link'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6">
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-3">
        <h2 class="card-title">{{ t('auth.resetPassword') }}</h2>
        <input v-model="new_password" type="password" :placeholder="t('auth.newPassword')" class="input input-bordered w-full" />
        <p v-if="msg" class="text-success">{{ msg }}</p>
        <p v-if="err" class="text-error">{{ err }}</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" @click="reset">{{ t('auth.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

