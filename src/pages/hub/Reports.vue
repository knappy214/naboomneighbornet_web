<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.reports.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.reports.pageSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          {{ t('hub.actions.refresh') }}
        </button>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-outline btn-sm">
            {{ t('hub.reports.filterBy') }}: {{ filterLabel }}
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a @click="setFilter('all')">{{ t('hub.reports.filters.all') }}</a>
            </li>
            <li>
              <a @click="setFilter('pending')">{{ t('hub.reports.filters.pending') }}</a>
            </li>
            <li>
              <a @click="setFilter('approved')">{{ t('hub.reports.filters.approved') }}</a>
            </li>
            <li>
              <a @click="setFilter('rejected')">{{ t('hub.reports.filters.rejected') }}</a>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-base-content">
          {{ t('hub.reports.reports') }}
        </h2>
        <span class="badge badge-primary">{{ filteredReports.length }}</span>
      </div>

      <div v-if="filteredReports.length === 0" class="text-center py-8 text-base-content/60">
        <p>{{ t('hub.reports.noReports') }}</p>
      </div>

      <div v-else class="space-y-3">
        <ReportCard
          v-for="report in filteredReports"
          :key="report.id"
          :report="report"
          @handle-report="handleReport"
          @view-content="viewContent"
        />
      </div>
    </div>

    <!-- View Content Modal -->
    <div v-if="selectedContent" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="text-lg font-bold mb-4">{{ t('hub.reports.viewContent') }}</h3>

        <div class="space-y-4">
          <div v-if="selectedContent.type === 'thread'">
            <h4 class="font-semibold">{{ selectedContent.title }}</h4>
            <p class="text-sm text-base-content/70">{{ selectedContent.content }}</p>
          </div>
          <div v-else-if="selectedContent.type === 'post'">
            <p class="text-sm text-base-content/70">{{ selectedContent.content }}</p>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="selectedContent = null">
            {{ t('hub.actions.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ReportCard from '@/components/hub/ReportCard.vue'
import * as communityHubAPI from '@/services/communityHub'
import type { Report } from '@/services/communityHub'

const { t } = useI18n()

const reports = ref<Report[]>([])
const loading = ref(false)
const filter = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')
const selectedContent = ref<{ type: string; title?: string; content: string } | null>(null)

const filteredReports = computed(() => {
  if (filter.value === 'all') return reports.value

  return reports.value.filter((report) => {
    const status = (report as any).status || 'pending'
    return status === filter.value
  })
})

const filterLabel = computed(() => {
  return t(`hub.reports.filters.${filter.value}`)
})

onMounted(async () => {
  await loadReports()
})

const loadReports = async () => {
  loading.value = true
  try {
    reports.value = await communityHubAPI.getReports()
  } catch (error) {
    console.error('Failed to load reports:', error)
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await loadReports()
}

const setFilter = (newFilter: 'all' | 'pending' | 'approved' | 'rejected') => {
  filter.value = newFilter
}

const handleReport = async (reportId: number, action: 'approved' | 'rejected') => {
  try {
    // In a real implementation, you'd have an API to handle reports
    console.log(`Handling report ${reportId} as ${action}`)

    // Update local state
    const report = reports.value.find((r) => r.id === reportId)
    if (report) {
      ;(report as any).status = action
    }
  } catch (error) {
    console.error('Failed to handle report:', error)
  }
}

const viewContent = (report: Report) => {
  // In a real implementation, you'd fetch the actual content
  selectedContent.value = {
    type: report.post ? 'post' : 'thread',
    title: report.post ? 'Post' : 'Thread',
    content: `Content for ${report.post ? 'post' : 'thread'} ${report.post || report.thread}`,
  }
}
</script>
