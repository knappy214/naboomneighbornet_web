<template>
  <div class="message-search">
    <!-- Search Input -->
    <div class="search-input-container">
      <div class="relative">
        <input
          v-model="localQuery"
          type="text"
          :placeholder="$t('search.placeholder')"
          class="input input-bordered w-full pr-12"
          @input="handleQueryInput"
          @focus="showSuggestions = true"
          @blur="handleInputBlur"
          @keydown.enter="handleSearch"
          @keydown.escape="clearSearch"
        />
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <button v-if="localQuery" class="btn btn-ghost btn-xs" @click="clearSearch">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            class="btn btn-primary btn-xs"
            @click="handleSearch"
            :disabled="isSearching || !localQuery.trim()"
          >
            <span v-if="isSearching" class="loading loading-spinner loading-xs"></span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search Suggestions -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <div class="suggestions-header">
          <span class="text-sm font-medium">{{ $t('search.suggestions') }}</span>
        </div>
        <div class="suggestions-list">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>{{ suggestion }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Controls -->
    <div class="search-controls">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Sort Options -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">{{ $t('search.sortBy') }}:</label>
          <select
            v-model="localSortBy"
            class="select select-bordered select-sm"
            @change="handleSortChange"
          >
            <option value="relevance">{{ $t('search.sortByRelevance') }}</option>
            <option value="date">{{ $t('search.sortByDate') }}</option>
            <option value="channel">{{ $t('search.sortByChannel') }}</option>
            <option value="user">{{ $t('search.sortByUser') }}</option>
          </select>
          <button
            class="btn btn-ghost btn-sm"
            @click="toggleSortOrder"
            :title="sortOrder === 'desc' ? $t('search.sortDescending') : $t('search.sortAscending')"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'rotate-180': sortOrder === 'asc' }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
          </button>
        </div>

        <!-- Results Per Page -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">{{ $t('search.resultsPerPage') }}:</label>
          <select
            v-model="localResultsPerPage"
            class="select select-bordered select-sm"
            @change="handleResultsPerPageChange"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <!-- Filter Toggle -->
        <button
          class="btn btn-outline btn-sm"
          :class="{ 'btn-primary': hasFilters }"
          @click="showFilters = !showFilters"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
            />
          </svg>
          {{ $t('search.filters') }}
          <span v-if="activeFiltersCount > 0" class="badge badge-primary badge-sm ml-1">{{
            activeFiltersCount
          }}</span>
        </button>

        <!-- Saved Searches -->
        <div class="dropdown dropdown-end">
          <button class="btn btn-outline btn-sm" tabindex="0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {{ $t('search.savedSearches') }}
          </button>
          <div class="dropdown-content bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
            <div
              v-if="savedSearches.length === 0"
              class="p-4 text-center text-sm text-base-content/70"
            >
              {{ $t('search.noSavedSearches') }}
            </div>
            <div v-else class="space-y-1">
              <button
                v-for="savedSearch in savedSearches"
                :key="savedSearch.id"
                class="btn btn-ghost btn-sm w-full justify-start"
                @click="useSavedSearch(savedSearch.id)"
              >
                <div class="flex-1 text-left">
                  <div class="font-medium">{{ savedSearch.name }}</div>
                  <div class="text-xs text-base-content/70">{{ savedSearch.query }}</div>
                </div>
                <button
                  class="btn btn-ghost btn-xs"
                  @click.stop="deleteSavedSearch(savedSearch.id)"
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
              </button>
            </div>
          </div>
        </div>

        <!-- Search History -->
        <div class="dropdown dropdown-end">
          <button class="btn btn-outline btn-sm" tabindex="0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ $t('search.history') }}
          </button>
          <div class="dropdown-content bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
            <div
              v-if="searchHistory.length === 0"
              class="p-4 text-center text-sm text-base-content/70"
            >
              {{ $t('search.noSearchHistory') }}
            </div>
            <div v-else class="space-y-1">
              <button
                v-for="historyItem in searchHistory"
                :key="historyItem.id"
                class="btn btn-ghost btn-sm w-full justify-start"
                @click="useSearchHistory(historyItem)"
              >
                <div class="flex-1 text-left">
                  <div class="font-medium">{{ historyItem.query }}</div>
                  <div class="text-xs text-base-content/70">
                    {{ formatDate(historyItem.timestamp) }} • {{ historyItem.resultCount }}
                    {{ $t('search.results') }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showFilters" class="advanced-filters">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">{{ $t('search.advancedFilters') }}</h3>
            <button class="btn btn-ghost btn-sm" @click="clearAllFilters">
              {{ $t('search.clearAllFilters') }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Channel Filter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('search.filterByChannel') }}</span>
              </label>
              <select
                v-model="localFilters.channels"
                class="select select-bordered select-sm"
                multiple
                @change="handleFilterChange"
              >
                <option v-for="channel in availableChannels" :key="channel.id" :value="channel.id">
                  {{ channel.name }}
                </option>
              </select>
            </div>

            <!-- User Filter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('search.filterByUser') }}</span>
              </label>
              <select
                v-model="localFilters.users"
                class="select select-bordered select-sm"
                multiple
                @change="handleFilterChange"
              >
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.displayName || user.username }}
                </option>
              </select>
            </div>

            <!-- Content Type Filter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('search.filterByContentType') }}</span>
              </label>
              <select
                v-model="localFilters.contentType"
                class="select select-bordered select-sm"
                multiple
                @change="handleFilterChange"
              >
                <option
                  v-for="option in contentTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Date Range Filter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('search.filterByDateRange') }}</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-model="dateRangeStart"
                  type="date"
                  class="input input-bordered input-sm flex-1"
                  @change="handleDateRangeChange"
                />
                <input
                  v-model="dateRangeEnd"
                  type="date"
                  class="input input-bordered input-sm flex-1"
                  @change="handleDateRangeChange"
                />
              </div>
            </div>

            <!-- Has Attachments Filter -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('search.hasAttachments') }}</span>
                <input
                  v-model="localFilters.hasAttachments"
                  type="checkbox"
                  class="toggle toggle-primary"
                  @change="handleFilterChange"
                />
              </label>
            </div>

            <!-- Is Pinned Filter -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('search.isPinned') }}</span>
                <input
                  v-model="localFilters.isPinned"
                  type="checkbox"
                  class="toggle toggle-primary"
                  @change="handleFilterChange"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSearch } from '@/composables/useSearch'
import type { SearchFilters } from '@/services/searchService'

const { t } = useI18n()
const {
  searchQuery,
  searchFilters,
  sortBy,
  sortOrder,
  resultsPerPage,
  isSearching,
  suggestions,
  showSuggestions,
  hasFilters,
  activeFiltersCount,
  availableChannels,
  availableUsers,
  contentTypeOptions,
  savedSearches,
  searchHistory,
  updateQuery,
  updateFilters,
  clearAllFilters,
  updateSorting,
  useSavedSearch,
  deleteSavedSearch,
  useSearchHistory,
  clearSearch,
} = useSearch()

// Local reactive state
const localQuery = ref(searchQuery.value)
const localSortBy = ref(sortBy.value)
const localResultsPerPage = ref(resultsPerPage.value)
const localFilters = ref<SearchFilters>({ ...searchFilters.value })
const showFilters = ref(false)
const dateRangeStart = ref('')
const dateRangeEnd = ref('')

// Methods
function handleQueryInput() {
  updateQuery(localQuery.value)
}

function handleInputBlur() {
  // Delay hiding suggestions to allow clicking on them
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function handleSearch() {
  updateQuery(localQuery.value)
  showSuggestions.value = false
}

function selectSuggestion(suggestion: string) {
  localQuery.value = suggestion
  updateQuery(suggestion)
  showSuggestions.value = false
}

function toggleSortOrder() {
  const newOrder = sortOrder.value === 'desc' ? 'asc' : 'desc'
  updateSorting(localSortBy.value, newOrder)
}

function handleSortChange() {
  updateSorting(localSortBy.value, sortOrder.value)
}

function handleResultsPerPageChange() {
  resultsPerPage.value = localResultsPerPage.value
}

function handleFilterChange() {
  updateFilters(localFilters.value)
}

function handleDateRangeChange() {
  if (dateRangeStart.value && dateRangeEnd.value) {
    localFilters.value.dateRange = {
      start: new Date(dateRangeStart.value),
      end: new Date(dateRangeEnd.value),
    }
  } else {
    delete localFilters.value.dateRange
  }
  handleFilterChange()
}

// Watch for external changes
watch(searchQuery, (newValue) => {
  localQuery.value = newValue
})

watch(
  searchFilters,
  (newValue) => {
    localFilters.value = { ...newValue }

    // Update date range inputs
    if (newValue.dateRange) {
      dateRangeStart.value = newValue.dateRange.start.toISOString().split('T')[0]
      dateRangeEnd.value = newValue.dateRange.end.toISOString().split('T')[0]
    } else {
      dateRangeStart.value = ''
      dateRangeEnd.value = ''
    }
  },
  { deep: true },
)

watch(sortBy, (newValue) => {
  localSortBy.value = newValue
})

watch(resultsPerPage, (newValue) => {
  localResultsPerPage.value = newValue
})

// Utility functions
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  // Initialize local state from composable
  localQuery.value = searchQuery.value
  localSortBy.value = sortBy.value
  localResultsPerPage.value = resultsPerPage.value
  localFilters.value = { ...searchFilters.value }
})
</script>

<style scoped>
.message-search {
  @apply space-y-4;
}

.search-input-container {
  @apply relative;
}

.suggestions-dropdown {
  @apply absolute top-full left-0 right-0 z-10 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg;
}

.suggestions-header {
  @apply px-4 py-2 border-b border-base-300;
}

.suggestions-list {
  @apply max-h-60 overflow-y-auto;
}

.suggestion-item {
  @apply w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-sm;
}

.search-controls {
  @apply flex flex-wrap items-center gap-4;
}

.advanced-filters {
  @apply mt-4;
}

.card {
  @apply transition-all duration-200;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.dropdown-content {
  @apply transition-all duration-200;
}

.select {
  @apply transition-all duration-200;
}

.input {
  @apply transition-all duration-200;
}

.toggle {
  @apply transition-all duration-200;
}

.loading {
  @apply transition-all duration-200;
}

.badge {
  @apply transition-all duration-200;
}

@media (max-width: 768px) {
  .search-controls {
    @apply flex-col items-stretch;
  }

  .advanced-filters .grid {
    @apply grid-cols-1;
  }
}
</style>
