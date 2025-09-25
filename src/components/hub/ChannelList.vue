<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-base-content">{{ t('hub.channels.title') }}</h2>
      <span class="badge badge-outline badge-sm" :class="permissionClass">{{
        permissionLabel
      }}</span>
    </header>

    <div v-if="loading" class="space-y-2">
      <div
        v-for="index in 3"
        :key="`skeleton-${index}`"
        class="animate-pulse rounded-box bg-base-200 p-4"
      />
    </div>

    <ul v-else class="space-y-2">
      <li v-for="channel in channels" :key="channel.id">
        <button
          type="button"
          class="w-full rounded-box border border-base-200 bg-base-100 p-4 text-left shadow-sm transition hover:border-primary hover:shadow"
          :class="{ 'border-primary shadow-md': channel.id === activeId }"
          @click="emit('select', channel.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-base-content">{{ channel.name }}</h3>
              <p class="mt-1 text-sm text-base-content/70">{{ channel.description }}</p>
            </div>
            <span v-if="channel.unreadCount" class="badge badge-primary badge-sm">{{
              channel.unreadCount
            }}</span>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-base-content/60">
            <span class="inline-flex items-center gap-1">
              <span class="size-2 rounded-full" :class="statusIndicator(channel.id)" />
              {{ statusLabel(channel.id) }}
            </span>
            <span v-if="channel.memberCount" class="inline-flex items-center gap-1">
              <span aria-hidden="true">👥</span>
              {{ t('hub.channels.members', { count: channel.memberCount }) }}
            </span>
            <span v-if="channel.lastActivity" class="inline-flex items-center gap-1">
              <span aria-hidden="true">⏰</span>
              {{ formatRelative(channel.lastActivity) }}
            </span>
          </div>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HubChannel, WebSocketStatus } from '@/types/hub'
import { usePrefsStore } from '@/stores/hub/prefs'

const props = defineProps<{
  channels: HubChannel[]
  activeId: string | null
  loading: boolean
  statuses: Record<string, WebSocketStatus>
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const { t } = useI18n()
const prefsStore = usePrefsStore()

const permissionLabel = computed(() => {
  if (!prefsStore.pushSupported) return t('hub.push.unsupported')
  switch (prefsStore.permission) {
    case 'granted':
      return t('hub.push.enabled')
    case 'denied':
      return t('hub.push.blocked')
    case 'unsupported':
      return t('hub.push.unsupported')
    default:
      return t('hub.push.pending')
  }
})

const permissionClass = computed(() => {
  if (!prefsStore.pushSupported || prefsStore.permission === 'unsupported') return 'badge-ghost'
  if (prefsStore.permission === 'granted') return 'badge-success'
  if (prefsStore.permission === 'denied') return 'badge-error'
  return 'badge-warning'
})

const statusLabel = (channelId: string) => {
  const status = props.statuses[channelId] ?? 'offline'
  switch (status) {
    case 'online':
      return t('hub.status.online')
    case 'connecting':
      return t('hub.status.connecting')
    case 'reconnecting':
      return t('hub.status.reconnecting')
    default:
      return t('hub.status.offline')
  }
}

const statusIndicator = (channelId: string) => {
  const status = props.statuses[channelId]
  if (status === 'online') return 'bg-success'
  if (status === 'reconnecting') return 'bg-warning'
  if (status === 'connecting') return 'bg-primary'
  return 'bg-base-300'
}

const formatRelative = (timestamp: string | null | undefined) => {
  if (!timestamp) return t('hub.time.unknown')
  const then = new Date(timestamp)
  const diff = Date.now() - then.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return t('hub.time.now')
  if (minutes < 60) return t('hub.time.minutes', { count: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('hub.time.hours', { count: hours })
  const days = Math.round(hours / 24)
  return t('hub.time.days', { count: days })
}
</script>
