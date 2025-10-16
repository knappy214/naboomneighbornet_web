<template>
  <div class="monitoring-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold mb-6">{{ $t('monitoring.dashboard.title') }}</h1>

      <div class="flex flex-wrap gap-4 mb-6">
        <button class="btn btn-primary" @click="refreshAll" :disabled="isRefreshing">
          <svg
            v-if="isRefreshing"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ $t('monitoring.dashboard.refresh') }}
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
          {{ $t('monitoring.dashboard.export') }}
        </button>

        <button class="btn btn-ghost" @click="toggleAutoRefresh">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{
            autoRefresh
              ? $t('monitoring.dashboard.disableAutoRefresh')
              : $t('monitoring.dashboard.enableAutoRefresh')
          }}
        </button>
      </div>
    </div>

    <!-- Overall Status -->
    <div class="status-overview mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {{ $t('monitoring.dashboard.overallStatus') }}
          </h2>

          <div class="flex items-center gap-4 mb-4">
            <div class="badge badge-lg" :class="getStatusBadgeClass(healthDashboard.overallStatus)">
              {{ $t(`monitoring.status.${healthDashboard.overallStatus}`) }}
            </div>
            <div class="text-sm text-base-content/70">
              {{ $t('monitoring.dashboard.lastCheck') }}:
              {{ formatTime(healthDashboard.lastCheck) }}
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.totalChecks') }}</div>
              <div class="stat-value text-primary">{{ healthDashboard.totalChecks }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.healthy') }}</div>
              <div class="stat-value text-success">{{ healthDashboard.healthyChecks }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.degraded') }}</div>
              <div class="stat-value text-warning">{{ healthDashboard.degradedChecks }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.unhealthy') }}</div>
              <div class="stat-value text-error">{{ healthDashboard.unhealthyChecks }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="performance-metrics mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {{ $t('monitoring.dashboard.performanceMetrics') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.averageResponseTime') }}</div>
              <div class="stat-value text-info">
                {{ Math.round(healthDashboard.averageResponseTime) }}ms
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.uptime') }}</div>
              <div class="stat-value text-success">{{ healthDashboard.uptime.toFixed(2) }}%</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('monitoring.dashboard.performanceScore') }}</div>
              <div class="stat-value text-primary">{{ performanceScore }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Health Checks -->
    <div class="health-checks mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ $t('monitoring.dashboard.healthChecks') }}
          </h2>

          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>{{ $t('monitoring.dashboard.name') }}</th>
                  <th>{{ $t('monitoring.dashboard.status') }}</th>
                  <th>{{ $t('monitoring.dashboard.responseTime') }}</th>
                  <th>{{ $t('monitoring.dashboard.lastCheck') }}</th>
                  <th>{{ $t('monitoring.dashboard.message') }}</th>
                  <th>{{ $t('monitoring.dashboard.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="check in healthDashboard.checks" :key="check.id">
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ check.name }}</span>
                      <span v-if="isCriticalCheck(check.id)" class="badge badge-error badge-sm">
                        {{ $t('monitoring.dashboard.critical') }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="badge" :class="getStatusBadgeClass(check.status)">
                      {{ $t(`monitoring.status.${check.status}`) }}
                    </div>
                  </td>
                  <td>{{ Math.round(check.responseTime) }}ms</td>
                  <td>{{ formatTime(check.timestamp) }}</td>
                  <td>
                    <div class="max-w-xs truncate" :title="check.message">
                      {{ check.message || '-' }}
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-ghost btn-xs" @click="viewDetails(check)">
                        {{ $t('monitoring.dashboard.details') }}
                      </button>
                      <button class="btn btn-ghost btn-xs" @click="retryCheck(check.id)">
                        {{ $t('monitoring.dashboard.retry') }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Logs -->
    <div class="error-logs mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            {{ $t('monitoring.dashboard.recentErrors') }}
          </h2>

          <div v-if="recentErrors.length === 0" class="text-center text-base-content/70 py-8">
            {{ $t('monitoring.dashboard.noErrors') }}
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="error in recentErrors"
              :key="error.id"
              class="alert"
              :class="getErrorAlertClass(error.severity)"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <div class="font-medium">{{ error.message }}</div>
                <div class="text-sm opacity-70">
                  {{ formatTime(error.timestamp) }} • {{ error.component || 'Unknown' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics Chart -->
    <div class="performance-chart mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {{ $t('monitoring.dashboard.performanceChart') }}
          </h2>

          <div class="h-64 flex items-center justify-center text-base-content/70">
            <!-- Placeholder for chart - in a real implementation, you'd use a charting library -->
            <div class="text-center">
              <svg
                class="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>{{ $t('monitoring.dashboard.chartPlaceholder') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <dialog class="modal" :open="showDetailsModal">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-4">{{ $t('monitoring.dashboard.checkDetails') }}</h3>

        <div v-if="selectedCheck" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('monitoring.dashboard.name') }}</span>
              </label>
              <div class="text-base-content">{{ selectedCheck.name }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('monitoring.dashboard.status') }}</span>
              </label>
              <div class="badge" :class="getStatusBadgeClass(selectedCheck.status)">
                {{ $t(`monitoring.status.${selectedCheck.status}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('monitoring.dashboard.responseTime')
                }}</span>
              </label>
              <div class="text-base-content">{{ Math.round(selectedCheck.responseTime) }}ms</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('monitoring.dashboard.lastCheck')
                }}</span>
              </label>
              <div class="text-base-content">{{ formatTime(selectedCheck.timestamp) }}</div>
            </div>
          </div>

          <div v-if="selectedCheck.message">
            <label class="label">
              <span class="label-text font-medium">{{ $t('monitoring.dashboard.message') }}</span>
            </label>
            <div class="text-base-content">{{ selectedCheck.message }}</div>
          </div>

          <div v-if="selectedCheck.details && Object.keys(selectedCheck.details).length > 0">
            <label class="label">
              <span class="label-text font-medium">{{ $t('monitoring.dashboard.details') }}</span>
            </label>
            <pre class="bg-base-200 p-4 rounded-lg text-sm overflow-auto">{{
              JSON.stringify(selectedCheck.details, null, 2)
            }}</pre>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="closeDetailsModal">
            {{ $t('monitoring.dashboard.close') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHealthCheck } from '@/composables/useHealthCheck'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { usePerformanceMonitoring } from '@/composables/usePerformanceMonitoring'
import type { HealthCheckResult } from '@/composables/useHealthCheck'

const { t } = useI18n()
const {
  healthDashboard,
  isMonitoring,
  refreshAll: refreshHealthChecks,
  retryCheck: retryHealthCheck,
  getCriticalHealthChecks,
} = useHealthCheck()
const { recentErrors } = useErrorHandler()
const { performanceScore } = usePerformanceMonitoring()

// Local state
const isRefreshing = ref(false)
const autoRefresh = ref(false)
const showDetailsModal = ref(false)
const selectedCheck = ref<HealthCheckResult | null>(null)
let autoRefreshInterval: NodeJS.Timeout | null = null

// Computed properties
const criticalChecks = computed(() => getCriticalHealthChecks())

// Methods
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'healthy':
      return 'badge-success'
    case 'degraded':
      return 'badge-warning'
    case 'unhealthy':
      return 'badge-error'
    default:
      return 'badge-neutral'
  }
}

function getErrorAlertClass(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'alert-error'
    case 'high':
      return 'alert-error'
    case 'medium':
      return 'alert-warning'
    case 'low':
      return 'alert-info'
    default:
      return 'alert-neutral'
  }
}

function isCriticalCheck(checkId: string): boolean {
  return criticalChecks.value.some((check) => check.id === checkId)
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

async function refreshAll() {
  isRefreshing.value = true
  try {
    await refreshHealthChecks()
  } finally {
    isRefreshing.value = false
  }
}

function exportData() {
  const data = {
    healthDashboard: healthDashboard.value,
    recentErrors: recentErrors.value,
    timestamp: new Date().toISOString(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `monitoring-dashboard-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value

  if (autoRefresh.value) {
    autoRefreshInterval = setInterval(refreshAll, 30000) // Every 30 seconds
  } else {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }
}

function viewDetails(check: HealthCheckResult) {
  selectedCheck.value = check
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedCheck.value = null
}

async function retryCheck(checkId: string) {
  try {
    await retryHealthCheck(checkId)
  } catch (error) {
    console.error('Failed to retry health check:', error)
  }
}

// Lifecycle
onMounted(() => {
  refreshAll()
})

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})
</script>

<style scoped>
.monitoring-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply mb-8;
}

.status-overview {
  @apply mb-8;
}

.performance-metrics {
  @apply mb-8;
}

.health-checks {
  @apply mb-8;
}

.error-logs {
  @apply mb-8;
}

.performance-chart {
  @apply mb-8;
}

@media (max-width: 768px) {
  .monitoring-dashboard {
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
