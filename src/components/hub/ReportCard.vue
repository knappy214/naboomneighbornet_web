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
              {{ formatRelativeTime(report.created_at) }}
            </span>
          </div>

          <h3 class="text-sm font-semibold text-base-content mb-1">
            {{ t(`hub.reports.reasons.${report.reason}`) }}
          </h3>

          <p class="text-sm text-base-content/70 mb-3">
            {{ report.description }}
          </p>

          <div class="flex flex-wrap gap-2 text-xs text-base-content/60">
            <span v-if="report.channel">
              {{ t('hub.reports.channel') }}: #{{ report.channel }}
            </span>
            <span v-if="report.thread"> {{ t('hub.reports.thread') }}: {{ report.thread }} </span>
            <span v-if="report.post"> {{ t('hub.reports.post') }}: {{ report.post }} </span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <button
            v-if="report.status === 'pending'"
            class="btn btn-success btn-sm"
            @click="handleReport('approved')"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.reports.approve') }}
          </button>

          <button
            v-if="report.status === 'pending'"
            class="btn btn-error btn-sm"
            @click="handleReport('rejected')"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.reports.reject') }}
          </button>

          <button class="btn btn-ghost btn-sm" @click="$emit('viewContent', report)">
            {{ t('hub.reports.viewContent') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Report } from '@/services/communityHub'

interface Props {
  report: Report & { status?: 'pending' | 'approved' | 'rejected' }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  handleReport: [reportId: number, action: 'approved' | 'rejected']
  viewContent: [report: Report]
}>()

const { t } = useI18n()
const loading = ref(false)

const statusBadge = computed(() => {
  switch (props.report.status) {
    case 'approved':
      return 'badge-success'
    case 'rejected':
      return 'badge-error'
    default:
      return 'badge-warning'
  }
})

const statusLabel = computed(() => {
  switch (props.report.status) {
    case 'approved':
      return t('hub.reports.status.approved')
    case 'rejected':
      return t('hub.reports.status.rejected')
    default:
      return t('hub.reports.status.pending')
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

const handleReport = async (action: 'approved' | 'rejected') => {
  loading.value = true
  try {
    emit('handleReport', props.report.id, action)
  } finally {
    loading.value = false
  }
}
</script>
