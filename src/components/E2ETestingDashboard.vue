<template>
  <div class="e2e-testing-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold mb-6">{{ $t('e2e.dashboard.title') }}</h1>

      <div class="flex flex-wrap gap-4 mb-6">
        <button class="btn btn-primary" @click="runAllTests" :disabled="isRunningTests">
          <svg
            v-if="isRunningTests"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ $t('e2e.dashboard.runTests') }}
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
          {{ $t('e2e.dashboard.export') }}
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
          {{ $t('e2e.dashboard.clearAll') }}
        </button>
      </div>
    </div>

    <!-- Test Overview -->
    <div class="test-overview mb-8">
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
            {{ $t('e2e.dashboard.testOverview') }}
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat">
              <div class="stat-title">{{ $t('e2e.dashboard.totalScenarios') }}</div>
              <div class="stat-value text-primary">{{ totalScenarios }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('e2e.dashboard.passed') }}</div>
              <div class="stat-value text-success">{{ passedScenarios }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('e2e.dashboard.failed') }}</div>
              <div class="stat-value text-error">{{ failedScenarios }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('e2e.dashboard.successRate') }}</div>
              <div class="stat-value text-info">{{ successRate.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Suites -->
    <div class="test-suites mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {{ $t('e2e.dashboard.testSuites') }}
          </h2>

          <div v-if="testSuites.length === 0" class="text-center text-base-content/70 py-8">
            {{ $t('e2e.dashboard.noTestSuites') }}
          </div>

          <div v-else class="space-y-4">
            <div v-for="suite in testSuites" :key="suite.id" class="card bg-base-200 shadow-sm">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="card-title">{{ suite.name }}</h3>
                  <div class="flex gap-2">
                    <div class="badge" :class="getSuiteStatusBadgeClass(suite.status)">
                      {{ $t(`e2e.status.${suite.status}`) }}
                    </div>
                    <button
                      class="btn btn-sm btn-primary"
                      @click="runTestSuite(suite.id)"
                      :disabled="isRunningTests"
                    >
                      {{ $t('e2e.dashboard.runSuite') }}
                    </button>
                  </div>
                </div>

                <p class="text-sm text-base-content/70 mb-4">{{ suite.description }}</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div class="stat">
                    <div class="stat-title">{{ $t('e2e.dashboard.scenarios') }}</div>
                    <div class="stat-value text-lg">{{ suite.scenarios.length }}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">{{ $t('e2e.dashboard.results') }}</div>
                    <div class="stat-value text-lg">{{ suite.results.length }}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">{{ $t('e2e.dashboard.duration') }}</div>
                    <div class="stat-value text-lg">
                      {{ suite.duration ? formatDuration(suite.duration) : '-' }}
                    </div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">{{ $t('e2e.dashboard.lastRun') }}</div>
                    <div class="stat-value text-lg">
                      {{ suite.endTime ? formatTime(suite.endTime) : '-' }}
                    </div>
                  </div>
                </div>

                <div v-if="suite.scenarios.length > 0" class="space-y-2">
                  <h4 class="font-semibold">{{ $t('e2e.dashboard.scenarios') }}</h4>
                  <div
                    v-for="scenario in suite.scenarios"
                    :key="scenario.id"
                    class="flex items-center justify-between p-2 bg-base-100 rounded"
                  >
                    <div class="flex items-center gap-2">
                      <div class="badge" :class="getScenarioStatusBadgeClass(scenario.status)">
                        {{ $t(`e2e.status.${scenario.status}`) }}
                      </div>
                      <div class="badge badge-outline">
                        {{ $t(`e2e.category.${scenario.category}`) }}
                      </div>
                      <span class="font-medium">{{ scenario.name }}</span>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="btn btn-sm btn-ghost"
                        @click="runScenario(scenario.id)"
                        :disabled="isRunningTests"
                      >
                        {{ $t('e2e.dashboard.run') }}
                      </button>
                      <button class="btn btn-sm btn-ghost" @click="viewScenarioDetails(scenario)">
                        {{ $t('e2e.dashboard.details') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
            {{ $t('e2e.dashboard.testResults') }}
          </h2>

          <div class="flex gap-2 mb-4">
            <select v-model="selectedStatus" class="select select-bordered select-sm">
              <option value="">{{ $t('e2e.dashboard.allStatuses') }}</option>
              <option value="passed">{{ $t('e2e.dashboard.passed') }}</option>
              <option value="failed">{{ $t('e2e.dashboard.failed') }}</option>
              <option value="skipped">{{ $t('e2e.dashboard.skipped') }}</option>
            </select>

            <select v-model="selectedCategory" class="select select-bordered select-sm">
              <option value="">{{ $t('e2e.dashboard.allCategories') }}</option>
              <option value="authentication">{{ $t('e2e.category.authentication') }}</option>
              <option value="messaging">{{ $t('e2e.category.messaging') }}</option>
              <option value="events">{{ $t('e2e.category.events') }}</option>
              <option value="profile">{{ $t('e2e.category.profile') }}</option>
              <option value="search">{{ $t('e2e.category.search') }}</option>
              <option value="offline">{{ $t('e2e.category.offline') }}</option>
              <option value="multilingual">{{ $t('e2e.category.multilingual') }}</option>
              <option value="navigation">{{ $t('e2e.category.navigation') }}</option>
            </select>
          </div>

          <div
            v-if="filteredTestResults.length === 0"
            class="text-center text-base-content/70 py-8"
          >
            {{ $t('e2e.dashboard.noTestResults') }}
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>{{ $t('e2e.dashboard.scenarioName') }}</th>
                  <th>{{ $t('e2e.dashboard.status') }}</th>
                  <th>{{ $t('e2e.dashboard.duration') }}</th>
                  <th>{{ $t('e2e.dashboard.timestamp') }}</th>
                  <th>{{ $t('e2e.dashboard.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in filteredTestResults" :key="result.scenarioId">
                  <td class="font-medium">{{ result.scenarioName }}</td>
                  <td>
                    <div class="badge" :class="getResultStatusBadgeClass(result.status)">
                      {{ $t(`e2e.status.${result.status}`) }}
                    </div>
                  </td>
                  <td>{{ formatDuration(result.duration) }}</td>
                  <td>{{ formatTime(result.timestamp) }}</td>
                  <td>
                    <button class="btn btn-sm btn-ghost" @click="viewResultDetails(result)">
                      {{ $t('e2e.dashboard.details') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario Details Modal -->
    <dialog class="modal" :open="showScenarioDetailsModal">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-4">{{ $t('e2e.dashboard.scenarioDetails') }}</h3>

        <div v-if="selectedScenario" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.name') }}</span>
              </label>
              <div class="text-base-content">{{ selectedScenario.name }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.category') }}</span>
              </label>
              <div class="text-base-content">
                {{ $t(`e2e.category.${selectedScenario.category}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.priority') }}</span>
              </label>
              <div class="badge" :class="getPriorityBadgeClass(selectedScenario.priority)">
                {{ $t(`e2e.priority.${selectedScenario.priority}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.status') }}</span>
              </label>
              <div class="badge" :class="getScenarioStatusBadgeClass(selectedScenario.status)">
                {{ $t(`e2e.status.${selectedScenario.status}`) }}
              </div>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{ $t('e2e.dashboard.description') }}</span>
            </label>
            <div class="text-base-content">{{ selectedScenario.description }}</div>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{ $t('e2e.dashboard.expectedOutcome') }}</span>
            </label>
            <div class="text-base-content">{{ selectedScenario.expectedOutcome }}</div>
          </div>

          <div v-if="selectedScenario.steps.length > 0">
            <label class="label">
              <span class="label-text font-medium">{{ $t('e2e.dashboard.steps') }}</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="(step, index) in selectedScenario.steps"
                :key="step.id"
                class="flex items-center gap-2 p-2 bg-base-200 rounded"
              >
                <div class="badge" :class="getStepStatusBadgeClass(step.status)">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <div class="font-medium">{{ step.name }}</div>
                  <div class="text-sm text-base-content/70">
                    {{ $t(`e2e.stepType.${step.type}`) }}
                  </div>
                </div>
                <div class="badge" :class="getStepStatusBadgeClass(step.status)">
                  {{ $t(`e2e.status.${step.status}`) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="closeScenarioDetailsModal">
            {{ $t('e2e.dashboard.close') }}
          </button>
        </div>
      </div>
    </dialog>

    <!-- Result Details Modal -->
    <dialog class="modal" :open="showResultDetailsModal">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-4">{{ $t('e2e.dashboard.resultDetails') }}</h3>

        <div v-if="selectedResult" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.scenarioName') }}</span>
              </label>
              <div class="text-base-content">{{ selectedResult.scenarioName }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.status') }}</span>
              </label>
              <div class="badge" :class="getResultStatusBadgeClass(selectedResult.status)">
                {{ $t(`e2e.status.${selectedResult.status}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.duration') }}</span>
              </label>
              <div class="text-base-content">{{ formatDuration(selectedResult.duration) }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('e2e.dashboard.timestamp') }}</span>
              </label>
              <div class="text-base-content">{{ formatTime(selectedResult.timestamp) }}</div>
            </div>
          </div>

          <div v-if="selectedResult.error">
            <label class="label">
              <span class="label-text font-medium">{{ $t('e2e.dashboard.error') }}</span>
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
              <span class="label-text font-medium">{{ $t('e2e.dashboard.steps') }}</span>
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
                    {{ $t(`e2e.stepType.${step.type}`) }}
                  </div>
                  <div v-if="step.duration" class="text-sm text-base-content/50">
                    {{ formatDuration(step.duration) }}
                  </div>
                </div>
                <div class="badge" :class="getStepStatusBadgeClass(step.status)">
                  {{ $t(`e2e.status.${step.status}`) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="closeResultDetailsModal">
            {{ $t('e2e.dashboard.close') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useE2ETesting,
  type E2ETestScenario,
  type E2ETestResult,
} from '@/composables/useE2ETesting'

const { t } = useI18n()
const {
  testSuites,
  currentScenario,
  isRunning,
  testResults,
  totalScenarios,
  passedScenarios,
  failedScenarios,
  skippedScenarios,
  successRate,
  runningScenarios,
  runScenario,
  runTestSuite,
  runAllTestSuites,
  clearTestResults,
  exportTestData,
} = useE2ETesting()

// Local state
const isRunningTests = ref(false)
const showScenarioDetailsModal = ref(false)
const showResultDetailsModal = ref(false)
const selectedScenario = ref<E2ETestScenario | null>(null)
const selectedResult = ref<E2ETestResult | null>(null)
const selectedStatus = ref('')
const selectedCategory = ref('')

// Computed properties
const filteredTestResults = computed(() => {
  return testResults.value.filter((result) => {
    if (selectedStatus.value && result.status !== selectedStatus.value) return false
    if (selectedCategory.value) {
      const scenario = testSuites.value
        .flatMap((suite) => suite.scenarios)
        .find((s) => s.id === result.scenarioId)
      if (scenario?.category !== selectedCategory.value) return false
    }
    return true
  })
})

// Methods
function getSuiteStatusBadgeClass(status: string): string {
  switch (status) {
    case 'running':
      return 'badge-warning'
    case 'completed':
      return 'badge-success'
    case 'failed':
      return 'badge-error'
    case 'pending':
    default:
      return 'badge-neutral'
  }
}

function getScenarioStatusBadgeClass(status: string): string {
  switch (status) {
    case 'running':
      return 'badge-warning'
    case 'passed':
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

function getResultStatusBadgeClass(status: string): string {
  switch (status) {
    case 'passed':
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
    case 'running':
      return 'badge-warning'
    case 'passed':
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

function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'badge-error'
    case 'high':
      return 'badge-warning'
    case 'medium':
      return 'badge-info'
    case 'low':
      return 'badge-neutral'
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

async function runAllTests() {
  isRunningTests.value = true
  try {
    await runAllTestSuites()
  } finally {
    isRunningTests.value = false
  }
}

async function runTestSuite(suiteId: string) {
  isRunningTests.value = true
  try {
    await runTestSuite(suiteId)
  } finally {
    isRunningTests.value = false
  }
}

async function runScenario(scenarioId: string) {
  isRunningTests.value = true
  try {
    await runScenario(scenarioId)
  } finally {
    isRunningTests.value = false
  }
}

function exportData() {
  const data = exportTestData('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `e2e-test-results-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function clearAll() {
  clearTestResults()
}

function viewScenarioDetails(scenario: E2ETestScenario) {
  selectedScenario.value = scenario
  showScenarioDetailsModal.value = true
}

function closeScenarioDetailsModal() {
  showScenarioDetailsModal.value = false
  selectedScenario.value = null
}

function viewResultDetails(result: E2ETestResult) {
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
.e2e-testing-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply mb-8;
}

.test-overview {
  @apply mb-8;
}

.test-suites {
  @apply mb-8;
}

.test-results {
  @apply mb-8;
}

@media (max-width: 768px) {
  .e2e-testing-dashboard {
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
