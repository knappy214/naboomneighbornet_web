<template>
  <div v-if="!isOnline" class="offline-indicator">
    <div class="alert alert-warning shadow-lg">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <div class="flex-1">
        <h3 class="font-bold">{{ $t('offline.title') }}</h3>
        <div class="text-sm">
          <p>{{ $t('offline.description') }}</p>
          <div v-if="hasPendingMessages" class="mt-2">
            <p class="font-medium">
              {{ $t('offline.pendingMessages', { count: pendingCount }) }}
            </p>
            <p class="text-xs opacity-75">
              {{ $t('offline.willSyncWhenOnline') }}
            </p>
          </div>
          <div v-if="hasFailedMessages" class="mt-2">
            <p class="font-medium text-error">
              {{ $t('offline.failedMessages', { count: failedCount }) }}
            </p>
            <button
              class="btn btn-xs btn-error btn-outline mt-1"
              @click="retryAllFailed"
              :disabled="retrying"
            >
              <span v-if="retrying" class="loading loading-spinner loading-xs"></span>
              {{ $t('offline.retryFailed') }}
            </button>
          </div>
        </div>
      </div>
      <button
        class="btn btn-sm btn-ghost"
        @click="showOfflineManager = true"
        :disabled="!hasQueuedMessages"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        {{ $t('offline.manage') }}
      </button>
    </div>

    <!-- Offline Message Manager Modal -->
    <div v-if="showOfflineManager" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <OfflineMessageManager @close="showOfflineManager = false" />
      </div>
      <div class="modal-backdrop" @click="showOfflineManager = false"></div>
    </div>
  </div>

  <!-- Online Status Indicator -->
  <div v-else-if="showOnlineStatus" class="online-indicator">
    <div class="alert alert-success shadow-lg">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div class="flex-1">
        <h3 class="font-bold">{{ $t('offline.online') }}</h3>
        <div class="text-sm">
          <p>{{ $t('offline.connectionRestored') }}</p>
          <div v-if="recentlySynced" class="mt-1">
            <p class="text-xs opacity-75">
              {{ $t('offline.messagesSynced', { count: syncedCount }) }}
            </p>
          </div>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost" @click="showOnlineStatus = false">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOfflineQueue } from '@/composables/useOfflineQueue'
import OfflineMessageManager from './OfflineMessageManager.vue'

const { t } = useI18n()
const {
  isOnline,
  pendingMessages,
  failedMessages,
  hasPendingMessages,
  hasFailedMessages,
  totalQueuedMessages,
  retryAllFailedMessages,
} = useOfflineQueue()

// Reactive data
const showOfflineManager = ref(false)
const showOnlineStatus = ref(false)
const retrying = ref(false)
const recentlySynced = ref(false)
const syncedCount = ref(0)

// Computed properties
const hasQueuedMessages = computed(() => totalQueuedMessages.value > 0)
const pendingCount = computed(() => pendingMessages.value.length)
const failedCount = computed(() => failedMessages.value.length)

// Methods
async function retryAllFailed() {
  retrying.value = true
  try {
    await retryAllFailedMessages()
  } catch (error) {
    console.error('Failed to retry all failed messages:', error)
  } finally {
    retrying.value = false
  }
}

// Watch for online status changes
watch(isOnline, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    // Just came back online
    showOnlineStatus.value = true
    recentlySynced.value = true
    syncedCount.value = pendingCount.value + failedCount.value

    // Hide after 3 seconds
    setTimeout(() => {
      showOnlineStatus.value = false
      recentlySynced.value = false
      syncedCount.value = 0
    }, 3000)
  }
})

// Lifecycle
onMounted(() => {
  // Show online status briefly on mount if online
  if (isOnline.value) {
    showOnlineStatus.value = true
    setTimeout(() => {
      showOnlineStatus.value = false
    }, 2000)
  }
})
</script>

<style scoped>
.offline-indicator {
  @apply fixed top-4 left-4 right-4 z-50;
}

.online-indicator {
  @apply fixed top-4 left-4 right-4 z-50;
}

.alert {
  @apply transition-all duration-300 ease-in-out;
}

.offline-indicator .alert {
  @apply animate-pulse;
}

.online-indicator .alert {
  @apply animate-bounce;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.loading {
  @apply transition-all duration-200;
}

@media (max-width: 640px) {
  .offline-indicator,
  .online-indicator {
    @apply top-2 left-2 right-2;
  }
}
</style>
