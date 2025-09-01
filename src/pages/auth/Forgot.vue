<script setup lang="ts">
import api from '@/lib/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
let email = ''
let msg = ''
let err = ''

async function sendLink() {
  err = ''
  msg = ''
  try {
    await api.post('/auth/password-reset', { email })
    msg = t('auth.sendLink')
  } catch {
    err = 'Error'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6">
    <div class="card bg-base-100 shadow">
      <div class="card-body space-y-3">
        <h2 class="card-title">{{ t('auth.forgot') }}</h2>
        <input v-model="email" type="email" :placeholder="t('auth.email')" class="input input-bordered w-full" />
        <p v-if="msg" class="text-success">{{ msg }}</p>
        <p v-if="err" class="text-error">{{ err }}</p>
        <div class="card-actions justify-end">
          <button class="btn" @click="sendLink">{{ t('auth.sendLink') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

