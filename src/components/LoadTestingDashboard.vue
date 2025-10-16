<template>
  <div class="load-testing-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold mb-6">{{ $t('loadTesting.dashboard.title') }}</h1>

      <div class="flex flex-wrap gap-4 mb-6">
        <button class="btn btn-primary" @click="runLoadTest" :disabled="isRunning">
          <svg
            v-if="isRunning"
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {{ $t('loadTesting.dashboard.runLoadTest') }}
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
          {{ $t('loadTesting.dashboard.export') }}
        </button>

        <button class="btn btn-ghost" @click="clearAll">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {{ $t('loadTesting.dashboard.clearAll') }}
        </button>
      </div>
    </div>

    <!-- Load Test Configuration -->
    <div class="load-test-config mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ $t('loadTesting.dashboard.configuration') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('loadTesting.dashboard.concurrentUsers') }}</span>
              </label>
              <input
                v-model="config.concurrentUsers"
                type="number"
                class="input input-bordered"
                min="1"
                max="1000"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('loadTesting.dashboard.rampUpTime') }} (s)</span>
              </label>
              <input
                v-model="config.rampUpTime"
                type="number"
                class="input input-bordered"
                min="1"
                max="300"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('loadTesting.dashboard.testDuration') }} (s)</span>
              </label>
              <input
                v-model="config.testDuration"
                type="number"
                class="input input-bordered"
                min="10"
                max="3600"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('loadTesting.dashboard.thinkTime') }} (ms)</span>
              </label>
              <input
                v-model="config.thinkTime"
                type="number"
                class="input input-bordered"
                min="0"
                max="10000"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('loadTesting.dashboard.errorThreshold') }} (%)</span>
              </label>
              <input
                v-model="config.errorThreshold"
                type="number"
                class="input input-bordered"
                min="0"
                max="100"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('loadTesting.dashboard.testSuite') }}</span>
              </label>
              <select v-model="selectedTestSuite" class="select select-bordered">
                <option value="">{{ $t('loadTesting.dashboard.selectSuite') }}</option>
                <option v-for="suite in testSuites" :key="suite.id" :value="suite.id">
                  {{ suite.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Metrics -->
    <div class="real-time-metrics mb-8">
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
            {{ $t('loadTesting.dashboard.realTimeMetrics') }}
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat">
              <div class="stat-title">{{ $t('loadTesting.dashboard.totalRequests') }}</div>
              <div class="stat-value text-primary">{{ metrics.totalRequests }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('loadTesting.dashboard.successfulRequests') }}</div>
              <div class="stat-value text-success">{{ metrics.successfulRequests }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('loadTesting.dashboard.failedRequests') }}</div>
              <div class="stat-value text-error">{{ metrics.failedRequests }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('loadTesting.dashboard.errorRate') }}</div>
              <div class="stat-value text-warning">{{ metrics.errorRate.toFixed(2) }}%</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="stat">
              <div class="stat-title">{{ $t('loadTesting.dashboard.averageResponseTime') }}</div>
              <div class="stat-value text-info">{{ metrics.averageResponseTime.toFixed(0) }}ms</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('loadTesting.dashboard.throughput') }}</div>
              <div class="stat-value text-info">{{ metrics.throughput.toFixed(2) }} req/s</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Response Time Percentiles -->
    <div class="response-time-percentiles mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ $t('loadTesting.dashboard.responseTimePercentiles') }}
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="stat">
              <div class="stat-title">Min</div>
              <div class="stat-value text-sm">{{ metrics.minResponseTime.toFixed(0) }}ms</div>
            </div>
            <div class="stat">
              <div class="stat-title">P50</div>
              <div class="stat-value text-sm">{{ metrics.p50ResponseTime.toFixed(0) }}ms</div>
            </div>
            <div class="stat">
              <div class="stat-title">P90</div>
              <div class="stat-value text-sm">{{ metrics.p90ResponseTime.toFixed(0) }}ms</div>
            </div>
            <div class="stat">
              <div class="stat-title">P95</div>
              <div class="stat-value text-sm">{{ metrics.p95ResponseTime.toFixed(0) }}ms</div>
            </div>
            <div class="stat">
              <div class="stat-title">P99</div>
              <div class="stat-value text-sm">{{ metrics.p99ResponseTime.toFixed(0) }}ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Results -->
    <div class="test-results mb-8">
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
            {{ $t('loadTesting.dashboard.testResults') }}
          </h2>

          <div v-if="testResults.length === 0" class="text-center text-base-content/70 py-8">
            {{ $t('loadTesting.dashboard.noTestResults') }}
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>{{ $t('loadTesting.dashboard.scenarioName') }}</th>
                  <th>{{ $t('loadTesting.dashboard.status') }}</th>
                  <th>{{ $t('loadTesting.dashboard.duration') }}</th>
                  <th>{{ $t('loadTesting.dashboard.responseTime') }}</th>
                  <th>{{ $t('loadTesting.dashboard.timestamp') }}</th>
                  <th>{{ $t('loadTesting.dashboard.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in testResults" :key="result.scenarioId">
                  <td class="font-medium">{{ result.scenarioName }}</td>
                  <td>
                    <div class="badge" :class="getResultStatusBadgeClass(result.status)">
                      {{ $t(`loadTesting.status.${result.status}`) }}
                    </div>
                  </td>
                  <td>{{ formatDuration(result.duration) }}</td>
                  <td>{{ result.metrics.responseTime.toFixed(0) }}ms</td>
                  <td>{{ formatTime(result.timestamp) }}</td>
                  <td>
                    <button class="btn btn-sm btn-ghost" @click="viewResultDetails(result)">
                      {{ $t('loadTesting.dashboard.details') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Details Modal -->
    <dialog class="modal" :open="showResultDetailsModal">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-4">{{ $t('loadTesting.dashboard.resultDetails') }}</h3>

        <div v-if="selectedResult" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.scenarioName')
                }}</span>
              </label>
              <div class="text-base-content">{{ selectedResult.scenarioName }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('loadTesting.dashboard.status') }}</span>
              </label>
              <div class="badge" :class="getResultStatusBadgeClass(selectedResult.status)">
                {{ $t(`loadTesting.status.${selectedResult.status}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.duration')
                }}</span>
              </label>
              <div class="text-base-content">{{ formatDuration(selectedResult.duration) }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.timestamp')
                }}</span>
              </label>
              <div class="text-base-content">{{ formatTime(selectedResult.timestamp) }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.responseTime')
                }}</span>
              </label>
              <div class="text-base-content">
                {{ selectedResult.metrics.responseTime.toFixed(0) }}ms
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.throughput')
                }}</span>
              </label>
              <div class="text-base-content">
                {{ selectedResult.metrics.throughput.toFixed(2) }} req/s
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.errorRate')
                }}</span>
              </label>
              <div class="text-base-content">
                {{ selectedResult.metrics.errorRate.toFixed(2) }}%
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{
                  $t('loadTesting.dashboard.memoryUsage')
                }}</span>
              </label>
              <div class="text-base-content">
                {{ selectedResult.metrics.memoryUsage.toFixed(2) }} MB
              </div>
            </div>
          </div>

          <div v-if="selectedResult.error">
            <label class="label">
              <span class="label-text font-medium">{{ $t('loadTesting.dashboard.error') }}</span>
            </label>
            <div class="alert alert-error">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{{ selectedResult.error }}</span>
            </div>
          </div>

          <div v-if="selectedResult.steps.length > 0">
            <label class="label">
              <span class="label-text font-medium">{{ $t('loadTesting.dashboard.steps') }}</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="(step, index) in selectedResult.steps"
                :key="step.id"
                class="flex items-center gap-2 p-2 bg-base-200 rounded"
              >
                <div class="badge" :class="getStepStatusBadgeClass(step.status)">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <div class="font-medium">{{ step.name }}</div>
                  <div class="text-sm text-base-content/70">
                    {{ $t(`loadTesting.stepType.${step.type}`) }}
                  </div>
                  <div v-if="step.duration" class="text-sm text-base-content/50">
                    {{ formatDuration(step.duration) }}
                  </div>
                </div>
                <div class="badge" :class="getStepStatusBadgeClass(step.status)">
                  {{ $t(`loadTesting.status.${step.status}`) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="closeResultDetailsModal">
            {{ $t('loadTesting.dashboard.close') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLoadTesting, type LoadTestResult } from '@/composables/useLoadTesting'

const { t } = useI18n()
const {
  testSuites,
  currentScenario,
  isRunning,
  testResults,
  metrics,
  totalScenarios,
  completedScenarios,
  failedScenarios,
  successRate,
  averageResponseTime,
  throughput,
  errorRate,
  runLoadTestSuite,
  clearTestResults,
  exportTestData,
} = useLoadTesting()

// Local state
const showResultDetailsModal = ref(false)
const selectedResult = ref<LoadTestResult | null>(null)
const selectedTestSuite = ref('')

// Configuration
const config = ref({
  concurrentUsers: 100,
  rampUpTime: 60,
  testDuration: 300,
  thinkTime: 1000,
  errorThreshold: 5,
})

// Methods
function getResultStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'badge-success'
    case 'failed':
      return 'badge-error'
    case 'skipped':
      return 'badge-info'
    default:
      return 'badge-neutral'
  }
}

function getStepStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'badge-success'
    case 'failed':
      return 'badge-error'
    case 'skipped':
      return 'badge-info'
    case 'pending':
    default:
      return 'badge-neutral'
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

function formatDuration(duration: number): string {
  if (duration < 1000) {
    return `${Math.round(duration)}ms`
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`
  } else {
    return `${(duration / 60000).toFixed(1)}m`
  }
}

async function runLoadTest() {
  if (!selectedTestSuite.value) {
    alert('Please select a test suite')
    return
  }

  // Update test suite configuration
  const suite = testSuites.value.find((s) => s.id === selectedTestSuite.value)
  if (suite) {
    suite.config = { ...config.value }
  }

  try {
    await runLoadTestSuite(selectedTestSuite.value)
  } catch (error) {
    console.error('Load test failed:', error)
  }
}

function exportData() {
  const data = exportTestData('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `load-test-results-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function clearAll() {
  clearTestResults()
}

function viewResultDetails(result: LoadTestResult) {
  selectedResult.value = result
  showResultDetailsModal.value = true
}

function closeResultDetailsModal() {
  showResultDetailsModal.value = false
  selectedResult.value = null
}

// Lifecycle
onMounted(() => {
  // Initialize if needed
})
</script>

<style scoped>
.load-testing-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply mb-8;
}

.load-test-config {
  @apply mb-8;
}

.real-time-metrics {
  @apply mb-8;
}

.response-time-percentiles {
  @apply mb-8;
}

.test-results {
  @apply mb-8;
}

@media (max-width: 768px) {
  .load-testing-dashboard {
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
