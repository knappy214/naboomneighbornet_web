<template>
  <div class="offline-message-manager">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">{{ $t('offline.messageManager') }}</h2>
      <button class="btn btn-ghost btn-sm" @click="$emit('close')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats shadow mb-6">
      <div class="stat">
        <div class="stat-figure text-warning">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ $t('offline.pendingMessages') }}</div>
        <div class="stat-value text-warning">{{ pendingMessages.length }}</div>
        <div class="stat-desc">{{ $t('offline.waitingToSend') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-error">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ $t('offline.failedMessages') }}</div>
        <div class="stat-value text-error">{{ failedMessages.length }}</div>
        <div class="stat-desc">{{ $t('offline.needRetry') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-info">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ $t('offline.totalQueued') }}</div>
        <div class="stat-value text-info">{{ totalQueuedMessages }}</div>
        <div class="stat-desc">{{ $t('offline.allMessages') }}</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        class="btn btn-primary"
        @click="syncAllPending"
        :disabled="!canSync || pendingMessages.length === 0"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ $t('offline.syncAll') }}
      </button>

      <button
        class="btn btn-warning"
        @click="retryAllFailed"
        :disabled="failedMessages.length === 0 || retrying"
      >
        <span v-if="retrying" class="loading loading-spinner loading-sm mr-2"></span>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ $t('offline.retryAll') }}
      </button>

      <button
        class="btn btn-error btn-outline"
        @click="clearAllMessages"
        :disabled="totalQueuedMessages === 0"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        {{ $t('offline.clearAll') }}
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs tabs-boxed mb-4">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ $t('offline.pending') }} ({{ pendingMessages.length }})
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'failed' }"
        @click="activeTab = 'failed'"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ $t('offline.failed') }} ({{ failedMessages.length }})
      </button>
    </div>

    <!-- Messages List -->
    <div class="space-y-4">
      <!-- Pending Messages -->
      <div v-if="activeTab === 'pending'">
        <div v-if="pendingMessages.length === 0" class="text-center py-8">
          <svg
            class="w-16 h-16 mx-auto text-base-content/30 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="text-lg font-semibold mb-2">{{ $t('offline.noPendingMessages') }}</h3>
          <p class="text-base-content/70">{{ $t('offline.noPendingDescription') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="message in pendingMessages"
            :key="message.id"
            class="card bg-base-100 border border-warning shadow-sm"
          >
            <div class="card-body p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="badge badge-warning badge-sm">
                      {{ $t(`offline.status.${message.status}`) }}
                    </div>
                    <span class="text-sm text-base-content/70">
                      {{ formatDate(message.timestamp) }}
                    </span>
                  </div>

                  <p class="text-sm font-medium mb-1">
                    {{ $t('offline.channel') }}: {{ message.channelId }}
                  </p>
                  <p class="text-sm text-base-content/80 mb-2">{{ message.content }}</p>

                  <div v-if="message.metadata" class="text-xs text-base-content/60">
                    <span class="font-medium">{{ $t('offline.type') }}:</span>
                    {{ $t(`offline.messageTypes.${message.type}`) }}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="btn btn-xs btn-primary"
                    @click="sendMessage(message.id)"
                    :disabled="!canSync"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    {{ $t('offline.sendNow') }}
                  </button>

                  <button
                    class="btn btn-xs btn-error btn-outline"
                    @click="deleteMessage(message.id)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Failed Messages -->
      <div v-if="activeTab === 'failed'">
        <div v-if="failedMessages.length === 0" class="text-center py-8">
          <svg
            class="w-16 h-16 mx-auto text-base-content/30 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="text-lg font-semibold mb-2">{{ $t('offline.noFailedMessages') }}</h3>
          <p class="text-base-content/70">{{ $t('offline.noFailedDescription') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="message in failedMessages"
            :key="message.id"
            class="card bg-base-100 border border-error shadow-sm"
          >
            <div class="card-body p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="badge badge-error badge-sm">
                      {{ $t(`offline.status.${message.status}`) }}
                    </div>
                    <span class="text-sm text-base-content/70">
                      {{ formatDate(message.timestamp) }}
                    </span>
                    <span class="text-xs text-error">
                      ({{ $t('offline.retryCount', { count: message.retryCount }) }})
                    </span>
                  </div>

                  <p class="text-sm font-medium mb-1">
                    {{ $t('offline.channel') }}: {{ message.channelId }}
                  </p>
                  <p class="text-sm text-base-content/80 mb-2">{{ message.content }}</p>

                  <div v-if="message.lastError" class="text-xs text-error mb-2">
                    <span class="font-medium">{{ $t('offline.lastError') }}:</span>
                    {{ message.lastError }}
                  </div>

                  <div v-if="message.metadata" class="text-xs text-base-content/60">
                    <span class="font-medium">{{ $t('offline.type') }}:</span>
                    {{ $t(`offline.messageTypes.${message.type}`) }}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="btn btn-xs btn-warning"
                    @click="retryMessage(message.id)"
                    :disabled="!canSync"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {{ $t('offline.retry') }}
                  </button>

                  <button
                    class="btn btn-xs btn-error btn-outline"
                    @click="deleteMessage(message.id)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOfflineQueue } from '@/composables/useOfflineQueue'
import type { QueuedMessage } from '@/composables/useOfflineQueue'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { t } = useI18n()
const {
  isOnline,
  pendingMessages,
  failedMessages,
  totalQueuedMessages,
  canSync,
  sendQueuedMessage,
  retryFailedMessage,
  retryAllFailedMessages,
  deleteQueuedMessage,
  clearAllQueuedMessages,
  syncAllPendingMessages,
} = useOfflineQueue()

// Reactive data
const activeTab = ref<'pending' | 'failed'>('pending')
const retrying = ref(false)

// Methods
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function sendMessage(messageId: string) {
  try {
    await sendQueuedMessage(messageId)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

async function retryMessage(messageId: string) {
  try {
    await retryFailedMessage(messageId)
  } catch (error) {
    console.error('Failed to retry message:', error)
  }
}

async function deleteMessage(messageId: string) {
  try {
    await deleteQueuedMessage(messageId)
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

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

async function syncAllPending() {
  try {
    await syncAllPendingMessages()
  } catch (error) {
    console.error('Failed to sync all pending messages:', error)
  }
}

async function clearAllMessages() {
  if (confirm(t('offline.confirmClearAll'))) {
    try {
      await clearAllQueuedMessages()
    } catch (error) {
      console.error('Failed to clear all messages:', error)
    }
  }
}
</script>

<style scoped>
.offline-message-manager {
  @apply space-y-6;
}

.stats {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.stat {
  @apply transition-all duration-200;
}

.stat:hover {
  @apply transform scale-105;
}

.card {
  @apply transition-all duration-200;
}

.card:hover {
  @apply shadow-md;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.tab {
  @apply transition-all duration-200;
}

.tab:hover {
  @apply transform scale-105;
}

.badge {
  @apply transition-all duration-200;
}

.loading {
  @apply transition-all duration-200;
}
</style>
