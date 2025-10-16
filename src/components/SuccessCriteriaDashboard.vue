<template>
  <div class="success-criteria-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold mb-6">{{ $t('successCriteria.dashboard.title') }}</h1>

      <div class="flex flex-wrap gap-4 mb-6">
        <button class="btn btn-primary" @click="startMonitoring" :disabled="isMonitoring">
          <svg
            v-if="isMonitoring"
            class="w-4 h-4 mr-2 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{
            isMonitoring
              ? $t('successCriteria.dashboard.monitoring')
              : $t('successCriteria.dashboard.startMonitoring')
          }}
        </button>

        <button class="btn btn-outline" @click="stopMonitoring" :disabled="!isMonitoring">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
          </svg>
          {{ $t('successCriteria.dashboard.stopMonitoring') }}
        </button>

        <button class="btn btn-outline" @click="exportData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {{ $t('successCriteria.dashboard.export') }}
        </button>

        <button class="btn btn-ghost" @click="refreshData">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ $t('successCriteria.dashboard.refresh') }}
        </button>
      </div>
    </div>

    <!-- Overall Status -->
    <div class="overall-status mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            {{ $t('successCriteria.dashboard.overallStatus') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="stat">
              <div class="stat-title">{{ $t('successCriteria.dashboard.overallScore') }}</div>
              <div class="stat-value text-4xl" :class="getOverallScoreClass()">
                {{ overallScore.toFixed(1) }}%
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('successCriteria.dashboard.passing') }}</div>
              <div class="stat-value text-success">{{ passingCriteriaCount }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('successCriteria.dashboard.warning') }}</div>
              <div class="stat-value text-warning">{{ warningCriteriaCount }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('successCriteria.dashboard.failing') }}</div>
              <div class="stat-value text-error">{{ failingCriteriaCount }}</div>
            </div>
          </div>

          <div class="mt-4">
            <div class="badge badge-lg" :class="getOverallStatusBadgeClass()">
              {{ $t(`successCriteria.status.${overallStatus}`) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Criteria List -->
    <div class="criteria-list mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            {{ $t('successCriteria.dashboard.successCriteria') }}
          </h2>

          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>{{ $t('successCriteria.dashboard.criterion') }}</th>
                  <th>{{ $t('successCriteria.dashboard.currentValue') }}</th>
                  <th>{{ $t('successCriteria.dashboard.target') }}</th>
                  <th>{{ $t('successCriteria.dashboard.status') }}</th>
                  <th>{{ $t('successCriteria.dashboard.lastUpdated') }}</th>
                  <th>{{ $t('successCriteria.dashboard.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="criterion in criteria" :key="criterion.id">
                  <td>
                    <div>
                      <div class="font-bold">{{ criterion.name }}</div>
                      <div class="text-sm text-base-content/70">{{ criterion.description }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="font-mono">
                      {{ formatValue(criterion.currentValue) }} {{ criterion.unit }}
                    </div>
                  </td>
                  <td>
                    <div class="font-mono">
                      {{ formatValue(criterion.target) }} {{ criterion.unit }}
                    </div>
                  </td>
                  <td>
                    <div class="badge" :class="getStatusBadgeClass(criterion.status)">
                      {{ $t(`successCriteria.status.${criterion.status}`) }}
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      {{ formatTime(criterion.lastUpdated) }}
                    </div>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-ghost" @click="viewCriterionDetails(criterion)">
                      {{ $t('successCriteria.dashboard.details') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Criterion Details Modal -->
    <dialog class="modal" :open="showDetailsModal">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-4">
          {{ $t('successCriteria.dashboard.criterionDetails') }}
        </h3>

        <div v-if="selectedCriterion" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('successCriteria.dashboard.name')
                }}</span>
              </label>
              <div class="text-base-content">{{ selectedCriterion.name }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('successCriteria.dashboard.id') }}</span>
              </label>
              <div class="text-base-content font-mono">{{ selectedCriterion.id }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('successCriteria.dashboard.currentValue')
                }}</span>
              </label>
              <div class="text-base-content font-mono">
                {{ formatValue(selectedCriterion.currentValue) }} {{ selectedCriterion.unit }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('successCriteria.dashboard.target')
                }}</span>
              </label>
              <div class="text-base-content font-mono">
                {{ formatValue(selectedCriterion.target) }} {{ selectedCriterion.unit }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('successCriteria.dashboard.status')
                }}</span>
              </label>
              <div class="badge" :class="getStatusBadgeClass(selectedCriterion.status)">
                {{ $t(`successCriteria.status.${selectedCriterion.status}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('successCriteria.dashboard.threshold')
                }}</span>
              </label>
              <div class="text-base-content">
                {{ $t(`successCriteria.threshold.${selectedCriterion.threshold}`) }}
              </div>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{
                $t('successCriteria.dashboard.description')
              }}</span>
            </label>
            <div class="text-base-content">{{ selectedCriterion.description }}</div>
          </div>

          <div v-if="selectedCriterion.history.length > 0">
            <label class="label">
              <span class="label-text font-medium">{{
                $t('successCriteria.dashboard.history')
              }}</span>
            </label>
            <div class="h-64 overflow-y-auto">
              <div class="space-y-2">
                <div
                  v-for="point in selectedCriterion.history.slice(-20)"
                  :key="point.timestamp.getTime()"
                  class="flex items-center justify-between p-2 bg-base-200 rounded"
                >
                  <div class="flex items-center gap-2">
                    <div class="badge badge-sm" :class="getStatusBadgeClass(point.status)">
                      {{ $t(`successCriteria.status.${point.status}`) }}
                    </div>
                    <span class="font-mono"
                      >{{ formatValue(point.value) }} {{ selectedCriterion.unit }}</span
                    >
                  </div>
                  <div class="text-sm text-base-content/70">
                    {{ formatTime(point.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="closeDetailsModal">
            {{ $t('successCriteria.dashboard.close') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSuccessCriteria, type SuccessCriterion } from '@/composables/useSuccessCriteria'

const { t } = useI18n()
const {
  criteria,
  isMonitoring,
  overallStatus,
  overallScore,
  passingCriteriaCount,
  failingCriteriaCount,
  warningCriteriaCount,
  startMonitoring,
  stopMonitoring,
  updateAllMeasurements,
  exportSuccessCriteriaData,
} = useSuccessCriteria()

// Local state
const showDetailsModal = ref(false)
const selectedCriterion = ref<SuccessCriterion | null>(null)

// Methods
function getOverallStatusBadgeClass(): string {
  switch (overallStatus.value) {
    case 'passing':
      return 'badge-success'
    case 'warning':
      return 'badge-warning'
    case 'failing':
      return 'badge-error'
    default:
      return 'badge-neutral'
  }
}

function getOverallScoreClass(): string {
  if (overallScore.value >= 90) return 'text-success'
  if (overallScore.value >= 70) return 'text-warning'
  return 'text-error'
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'passing':
      return 'badge-success'
    case 'warning':
      return 'badge-warning'
    case 'failing':
      return 'badge-error'
    case 'unknown':
    default:
      return 'badge-neutral'
  }
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  } else if (value < 1) {
    return value.toFixed(3)
  } else {
    return value.toFixed(1)
  }
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function viewCriterionDetails(criterion: SuccessCriterion) {
  selectedCriterion.value = criterion
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedCriterion.value = null
}

function exportData() {
  const data = exportSuccessCriteriaData('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `success-criteria-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function refreshData() {
  updateAllMeasurements()
}

// Lifecycle
onMounted(() => {
  // Initialize if needed
})
</script>

<style scoped>
.success-criteria-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply mb-8;
}

.overall-status {
  @apply mb-8;
}

.criteria-list {
  @apply mb-8;
}

@media (max-width: 768px) {
  .success-criteria-dashboard {
    @apply p-4;
  }

  .grid {
    @apply grid-cols-1;
  }

  .table {
    @apply text-sm;
  }
}
</style>
