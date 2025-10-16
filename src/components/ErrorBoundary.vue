<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary-content">
      <div class="error-icon">
        <svg class="w-16 h-16 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <div class="error-details">
        <h2 class="error-title">{{ $t('error.boundary.title') }}</h2>
        <p class="error-message">{{ errorMessage }}</p>

        <div v-if="showDetails" class="error-details-content">
          <div class="error-info">
            <h3 class="error-info-title">{{ $t('error.boundary.details') }}</h3>
            <div class="error-info-item">
              <span class="error-info-label">{{ $t('error.boundary.component') }}:</span>
              <span class="error-info-value">{{ errorComponent || 'Unknown' }}</span>
            </div>
            <div class="error-info-item">
              <span class="error-info-label">{{ $t('error.boundary.timestamp') }}:</span>
              <span class="error-info-value">{{ formatTimestamp(errorTimestamp) }}</span>
            </div>
            <div class="error-info-item">
              <span class="error-info-label">{{ $t('error.boundary.severity') }}:</span>
              <span class="error-info-value" :class="`text-${errorSeverity}`">
                {{ $t(`error.severity.${errorSeverity}`) }}
              </span>
            </div>
          </div>

          <div v-if="errorStack" class="error-stack">
            <h4 class="error-stack-title">{{ $t('error.boundary.stackTrace') }}</h4>
            <pre class="error-stack-content">{{ errorStack }}</pre>
          </div>

          <div v-if="errorContext" class="error-context">
            <h4 class="error-context-title">{{ $t('error.boundary.context') }}</h4>
            <pre class="error-context-content">{{ JSON.stringify(errorContext, null, 2) }}</pre>
          </div>
        </div>

        <div class="error-actions">
          <button class="btn btn-primary" @click="retry" :disabled="!isRecoverable">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ $t('error.boundary.retry') }}
          </button>

          <button class="btn btn-outline" @click="reportError">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            {{ $t('error.boundary.report') }}
          </button>

          <button class="btn btn-ghost" @click="goHome">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {{ $t('error.boundary.goHome') }}
          </button>

          <button class="btn btn-ghost btn-sm" @click="toggleDetails">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {{ showDetails ? $t('error.boundary.hideDetails') : $t('error.boundary.showDetails') }}
          </button>
        </div>

        <div v-if="!isRecoverable" class="error-warning">
          <div class="alert alert-warning">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 class="font-bold">{{ $t('error.boundary.nonRecoverable') }}</h3>
              <div class="text-sm">{{ $t('error.boundary.nonRecoverableDescription') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="error-boundary-content">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import type { AppError } from '@/composables/useErrorHandler'

const { t } = useI18n()
const router = useRouter()
const { handleError, recoverFromError } = useErrorHandler()

// Props
interface Props {
  fallbackComponent?: string
  onError?: (error: AppError) => void
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallbackComponent: 'ErrorBoundary',
  showDetails: false,
})

// Reactive state
const hasError = ref(false)
const currentError = ref<AppError | null>(null)
const showDetails = ref(props.showDetails)

// Computed properties
const errorMessage = computed(() => {
  if (!currentError.value) return t('error.boundary.unknown')
  return currentError.value.message
})

const errorComponent = computed(() => {
  return currentError.value?.component || props.fallbackComponent
})

const errorTimestamp = computed(() => {
  return currentError.value?.timestamp || new Date()
})

const errorSeverity = computed(() => {
  return currentError.value?.severity || 'medium'
})

const errorStack = computed(() => {
  return currentError.value?.stack
})

const errorContext = computed(() => {
  return currentError.value?.context
})

const isRecoverable = computed(() => {
  return currentError.value?.recoverable ?? true
})

// Methods
function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function toggleDetails() {
  showDetails.value = !showDetails.value
}

function retry() {
  if (currentError.value && isRecoverable.value) {
    recoverFromError(currentError.value.id)
    hasError.value = false
    currentError.value = null
  }
}

function reportError() {
  if (currentError.value) {
    // In a real implementation, this would send the error to an external service
    console.log('Reporting error:', currentError.value)

    // Show a success message
    alert(t('error.boundary.reportSuccess'))
  }
}

function goHome() {
  router.push('/')
  hasError.value = false
  currentError.value = null
}

function reset() {
  hasError.value = false
  currentError.value = null
  showDetails.value = props.showDetails
}

// Error boundary logic
onErrorCaptured((error: Error, instance, info: string) => {
  console.error('Error caught by boundary:', error, info)

  const appError = handleError(error, {
    component: props.fallbackComponent,
    errorInfo: info,
    instance: instance?.$?.type?.name || 'Unknown',
  })

  hasError.value = true
  currentError.value = appError

  // Call custom error handler if provided
  if (props.onError) {
    props.onError(appError)
  }

  // Prevent the error from propagating further
  return false
})

// Provide error boundary methods to child components
provide('errorBoundary', {
  reset,
  hasError: computed(() => hasError.value),
  currentError: computed(() => currentError.value),
})

// Lifecycle
onMounted(() => {
  // Reset any previous error state
  reset()
})
</script>

<style scoped>
.error-boundary {
  @apply min-h-screen flex items-center justify-center bg-base-100 p-4;
}

.error-boundary-content {
  @apply max-w-2xl w-full;
}

.error-icon {
  @apply flex justify-center mb-6;
}

.error-details {
  @apply text-center space-y-6;
}

.error-title {
  @apply text-3xl font-bold text-base-content mb-4;
}

.error-message {
  @apply text-lg text-base-content/70 mb-6;
}

.error-details-content {
  @apply text-left space-y-4;
}

.error-info {
  @apply bg-base-200 rounded-lg p-4 space-y-2;
}

.error-info-title {
  @apply text-lg font-semibold mb-3;
}

.error-info-item {
  @apply flex justify-between items-center;
}

.error-info-label {
  @apply font-medium text-base-content/70;
}

.error-info-value {
  @apply text-base-content;
}

.error-stack {
  @apply bg-base-200 rounded-lg p-4;
}

.error-stack-title {
  @apply text-lg font-semibold mb-3;
}

.error-stack-content {
  @apply text-xs text-base-content/70 bg-base-300 p-3 rounded overflow-auto max-h-40;
}

.error-context {
  @apply bg-base-200 rounded-lg p-4;
}

.error-context-title {
  @apply text-lg font-semibold mb-3;
}

.error-context-content {
  @apply text-xs text-base-content/70 bg-base-300 p-3 rounded overflow-auto max-h-40;
}

.error-actions {
  @apply flex flex-wrap gap-3 justify-center;
}

.error-warning {
  @apply mt-6;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

@media (max-width: 768px) {
  .error-boundary {
    @apply p-2;
  }

  .error-actions {
    @apply flex-col;
  }

  .error-info-item {
    @apply flex-col items-start gap-1;
  }
}
</style>
