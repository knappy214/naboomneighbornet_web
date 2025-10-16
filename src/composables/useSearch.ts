import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  searchService,
  type SearchOptions,
  type SearchResult,
  type SearchFilters,
  type SearchStats,
  type SavedSearch,
  type SearchHistory,
} from '@/services/searchService'
import { useMessageStore } from '@/stores/hub/messages'
import { useUserStore } from '@/stores/hub/user'
import { useChannelStore } from '@/stores/hub/channels'

export function useSearch() {
  const messageStore = useMessageStore()
  const userStore = useUserStore()
  const channelStore = useChannelStore()

  // Reactive state
  const isInitialized = ref(false)
  const isSearching = ref(false)
  const searchQuery = ref('')
  const searchFilters = ref<SearchFilters>({})
  const searchResults = ref<SearchResult[]>([])
  const searchStats = ref<SearchStats>({
    totalResults: 0,
    searchTime: 0,
    channelsFound: 0,
    usersFound: 0,
    dateRange: { earliest: null, latest: null },
  })
  const currentPage = ref(1)
  const resultsPerPage = ref(20)
  const sortBy = ref<'relevance' | 'date' | 'channel' | 'user'>('relevance')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const error = ref<string | null>(null)
  const suggestions = ref<string[]>([])
  const showSuggestions = ref(false)

  // Computed properties
  const totalPages = computed(() =>
    Math.ceil(searchStats.value.totalResults / resultsPerPage.value),
  )
  const hasResults = computed(() => searchResults.value.length > 0)
  const hasFilters = computed(() => {
    const filters = searchFilters.value
    return !!(
      (filters.channels && filters.channels.length > 0) ||
      (filters.users && filters.users.length > 0) ||
      filters.dateRange ||
      (filters.contentType && filters.contentType.length > 0) ||
      filters.hasAttachments !== undefined ||
      filters.isPinned !== undefined
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    const filters = searchFilters.value

    if (filters.channels && filters.channels.length > 0) count++
    if (filters.users && filters.users.length > 0) count++
    if (filters.dateRange) count++
    if (filters.contentType && filters.contentType.length > 0) count++
    if (filters.hasAttachments !== undefined) count++
    if (filters.isPinned !== undefined) count++

    return count
  })

  // Available filter options
  const availableChannels = computed(() => channelStore.channels)
  const availableUsers = computed(() => userStore.users)
  const contentTypeOptions = [
    { value: 'text', label: 'Text Messages' },
    { value: 'image', label: 'Images' },
    { value: 'file', label: 'Files' },
    { value: 'event', label: 'Events' },
  ]

  // Initialize search service
  async function initialize() {
    try {
      // Wait for stores to be populated
      await Promise.all([
        messageStore.fetchMessages(),
        userStore.fetchUsers(),
        channelStore.fetchChannels(),
      ])

      searchService.initialize(messageStore.messages, userStore.users)
      isInitialized.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize search service'
      console.error('Search initialization error:', err)
    }
  }

  // Perform search
  async function search(query?: string, filters?: SearchFilters) {
    if (!isInitialized.value) {
      await initialize()
    }

    if (!isInitialized.value) {
      error.value = 'Search service not initialized'
      return
    }

    const searchQueryValue = query || searchQuery.value
    if (!searchQueryValue.trim()) {
      searchResults.value = []
      searchStats.value = {
        totalResults: 0,
        searchTime: 0,
        channelsFound: 0,
        usersFound: 0,
        dateRange: { earliest: null, latest: null },
      }
      return
    }

    isSearching.value = true
    error.value = null

    try {
      const options: SearchOptions = {
        query: searchQueryValue,
        filters: filters || searchFilters.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        limit: resultsPerPage.value,
        offset: (currentPage.value - 1) * resultsPerPage.value,
      }

      const result = await searchService.search(options)
      searchResults.value = result.results
      searchStats.value = result.stats
      currentPage.value = 1 // Reset to first page on new search
    } catch (err: any) {
      error.value = err.message || 'Search failed'
      console.error('Search error:', err)
    } finally {
      isSearching.value = false
    }
  }

  // Search with debouncing
  let searchTimeout: NodeJS.Timeout | null = null
  function debouncedSearch(query?: string, filters?: SearchFilters) {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
      search(query, filters)
    }, 300)
  }

  // Update search query
  function updateQuery(query: string) {
    searchQuery.value = query
    showSuggestions.value = query.length >= 2

    if (query.length >= 2) {
      suggestions.value = searchService.getSuggestions(query)
    } else {
      suggestions.value = []
    }

    debouncedSearch(query)
  }

  // Update filters
  function updateFilters(filters: Partial<SearchFilters>) {
    searchFilters.value = { ...searchFilters.value, ...filters }
    debouncedSearch()
  }

  // Clear specific filter
  function clearFilter(filterKey: keyof SearchFilters) {
    const newFilters = { ...searchFilters.value }
    delete newFilters[filterKey]
    searchFilters.value = newFilters
    debouncedSearch()
  }

  // Clear all filters
  function clearAllFilters() {
    searchFilters.value = {}
    debouncedSearch()
  }

  // Update sorting
  function updateSorting(
    by: 'relevance' | 'date' | 'channel' | 'user',
    order: 'asc' | 'desc' = 'desc',
  ) {
    sortBy.value = by
    sortOrder.value = order
    debouncedSearch()
  }

  // Pagination
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      search() // Re-run search with new page
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      goToPage(currentPage.value + 1)
    }
  }

  function previousPage() {
    if (currentPage.value > 1) {
      goToPage(currentPage.value - 1)
    }
  }

  // Highlight text in search results
  function highlightText(text: string, query?: string): string {
    const highlightQuery = query || searchQuery.value
    if (!highlightQuery.trim()) return text
    return searchService.highlightText(text, highlightQuery)
  }

  // Get search suggestions
  function getSuggestions(query: string): string[] {
    return searchService.getSuggestions(query)
  }

  // Search users
  async function searchUsers(query: string) {
    if (!isInitialized.value) {
      await initialize()
    }
    return searchService.searchUsers(query)
  }

  // Saved searches
  function saveSearch(name: string, query: string, filters: SearchFilters): string {
    return searchService.saveSearch(name, query, filters)
  }

  function getSavedSearches(): SavedSearch[] {
    return searchService.getSavedSearches()
  }

  function deleteSavedSearch(id: string): boolean {
    return searchService.deleteSavedSearch(id)
  }

  function useSavedSearch(id: string): boolean {
    const savedSearch = searchService.useSavedSearch(id)
    if (savedSearch) {
      searchQuery.value = savedSearch.query
      searchFilters.value = savedSearch.filters
      search()
      return true
    }
    return false
  }

  // Search history
  function getSearchHistory(): SearchHistory[] {
    return searchService.getSearchHistory()
  }

  function clearSearchHistory(): void {
    searchService.clearSearchHistory()
  }

  function useSearchHistory(historyItem: SearchHistory): void {
    searchQuery.value = historyItem.query
    searchFilters.value = historyItem.filters
    search()
  }

  // Get search analytics
  function getSearchAnalytics() {
    return searchService.getSearchAnalytics()
  }

  // Clear search
  function clearSearch() {
    searchQuery.value = ''
    searchFilters.value = {}
    searchResults.value = []
    searchStats.value = {
      totalResults: 0,
      searchTime: 0,
      channelsFound: 0,
      usersFound: 0,
      dateRange: { earliest: null, latest: null },
    }
    currentPage.value = 1
    suggestions.value = []
    showSuggestions.value = false
    error.value = null
  }

  // Refresh search (re-run with current parameters)
  function refreshSearch() {
    search()
  }

  // Watch for data changes and update search service
  watch(
    () => messageStore.messages,
    (newMessages) => {
      if (isInitialized.value) {
        searchService.updateMessages(newMessages)
      }
    },
    { deep: true },
  )

  watch(
    () => userStore.users,
    (newUsers) => {
      if (isInitialized.value) {
        searchService.updateUsers(newUsers)
      }
    },
    { deep: true },
  )

  // Lifecycle
  onMounted(async () => {
    await initialize()
  })

  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  })

  return {
    // State
    isInitialized,
    isSearching,
    searchQuery,
    searchFilters,
    searchResults,
    searchStats,
    currentPage,
    resultsPerPage,
    sortBy,
    sortOrder,
    error,
    suggestions,
    showSuggestions,

    // Computed
    totalPages,
    hasResults,
    hasFilters,
    activeFiltersCount,
    availableChannels,
    availableUsers,
    contentTypeOptions,

    // Methods
    initialize,
    search,
    updateQuery,
    updateFilters,
    clearFilter,
    clearAllFilters,
    updateSorting,
    goToPage,
    nextPage,
    previousPage,
    highlightText,
    getSuggestions,
    searchUsers,
    saveSearch,
    getSavedSearches,
    deleteSavedSearch,
    useSavedSearch,
    getSearchHistory,
    clearSearchHistory,
    useSearchHistory,
    getSearchAnalytics,
    clearSearch,
    refreshSearch,
  }
}
