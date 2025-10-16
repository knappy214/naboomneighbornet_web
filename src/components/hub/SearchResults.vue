<template>
  <div class="search-results">
    <!-- Results Header -->
    <div class="results-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-semibold">
            {{ $t('search.results') }}
            <span v-if="searchStats.totalResults > 0" class="text-base-content/70">
              ({{ searchStats.totalResults }})
            </span>
          </h2>

          <div v-if="searchStats.searchTime > 0" class="text-sm text-base-content/60">
            {{ $t('search.searchTime', { time: Math.round(searchStats.searchTime) }) }}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Export Results -->
          <button class="btn btn-ghost btn-sm" @click="exportResults" :disabled="!hasResults">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ $t('search.export') }}
          </button>

          <!-- Save Search -->
          <button
            class="btn btn-primary btn-sm"
            @click="showSaveSearchModal = true"
            :disabled="!hasResults"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {{ $t('search.saveSearch') }}
          </button>
        </div>
      </div>

      <!-- Search Stats -->
      <div v-if="searchStats.totalResults > 0" class="stats-strip">
        <div class="stat-item">
          <span class="stat-label">{{ $t('search.channelsFound') }}:</span>
          <span class="stat-value">{{ searchStats.channelsFound }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t('search.usersFound') }}:</span>
          <span class="stat-value">{{ searchStats.usersFound }}</span>
        </div>
        <div v-if="searchStats.dateRange.earliest" class="stat-item">
          <span class="stat-label">{{ $t('search.dateRange') }}:</span>
          <span class="stat-value">
            {{ formatDate(searchStats.dateRange.earliest) }} -
            {{ formatDate(searchStats.dateRange.latest!) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isSearching" class="loading-state">
      <div class="flex items-center justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="ml-4 text-lg">{{ $t('search.searching') }}...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="alert alert-error">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="font-bold">{{ $t('search.searchError') }}</h3>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="!hasResults && !isSearching" class="no-results-state">
      <div class="text-center py-12">
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 class="text-lg font-semibold mb-2">{{ $t('search.noResults') }}</h3>
        <p class="text-base-content/70 mb-4">{{ $t('search.noResultsDescription') }}</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <button class="btn btn-outline btn-sm" @click="clearSearch">
            {{ $t('search.clearSearch') }}
          </button>
          <button class="btn btn-primary btn-sm" @click="showSearchTips = true">
            {{ $t('search.searchTips') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results List -->
    <div v-else class="results-list">
      <div class="space-y-4">
        <div
          v-for="(result, index) in searchResults"
          :key="result.item.id"
          class="result-item"
          :class="{ 'result-item-highlighted': highlightedIndex === index }"
        >
          <div class="result-header">
            <div class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-8 h-8 rounded-full">
                  <img
                    :src="getUserAvatar(result.item.userId)"
                    :alt="getUserName(result.item.userId)"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ getUserName(result.item.userId) }}</span>
                  <span class="text-sm text-base-content/60"
                    >#{{ getChannelName(result.item.channelId) }}</span
                  >
                  <span class="text-xs text-base-content/50">{{
                    formatDate(result.item.timestamp)
                  }}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="badge badge-sm" :class="getMessageTypeBadgeClass(result.item.type)">
                    {{ $t(`search.messageTypes.${result.item.type}`) }}
                  </span>
                  <span v-if="result.item.isPinned" class="badge badge-warning badge-sm">
                    {{ $t('search.pinned') }}
                  </span>
                  <span
                    v-if="result.item.attachments && result.item.attachments.length > 0"
                    class="badge badge-info badge-sm"
                  >
                    {{ $t('search.hasAttachments') }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-base-content/50">
                  {{ $t('search.relevance') }}: {{ Math.round((1 - result.score) * 100) }}%
                </span>
                <button class="btn btn-ghost btn-xs" @click="navigateToMessage(result.item)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="result-content">
            <div class="message-content" v-html="highlightText(result.item.content)"></div>

            <!-- Message Metadata -->
            <div v-if="result.item.metadata" class="message-metadata">
              <div v-if="result.item.metadata.title" class="metadata-item">
                <span class="metadata-label">{{ $t('search.title') }}:</span>
                <span
                  class="metadata-value"
                  v-html="highlightText(result.item.metadata.title)"
                ></span>
              </div>
              <div v-if="result.item.metadata.description" class="metadata-item">
                <span class="metadata-label">{{ $t('search.description') }}:</span>
                <span
                  class="metadata-value"
                  v-html="highlightText(result.item.metadata.description)"
                ></span>
              </div>
              <div
                v-if="result.item.metadata.tags && result.item.metadata.tags.length > 0"
                class="metadata-item"
              >
                <span class="metadata-label">{{ $t('search.tags') }}:</span>
                <div class="metadata-tags">
                  <span
                    v-for="tag in result.item.metadata.tags"
                    :key="tag"
                    class="tag"
                    v-html="highlightText(tag)"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Attachments -->
            <div
              v-if="result.item.attachments && result.item.attachments.length > 0"
              class="message-attachments"
            >
              <div class="attachments-header">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <span class="text-sm font-medium">{{ $t('search.attachments') }}</span>
              </div>
              <div class="attachments-list">
                <div
                  v-for="attachment in result.item.attachments"
                  :key="attachment.id"
                  class="attachment-item"
                >
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <div class="btn-group">
          <button
            class="btn btn-sm"
            :class="{ 'btn-disabled': currentPage === 1 }"
            @click="previousPage"
            :disabled="currentPage === 1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            class="btn btn-sm"
            :class="{ 'btn-active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="btn btn-sm"
            :class="{ 'btn-disabled': currentPage === totalPages }"
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div class="pagination-info">
          {{ $t('search.pageOf', { current: currentPage, total: totalPages }) }}
        </div>
      </div>
    </div>

    <!-- Save Search Modal -->
    <div v-if="showSaveSearchModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">{{ $t('search.saveSearch') }}</h3>
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">{{ $t('search.searchName') }}</span>
          </label>
          <input
            v-model="saveSearchName"
            type="text"
            class="input input-bordered"
            :placeholder="$t('search.searchNamePlaceholder')"
          />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showSaveSearchModal = false">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            @click="handleSaveSearch"
            :disabled="!saveSearchName.trim()"
          >
            {{ $t('search.save') }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showSaveSearchModal = false"></div>
    </div>

    <!-- Search Tips Modal -->
    <div v-if="showSearchTips" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="text-lg font-bold mb-4">{{ $t('search.searchTips') }}</h3>
        <div class="space-y-4">
          <div class="tip-item">
            <h4 class="font-semibold">{{ $t('search.tipExactPhrase') }}</h4>
            <p class="text-sm text-base-content/70">{{ $t('search.tipExactPhraseDescription') }}</p>
            <code class="code-block">"exact phrase"</code>
          </div>
          <div class="tip-item">
            <h4 class="font-semibold">{{ $t('search.tipExcludeWords') }}</h4>
            <p class="text-sm text-base-content/70">
              {{ $t('search.tipExcludeWordsDescription') }}
            </p>
            <code class="code-block">search -exclude</code>
          </div>
          <div class="tip-item">
            <h4 class="font-semibold">{{ $t('search.tipWildcards') }}</h4>
            <p class="text-sm text-base-content/70">{{ $t('search.tipWildcardsDescription') }}</p>
            <code class="code-block">search*</code>
          </div>
          <div class="tip-item">
            <h4 class="font-semibold">{{ $t('search.tipFilters') }}</h4>
            <p class="text-sm text-base-content/70">{{ $t('search.tipFiltersDescription') }}</p>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn btn-primary" @click="showSearchTips = false">
            {{ $t('common.gotIt') }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showSearchTips = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSearch } from '@/composables/useSearch'
import { useUserStore } from '@/stores/hub/user'
import { useChannelStore } from '@/stores/hub/channels'
import type { SearchResult } from '@/services/searchService'

const { t } = useI18n()
const {
  searchResults,
  searchStats,
  isSearching,
  error,
  hasResults,
  currentPage,
  totalPages,
  highlightText,
  clearSearch,
  goToPage,
  nextPage,
  previousPage,
  saveSearch,
} = useSearch()

const userStore = useUserStore()
const channelStore = useChannelStore()

// Reactive state
const showSaveSearchModal = ref(false)
const showSearchTips = ref(false)
const saveSearchName = ref('')
const highlightedIndex = ref(-1)

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
function getUserName(userId: string): string {
  const user = userStore.getUserById(userId)
  return user?.displayName || user?.username || 'Unknown User'
}

function getUserAvatar(userId: string): string {
  const user = userStore.getUserById(userId)
  return user?.avatar || 'https://www.gravatar.com/avatar/?d=mp'
}

function getChannelName(channelId: string): string {
  const channel = channelStore.getChannelById(channelId)
  return channel?.name || 'Unknown Channel'
}

function getMessageTypeBadgeClass(type: string): string {
  const classes = {
    text: 'badge-neutral',
    image: 'badge-info',
    file: 'badge-warning',
    event: 'badge-success',
  }
  return classes[type as keyof typeof classes] || 'badge-neutral'
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function navigateToMessage(message: any) {
  // Emit event to parent component to navigate to the message
  // This would typically involve routing to the specific channel and message
  console.log('Navigate to message:', message)
  // In a real implementation, you would emit an event or use a router
}

function exportResults() {
  // Export search results to CSV or JSON
  const data = searchResults.value.map((result) => ({
    content: result.item.content,
    user: getUserName(result.item.userId),
    channel: getChannelName(result.item.channelId),
    timestamp: result.item.timestamp,
    type: result.item.type,
    relevance: Math.round((1 - result.score) * 100),
  }))

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `search-results-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleSaveSearch() {
  if (saveSearchName.value.trim()) {
    // Get current search parameters from the composable
    const searchQuery = '' // This would come from the search composable
    const searchFilters = {} // This would come from the search composable

    saveSearch(saveSearchName.value, searchQuery, searchFilters)
    showSaveSearchModal.value = false
    saveSearchName.value = ''
  }
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!hasResults.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, searchResults.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      if (highlightedIndex.value >= 0) {
        event.preventDefault()
        navigateToMessage(searchResults.value[highlightedIndex.value].item)
      }
      break
    case 'Escape':
      highlightedIndex.value = -1
      break
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.search-results {
  @apply space-y-6;
}

.results-header {
  @apply space-y-4;
}

.stats-strip {
  @apply flex flex-wrap gap-4 text-sm;
}

.stat-item {
  @apply flex items-center gap-2;
}

.stat-label {
  @apply text-base-content/60;
}

.stat-value {
  @apply font-medium;
}

.loading-state {
  @apply flex items-center justify-center py-12;
}

.error-state {
  @apply py-8;
}

.no-results-state {
  @apply text-center py-12;
}

.results-list {
  @apply space-y-4;
}

.result-item {
  @apply card bg-base-100 shadow-sm border border-base-300 transition-all duration-200;
}

.result-item:hover {
  @apply shadow-md;
}

.result-item-highlighted {
  @apply ring-2 ring-primary ring-offset-2;
}

.result-header {
  @apply p-4 border-b border-base-300;
}

.result-content {
  @apply p-4 space-y-3;
}

.message-content {
  @apply text-base leading-relaxed;
}

.message-metadata {
  @apply space-y-2 text-sm;
}

.metadata-item {
  @apply flex items-start gap-2;
}

.metadata-label {
  @apply font-medium text-base-content/70 min-w-0 flex-shrink-0;
}

.metadata-value {
  @apply text-base-content/90;
}

.metadata-tags {
  @apply flex flex-wrap gap-1;
}

.tag {
  @apply badge badge-outline badge-sm;
}

.message-attachments {
  @apply bg-base-200 rounded-lg p-3;
}

.attachments-header {
  @apply flex items-center gap-2 mb-2 text-sm font-medium;
}

.attachments-list {
  @apply space-y-1;
}

.attachment-item {
  @apply flex items-center justify-between text-sm;
}

.attachment-name {
  @apply font-medium;
}

.attachment-size {
  @apply text-base-content/60;
}

.pagination {
  @apply flex items-center justify-between mt-8;
}

.pagination-info {
  @apply text-sm text-base-content/60;
}

.btn-group {
  @apply flex;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.modal {
  @apply transition-all duration-200;
}

.code-block {
  @apply bg-base-200 px-2 py-1 rounded text-sm font-mono;
}

.tip-item {
  @apply space-y-2;
}

.search-highlight {
  @apply bg-warning text-warning-content px-1 rounded;
}

@media (max-width: 768px) {
  .results-header {
    @apply space-y-2;
  }

  .stats-strip {
    @apply flex-col gap-2;
  }

  .pagination {
    @apply flex-col gap-4;
  }

  .result-header {
    @apply p-3;
  }

  .result-content {
    @apply p-3;
  }
}
</style>
