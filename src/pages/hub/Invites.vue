<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.invites.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.invites.pageSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          {{ t('hub.actions.refresh') }}
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="showInviteForm = true">
          {{ t('hub.invites.sendInvite') }}
        </button>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-base-content">
          {{ t('hub.invites.sentInvites') }}
        </h2>

        <div v-if="invites.length === 0" class="text-center py-8 text-base-content/60">
          <p>{{ t('hub.invites.noInvites') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="invite in invites"
            :key="invite.id"
            class="card bg-base-100 shadow-sm border border-base-200"
          >
            <div class="card-body p-4">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-base-content">
                    {{ invite.email }}
                  </h3>
                  <p class="text-xs text-base-content/60 mt-1">
                    {{ t('hub.invites.role') }}: {{ t(`hub.invites.roles.${invite.role}`) }}
                  </p>
                  <p class="text-xs text-base-content/60">
                    {{ formatRelativeTime(invite.created_at) }}
                  </p>
                </div>
                <div class="badge badge-outline">
                  {{ t('hub.invites.status.sent') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-base-content">
          {{ t('hub.invites.sendNew') }}
        </h2>

        <InviteForm
          v-if="showInviteForm"
          :channel-id="selectedChannelId"
          @invite="handleInvite"
          @cancel="showInviteForm = false"
        />

        <div v-else class="text-center py-8 text-base-content/60">
          <p>{{ t('hub.invites.clickToSend') }}</p>
          <button type="button" class="btn btn-primary btn-sm mt-2" @click="showInviteForm = true">
            {{ t('hub.invites.sendInvite') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InviteForm from '@/components/hub/InviteForm.vue'
import * as communityHubAPI from '@/services/communityHub'
import type { ChannelInvite } from '@/services/communityHub'

const { t } = useI18n()

const invites = ref<ChannelInvite[]>([])
const loading = ref(false)
const showInviteForm = ref(false)
const selectedChannelId = ref(1) // In a real app, this would be selected from available channels

onMounted(async () => {
  await loadInvites()
})

const loadInvites = async () => {
  loading.value = true
  try {
    invites.value = await communityHubAPI.getInvites()
  } catch (error) {
    console.error('Failed to load invites:', error)
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await loadInvites()
}

const handleInvite = async (data: {
  channel: number
  email: string
  role: 'member' | 'moderator' | 'manager'
}) => {
  try {
    const invite = await communityHubAPI.createInvite(data)
    invites.value.unshift(invite)
    showInviteForm.value = false
  } catch (error) {
    console.error('Failed to send invite:', error)
  }
}

const formatRelativeTime = (timestamp: string) => {
  const now = new Date()
  const then = new Date(timestamp)
  const diff = now.getTime() - then.getTime()

  const minutes = Math.round(diff / (1000 * 60))
  if (minutes < 1) return t('hub.time.now')
  if (minutes < 60) return t('hub.time.minutes', { count: minutes })

  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('hub.time.hours', { count: hours })

  const days = Math.round(hours / 24)
  return t('hub.time.days', { count: days })
}
</script>
