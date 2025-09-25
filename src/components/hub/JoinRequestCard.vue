<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge" :class="statusBadge">
              {{ statusLabel }}
            </span>
            <span class="text-xs text-base-content/60">
              {{ formatRelativeTime(request.created_at) }}
            </span>
          </div>

          <h3 class="text-sm font-semibold text-base-content mb-1">
            {{ t('hub.joinRequests.requestFrom', { user: request.user }) }}
          </h3>

          <p v-if="request.message" class="text-sm text-base-content/70 mb-3">
            "{{ request.message }}"
          </p>

          <div class="text-xs text-base-content/60">
            {{ t('hub.joinRequests.channel') }}: #{{ request.channel }}
          </div>
        </div>

        <div v-if="request.status === 'pending'" class="flex flex-col gap-2">
          <button
            class="btn btn-success btn-sm"
            @click="handleRequest('approved')"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.joinRequests.approve') }}
          </button>

          <button
            class="btn btn-error btn-sm"
            @click="handleRequest('declined')"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.joinRequests.decline') }}
          </button>
        </div>

        <div v-else class="text-sm text-base-content/60">
          {{ t(`hub.joinRequests.status.${request.status}`) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { JoinRequest } from '@/services/communityHub'

interface Props {
  request: JoinRequest
}

const props = defineProps<Props>()

const emit = defineEmits<{
  handleRequest: [requestId: number, action: 'approved' | 'declined']
}>()

const { t } = useI18n()
const loading = ref(false)

const statusBadge = computed(() => {
  switch (props.request.status) {
    case 'approved':
      return 'badge-success'
    case 'declined':
      return 'badge-error'
    default:
      return 'badge-warning'
  }
})

const statusLabel = computed(() => {
  switch (props.request.status) {
    case 'approved':
      return t('hub.joinRequests.status.approved')
    case 'declined':
      return t('hub.joinRequests.status.declined')
    default:
      return t('hub.joinRequests.status.pending')
  }
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

const handleRequest = async (action: 'approved' | 'declined') => {
  loading.value = true
  try {
    emit('handleRequest', props.request.id, action)
  } finally {
    loading.value = false
  }
}
</script>
