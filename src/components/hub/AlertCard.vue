<template>
  <div class="alert" :class="alertClass">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg v-if="alert.kind === 'alert'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold">
            {{ t('hub.alerts.urgent') }}
          </h3>
          <span class="text-xs opacity-75">
            {{ formatRelativeTime(alert.created_at) }}
          </span>
        </div>
        <p class="mt-1 text-sm">
          {{ alert.content }}
        </p>
        <div v-if="alert.thread" class="mt-2">
          <button class="btn btn-ghost btn-xs" @click="$emit('viewThread', alert.thread)">
            {{ t('hub.alerts.viewThread') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Alert } from '@/services/communityHub'

interface Props {
  alert: Alert
}

defineProps<Props>()

defineEmits<{
  viewThread: [threadId: number]
}>()

const { t } = useI18n()

const alertClass = computed(() => {
  // Determine alert styling based on content or type
  const content = props.alert.content.toLowerCase()

  if (content.includes('urgent') || content.includes('emergency')) {
    return 'alert-error'
  }
  if (content.includes('warning') || content.includes('caution')) {
    return 'alert-warning'
  }
  if (content.includes('info') || content.includes('notice')) {
    return 'alert-info'
  }

  return 'alert-warning' // Default to warning for alerts
})

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
