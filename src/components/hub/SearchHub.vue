<template>
  <div class="search-hub">
    <!-- Header -->
    <div class="search-header">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold">{{ $t('search.title') }}</h1>
          <p class="text-base-content/70 mt-2">{{ $t('search.description') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Search Analytics -->
          <button
            class="btn btn-ghost btn-sm"
            @click="showAnalytics = true"
            :disabled="!hasSearchHistory"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {{ $t('search.analytics') }}
          </button>

          <!-- Help -->
          <button class="btn btn-ghost btn-sm" @click="showHelp = true">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ $t('search.help') }}
          </button>
        </div>
      </div>

      <!-- Quick Search Stats -->
      <div v-if="searchAnalytics.totalSearches > 0" class="quick-stats">
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div class="stat-title">{{ $t('search.totalSearches') }}</div>
            <div class="stat-value text-primary">{{ searchAnalytics.totalSearches }}</div>
            <div class="stat-desc">{{ $t('search.allTime') }}</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div class="stat-title">{{ $t('search.averageResults') }}</div>
            <div class="stat-value text-secondary">
              {{ Math.round(searchAnalytics.averageResults) }}
            </div>
            <div class="stat-desc">{{ $t('search.perSearch') }}</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-accent">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div class="stat-title">{{ $t('search.topSearchTerm') }}</div>
            <div class="stat-value text-accent">
              {{ searchAnalytics.mostSearchedTerms[0]?.term || 'N/A' }}
            </div>
            <div class="stat-desc">
              {{ searchAnalytics.mostSearchedTerms[0]?.count || 0 }} {{ $t('search.searches') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Interface -->
    <div class="search-interface">
      <MessageSearch @search="handleSearch" />
    </div>

    <!-- Results -->
    <div class="search-results">
      <SearchResults />
    </div>

    <!-- Search Analytics Modal -->
    <div v-if="showAnalytics" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="text-2xl font-bold mb-6">{{ $t('search.analytics') }}</h3>

        <div class="space-y-6">
          <!-- Overview Stats -->
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">{{ $t('search.totalSearches') }}</div>
              <div class="stat-value text-primary">{{ searchAnalytics.totalSearches }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('search.averageResults') }}</div>
              <div class="stat-value text-secondary">
                {{ Math.round(searchAnalytics.averageResults) }}
              </div>
            </div>
            <div class="stat">
              <div class="stat-title">{{ $t('search.searchTrends') }}</div>
              <div class="stat-value text-accent">{{ searchAnalytics.searchTrends.length }}</div>
            </div>
          </div>

          <!-- Most Searched Terms -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h4 class="card-title">{{ $t('search.mostSearchedTerms') }}</h4>
              <div class="space-y-2">
                <div
                  v-for="(term, index) in searchAnalytics.mostSearchedTerms.slice(0, 10)"
                  :key="term.term"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <span class="badge badge-primary badge-sm">{{ index + 1 }}</span>
                    <span class="font-medium">{{ term.term }}</span>
                  </div>
                  <span class="text-sm text-base-content/60"
                    >{{ term.count }} {{ $t('search.searches') }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Search Trends Chart -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h4 class="card-title">{{ $t('search.searchTrends') }}</h4>
              <div class="h-64 flex items-center justify-center text-base-content/60">
                <!-- In a real implementation, you would use a charting library like Chart.js or D3.js -->
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
                  <p>{{ $t('search.chartPlaceholder') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-primary" @click="showAnalytics = false">
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showAnalytics = false"></div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelp" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="text-2xl font-bold mb-6">{{ $t('search.help') }}</h3>

        <div class="space-y-6">
          <!-- Search Tips -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h4 class="card-title">{{ $t('search.searchTips') }}</h4>
              <div class="space-y-4">
                <div class="tip-item">
                  <h5 class="font-semibold">{{ $t('search.tipExactPhrase') }}</h5>
                  <p class="text-sm text-base-content/70">
                    {{ $t('search.tipExactPhraseDescription') }}
                  </p>
                  <code class="code-block">"exact phrase"</code>
                </div>
                <div class="tip-item">
                  <h5 class="font-semibold">{{ $t('search.tipExcludeWords') }}</h5>
                  <p class="text-sm text-base-content/70">
                    {{ $t('search.tipExcludeWordsDescription') }}
                  </p>
                  <code class="code-block">search -exclude</code>
                </div>
                <div class="tip-item">
                  <h5 class="font-semibold">{{ $t('search.tipWildcards') }}</h5>
                  <p class="text-sm text-base-content/70">
                    {{ $t('search.tipWildcardsDescription') }}
                  </p>
                  <code class="code-block">search*</code>
                </div>
                <div class="tip-item">
                  <h5 class="font-semibold">{{ $t('search.tipFilters') }}</h5>
                  <p class="text-sm text-base-content/70">
                    {{ $t('search.tipFiltersDescription') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h4 class="card-title">{{ $t('search.keyboardShortcuts') }}</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ $t('search.shortcutSearch') }}</span>
                  <kbd class="kbd kbd-sm">Ctrl + K</kbd>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ $t('search.shortcutNavigate') }}</span>
                  <kbd class="kbd kbd-sm">↑ ↓</kbd>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ $t('search.shortcutSelect') }}</span>
                  <kbd class="kbd kbd-sm">Enter</kbd>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ $t('search.shortcutClear') }}</span>
                  <kbd class="kbd kbd-sm">Escape</kbd>
                </div>
              </div>
            </div>
          </div>

          <!-- Features -->
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <h4 class="card-title">{{ $t('search.features') }}</h4>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{{ $t('search.featureFuzzySearch') }}</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{{ $t('search.featureFilters') }}</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{{ $t('search.featureHighlighting') }}</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{{ $t('search.featureSavedSearches') }}</span>
                </li>
                <li class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{{ $t('search.featureExport') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-primary" @click="showHelp = false">
            {{ $t('common.gotIt') }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showHelp = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSearch } from '@/composables/useSearch'
import MessageSearch from './MessageSearch.vue'
import SearchResults from './SearchResults.vue'

const { t } = useI18n()
const { getSearchAnalytics, getSearchHistory } = useSearch()

// Reactive state
const showAnalytics = ref(false)
const showHelp = ref(false)

// Computed properties
const searchAnalytics = computed(() => getSearchAnalytics())
const hasSearchHistory = computed(() => getSearchHistory().length > 0)

// Methods
function handleSearch() {
  // This will be handled by the MessageSearch component
  // The SearchResults component will automatically update
}

// Lifecycle
onMounted(() => {
  // Initialize any required data
})
</script>

<style scoped>
.search-hub {
  @apply space-y-8;
}

.search-header {
  @apply space-y-6;
}

.quick-stats {
  @apply mb-6;
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

.search-interface {
  @apply space-y-4;
}

.search-results {
  @apply space-y-6;
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

.modal {
  @apply transition-all duration-200;
}

.tip-item {
  @apply space-y-2;
}

.code-block {
  @apply bg-base-200 px-2 py-1 rounded text-sm font-mono;
}

.kbd {
  @apply transition-all duration-200;
}

@media (max-width: 768px) {
  .search-header {
    @apply space-y-4;
  }

  .stats {
    @apply grid-cols-1;
  }

  .search-interface {
    @apply space-y-2;
  }
}
</style>
