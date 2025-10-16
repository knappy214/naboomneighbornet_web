<template>
  <div class="security-dashboard">
    <div class="dashboard-header">
      <h1 class="text-3xl font-bold mb-6">{{ $t('security.dashboard.title') }}</h1>

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
          {{ $t('security.dashboard.runTests') }}
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
          {{ $t('security.dashboard.export') }}
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
          {{ $t('security.dashboard.clearAll') }}
        </button>
      </div>
    </div>

    <!-- Security Score Overview -->
    <div class="security-overview mb-8">
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
            {{ $t('security.dashboard.securityScore') }}
          </h2>

          <div class="flex items-center gap-4 mb-4">
            <div
              class="radial-progress"
              :class="getScoreColorClass(securityScore)"
              :style="`--value:${securityScore}`"
            >
              {{ securityScore }}
            </div>
            <div class="text-sm text-base-content/70">
              {{ $t('security.dashboard.scoreDescription') }}
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat">
              <div class="stat-title">{{ $t('security.dashboard.totalVulnerabilities') }}</div>
              <div class="stat-value text-error">{{ totalVulnerabilities }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('security.dashboard.critical') }}</div>
              <div class="stat-value text-error">{{ criticalVulnerabilities.length }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('security.dashboard.high') }}</div>
              <div class="stat-value text-warning">{{ highVulnerabilities.length }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('security.dashboard.open') }}</div>
              <div class="stat-value text-info">{{ openVulnerabilities.length }}</div>
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {{ $t('security.dashboard.testResults') }}
          </h2>

          <div v-if="testResults.length === 0" class="text-center text-base-content/70 py-8">
            {{ $t('security.dashboard.noTestsRun') }}
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>{{ $t('security.dashboard.testName') }}</th>
                  <th>{{ $t('security.dashboard.status') }}</th>
                  <th>{{ $t('security.dashboard.score') }}</th>
                  <th>{{ $t('security.dashboard.vulnerabilities') }}</th>
                  <th>{{ $t('security.dashboard.duration') }}</th>
                  <th>{{ $t('security.dashboard.timestamp') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in testResults" :key="result.testName">
                  <td class="font-medium">{{ result.testName }}</td>
                  <td>
                    <div class="badge" :class="result.passed ? 'badge-success' : 'badge-error'">
                      {{
                        result.passed
                          ? $t('security.dashboard.passed')
                          : $t('security.dashboard.failed')
                      }}
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>{{ result.score }}</span>
                      <div class="w-16 bg-base-200 rounded-full h-2">
                        <div
                          class="h-2 rounded-full"
                          :class="getScoreColorClass(result.score)"
                          :style="`width: ${result.score}%`"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>{{ result.vulnerabilities.length }}</td>
                  <td>{{ Math.round(result.duration) }}ms</td>
                  <td>{{ formatTime(result.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Vulnerabilities -->
    <div class="vulnerabilities mb-8">
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
            {{ $t('security.dashboard.vulnerabilities') }}
          </h2>

          <div class="flex gap-2 mb-4">
            <select v-model="selectedSeverity" class="select select-bordered select-sm">
              <option value="">{{ $t('security.dashboard.allSeverities') }}</option>
              <option value="critical">{{ $t('security.dashboard.critical') }}</option>
              <option value="high">{{ $t('security.dashboard.high') }}</option>
              <option value="medium">{{ $t('security.dashboard.medium') }}</option>
              <option value="low">{{ $t('security.dashboard.low') }}</option>
            </select>

            <select v-model="selectedType" class="select select-bordered select-sm">
              <option value="">{{ $t('security.dashboard.allTypes') }}</option>
              <option value="xss">{{ $t('security.dashboard.xss') }}</option>
              <option value="csrf">{{ $t('security.dashboard.csrf') }}</option>
              <option value="injection">{{ $t('security.dashboard.injection') }}</option>
              <option value="authentication">{{ $t('security.dashboard.authentication') }}</option>
              <option value="authorization">{{ $t('security.dashboard.authorization') }}</option>
              <option value="csp">{{ $t('security.dashboard.csp') }}</option>
              <option value="headers">{{ $t('security.dashboard.headers') }}</option>
              <option value="dependencies">{{ $t('security.dashboard.dependencies') }}</option>
            </select>

            <select v-model="selectedStatus" class="select select-bordered select-sm">
              <option value="">{{ $t('security.dashboard.allStatuses') }}</option>
              <option value="open">{{ $t('security.dashboard.open') }}</option>
              <option value="fixed">{{ $t('security.dashboard.fixed') }}</option>
              <option value="ignored">{{ $t('security.dashboard.ignored') }}</option>
              <option value="false_positive">{{ $t('security.dashboard.falsePositive') }}</option>
            </select>
          </div>

          <div
            v-if="filteredVulnerabilities.length === 0"
            class="text-center text-base-content/70 py-8"
          >
            {{ $t('security.dashboard.noVulnerabilities') }}
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="vuln in filteredVulnerabilities"
              :key="vuln.id"
              class="alert"
              :class="getVulnerabilityAlertClass(vuln.severity)"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-bold">{{ vuln.title }}</h3>
                  <div class="badge" :class="getSeverityBadgeClass(vuln.severity)">
                    {{ $t(`security.severity.${vuln.severity}`) }}
                  </div>
                  <div class="badge badge-outline">
                    {{ $t(`security.type.${vuln.type}`) }}
                  </div>
                  <div class="badge" :class="getStatusBadgeClass(vuln.status)">
                    {{ $t(`security.status.${vuln.status}`) }}
                  </div>
                </div>
                <p class="text-sm mb-2">{{ vuln.description }}</p>
                <div class="text-sm">
                  <strong>{{ $t('security.dashboard.impact') }}:</strong> {{ vuln.impact }}
                </div>
                <div class="text-sm">
                  <strong>{{ $t('security.dashboard.recommendation') }}:</strong>
                  {{ vuln.recommendation }}
                </div>
                <div v-if="vuln.payload" class="text-sm">
                  <strong>{{ $t('security.dashboard.payload') }}:</strong>
                  <code class="bg-base-200 px-1 rounded">{{ vuln.payload }}</code>
                </div>
                <div class="flex gap-2 mt-3">
                  <button
                    v-if="vuln.status === 'open'"
                    class="btn btn-sm btn-success"
                    @click="markAsFixed(vuln.id)"
                  >
                    {{ $t('security.dashboard.markFixed') }}
                  </button>
                  <button
                    v-if="vuln.status === 'open'"
                    class="btn btn-sm btn-warning"
                    @click="markAsFalsePositive(vuln.id)"
                  >
                    {{ $t('security.dashboard.markFalsePositive') }}
                  </button>
                  <button class="btn btn-sm btn-ghost" @click="viewDetails(vuln)">
                    {{ $t('security.dashboard.details') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Recommendations -->
    <div class="recommendations mb-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            {{ $t('security.dashboard.recommendations') }}
          </h2>

          <div v-if="recommendations.length === 0" class="text-center text-base-content/70 py-8">
            {{ $t('security.dashboard.noRecommendations') }}
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(recommendation, index) in recommendations"
              :key="index"
              class="alert alert-info"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ recommendation }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <dialog class="modal" :open="showDetailsModal">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-4">{{ $t('security.dashboard.vulnerabilityDetails') }}</h3>

        <div v-if="selectedVulnerability" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('security.dashboard.title') }}</span>
              </label>
              <div class="text-base-content">{{ selectedVulnerability.title }}</div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('security.dashboard.severity') }}</span>
              </label>
              <div class="badge" :class="getSeverityBadgeClass(selectedVulnerability.severity)">
                {{ $t(`security.severity.${selectedVulnerability.severity}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('security.dashboard.type') }}</span>
              </label>
              <div class="text-base-content">
                {{ $t(`security.type.${selectedVulnerability.type}`) }}
              </div>
            </div>
            <div>
              <label class="label">
                <span class="label-text font-medium">{{ $t('security.dashboard.status') }}</span>
              </label>
              <div class="badge" :class="getStatusBadgeClass(selectedVulnerability.status)">
                {{ $t(`security.status.${selectedVulnerability.status}`) }}
              </div>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{ $t('security.dashboard.description') }}</span>
            </label>
            <div class="text-base-content">{{ selectedVulnerability.description }}</div>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{ $t('security.dashboard.impact') }}</span>
            </label>
            <div class="text-base-content">{{ selectedVulnerability.impact }}</div>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{
                $t('security.dashboard.recommendation')
              }}</span>
            </label>
            <div class="text-base-content">{{ selectedVulnerability.recommendation }}</div>
          </div>

          <div v-if="selectedVulnerability.payload">
            <label class="label">
              <span class="label-text font-medium">{{ $t('security.dashboard.payload') }}</span>
            </label>
            <pre class="bg-base-200 p-4 rounded-lg text-sm overflow-auto">{{
              selectedVulnerability.payload
            }}</pre>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">{{ $t('security.dashboard.timestamp') }}</span>
            </label>
            <div class="text-base-content">{{ formatTime(selectedVulnerability.timestamp) }}</div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" @click="closeDetailsModal">
            {{ $t('security.dashboard.close') }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSecurityTesting, type SecurityVulnerability } from '@/composables/useSecurityTesting'

const { t } = useI18n()
const {
  vulnerabilities,
  testResults,
  totalVulnerabilities,
  criticalVulnerabilities,
  highVulnerabilities,
  openVulnerabilities,
  securityScore,
  runAllSecurityTests,
  markVulnerabilityFixed,
  markVulnerabilityFalsePositive,
  clearVulnerabilities,
  exportSecurityData,
  generateSecurityReport,
} = useSecurityTesting()

// Local state
const isRunningTests = ref(false)
const showDetailsModal = ref(false)
const selectedVulnerability = ref<SecurityVulnerability | null>(null)
const selectedSeverity = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

// Computed properties
const filteredVulnerabilities = computed(() => {
  return vulnerabilities.value.filter((vuln) => {
    if (selectedSeverity.value && vuln.severity !== selectedSeverity.value) return false
    if (selectedType.value && vuln.type !== selectedType.value) return false
    if (selectedStatus.value && vuln.status !== selectedStatus.value) return false
    return true
  })
})

const recommendations = computed(() => {
  const report = generateSecurityReport()
  return report.recommendations
})

// Methods
function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-success'
  if (score >= 70) return 'text-warning'
  return 'text-error'
}

function getVulnerabilityAlertClass(severity: string): string {
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

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'badge-error'
    case 'high':
      return 'badge-error'
    case 'medium':
      return 'badge-warning'
    case 'low':
      return 'badge-info'
    default:
      return 'badge-neutral'
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'open':
      return 'badge-error'
    case 'fixed':
      return 'badge-success'
    case 'ignored':
      return 'badge-warning'
    case 'false_positive':
      return 'badge-info'
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

async function runAllTests() {
  isRunningTests.value = true
  try {
    await runAllSecurityTests()
  } finally {
    isRunningTests.value = false
  }
}

function exportData() {
  const data = exportSecurityData('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function clearAll() {
  clearVulnerabilities()
}

function markAsFixed(vulnerabilityId: string) {
  markVulnerabilityFixed(vulnerabilityId)
}

function markAsFalsePositive(vulnerabilityId: string) {
  markVulnerabilityFalsePositive(vulnerabilityId)
}

function viewDetails(vulnerability: SecurityVulnerability) {
  selectedVulnerability.value = vulnerability
  showDetailsModal.value = true
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedVulnerability.value = null
}

// Lifecycle
onMounted(() => {
  // Initialize if needed
})
</script>

<style scoped>
.security-dashboard {
  @apply p-6 max-w-7xl mx-auto;
}

.dashboard-header {
  @apply mb-8;
}

.security-overview {
  @apply mb-8;
}

.test-results {
  @apply mb-8;
}

.vulnerabilities {
  @apply mb-8;
}

.recommendations {
  @apply mb-8;
}

@media (max-width: 768px) {
  .security-dashboard {
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
