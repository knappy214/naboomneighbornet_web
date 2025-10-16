import Fuse from 'fuse.js'
import type { Message } from '@/types/messages'
import type { User } from '@/types/user'

// Search result types
export interface SearchResult {
  item: Message
  refIndex: number
  score: number
  matches?: Fuse.FuseResultMatch[]
}

export interface SearchFilters {
  channels?: string[]
  users?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  contentType?: ('text' | 'image' | 'file' | 'event')[]
  hasAttachments?: boolean
  isPinned?: boolean
}

export interface SearchOptions {
  query: string
  filters?: SearchFilters
  sortBy?: 'relevance' | 'date' | 'channel' | 'user'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface SearchStats {
  totalResults: number
  searchTime: number
  channelsFound: number
  usersFound: number
  dateRange: {
    earliest: Date | null
    latest: Date | null
  }
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilters
  createdAt: Date
  lastUsed: Date
  useCount: number
}

export interface SearchHistory {
  id: string
  query: string
  filters: SearchFilters
  timestamp: Date
  resultCount: number
}

// Fuse.js configuration for messages
const messageSearchOptions: Fuse.IFuseOptions<Message> = {
  keys: [
    { name: 'content', weight: 0.7 },
    { name: 'metadata.title', weight: 0.3 },
    { name: 'metadata.description', weight: 0.2 },
    { name: 'metadata.tags', weight: 0.1 },
  ],
  includeScore: true,
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true,
  findAllMatches: true,
  useExtendedSearch: true,
  minMatchCharLength: 2,
}

// Fuse.js configuration for users
const userSearchOptions: Fuse.IFuseOptions<User> = {
  keys: [
    { name: 'username', weight: 0.8 },
    { name: 'displayName', weight: 0.7 },
    { name: 'bio', weight: 0.5 },
    { name: 'email', weight: 0.3 },
  ],
  includeScore: true,
  includeMatches: true,
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  useExtendedSearch: true,
  minMatchCharLength: 2,
}

class SearchService {
  private messageFuse: Fuse<Message> | null = null
  private userFuse: Fuse<User> | null = null
  private messages: Message[] = []
  private users: User[] = []
  private savedSearches: SavedSearch[] = []
  private searchHistory: SearchHistory[] = []

  // Initialize search indexes
  initialize(messages: Message[], users: User[]) {
    this.messages = messages
    this.users = users

    this.messageFuse = new Fuse(messages, messageSearchOptions)
    this.userFuse = new Fuse(users, userSearchOptions)

    this.loadSavedSearches()
    this.loadSearchHistory()
  }

  // Update search indexes when data changes
  updateMessages(messages: Message[]) {
    this.messages = messages
    this.messageFuse = new Fuse(messages, messageSearchOptions)
  }

  updateUsers(users: User[]) {
    this.users = users
    this.userFuse = new Fuse(users, userSearchOptions)
  }

  // Main search function
  async search(options: SearchOptions): Promise<{
    results: SearchResult[]
    stats: SearchStats
  }> {
    const startTime = performance.now()

    if (!this.messageFuse) {
      throw new Error('Search service not initialized')
    }

    // Apply filters first
    let filteredMessages = this.applyFilters(this.messages, options.filters)

    // Create temporary Fuse instance with filtered data
    const tempFuse = new Fuse(filteredMessages, messageSearchOptions)

    // Perform search
    const fuseResults = tempFuse.search(options.query)

    // Convert to our result format
    const results: SearchResult[] = fuseResults.map((result) => ({
      item: result.item,
      refIndex: result.refIndex,
      score: result.score || 0,
      matches: result.matches,
    }))

    // Apply sorting
    const sortedResults = this.applySorting(results, options.sortBy, options.sortOrder)

    // Apply pagination
    const paginatedResults = this.applyPagination(sortedResults, options.limit, options.offset)

    // Calculate stats
    const stats = this.calculateStats(results, startTime)

    // Save to search history
    this.addToSearchHistory(options.query, options.filters, results.length)

    return {
      results: paginatedResults,
      stats,
    }
  }

  // Search users
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    if (!this.userFuse) {
      throw new Error('Search service not initialized')
    }

    const results = this.userFuse.search(query)
    return results.slice(0, limit).map((result) => result.item)
  }

  // Apply filters to messages
  private applyFilters(messages: Message[], filters?: SearchFilters): Message[] {
    if (!filters) return messages

    return messages.filter((message) => {
      // Channel filter
      if (filters.channels && filters.channels.length > 0) {
        if (!filters.channels.includes(message.channelId)) {
          return false
        }
      }

      // User filter
      if (filters.users && filters.users.length > 0) {
        if (!filters.users.includes(message.userId)) {
          return false
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const messageDate = new Date(message.timestamp)
        if (messageDate < filters.dateRange.start || messageDate > filters.dateRange.end) {
          return false
        }
      }

      // Content type filter
      if (filters.contentType && filters.contentType.length > 0) {
        if (!filters.contentType.includes(message.type)) {
          return false
        }
      }

      // Has attachments filter
      if (filters.hasAttachments !== undefined) {
        const hasAttachments = message.attachments && message.attachments.length > 0
        if (hasAttachments !== filters.hasAttachments) {
          return false
        }
      }

      // Is pinned filter
      if (filters.isPinned !== undefined) {
        if (message.isPinned !== filters.isPinned) {
          return false
        }
      }

      return true
    })
  }

  // Apply sorting to results
  private applySorting(
    results: SearchResult[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): SearchResult[] {
    if (!sortBy || sortBy === 'relevance') {
      return results // Already sorted by relevance from Fuse.js
    }

    const sorted = [...results].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.item.timestamp).getTime() - new Date(b.item.timestamp).getTime()
          break
        case 'channel':
          comparison = a.item.channelId.localeCompare(b.item.channelId)
          break
        case 'user':
          comparison = a.item.userId.localeCompare(b.item.userId)
          break
        default:
          return 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  // Apply pagination to results
  private applyPagination(results: SearchResult[], limit?: number, offset = 0): SearchResult[] {
    if (!limit) return results

    const start = offset
    const end = offset + limit
    return results.slice(start, end)
  }

  // Calculate search statistics
  private calculateStats(results: SearchResult[], startTime: number): SearchStats {
    const endTime = performance.now()
    const searchTime = endTime - startTime

    const channelsFound = new Set(results.map((r) => r.item.channelId)).size
    const usersFound = new Set(results.map((r) => r.item.userId)).size

    const timestamps = results.map((r) => new Date(r.item.timestamp))
    const earliest =
      timestamps.length > 0 ? new Date(Math.min(...timestamps.map((d) => d.getTime()))) : null
    const latest =
      timestamps.length > 0 ? new Date(Math.max(...timestamps.map((d) => d.getTime()))) : null

    return {
      totalResults: results.length,
      searchTime,
      channelsFound,
      usersFound,
      dateRange: {
        earliest,
        latest,
      },
    }
  }

  // Highlight search terms in text
  highlightText(text: string, query: string, className = 'search-highlight'): string {
    if (!query.trim()) return text

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi')
    return text.replace(regex, `<span class="${className}">$1</span>`)
  }

  // Escape special regex characters
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Get search suggestions
  getSuggestions(query: string, limit = 5): string[] {
    if (!query.trim() || query.length < 2) return []

    const suggestions = new Set<string>()

    // Get suggestions from message content
    this.messages.forEach((message) => {
      const words = message.content.toLowerCase().split(/\s+/)
      words.forEach((word) => {
        if (word.includes(query.toLowerCase()) && word.length > 2) {
          suggestions.add(word)
        }
      })
    })

    // Get suggestions from user names
    this.users.forEach((user) => {
      if (user.username.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(user.username)
      }
      if (user.displayName?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(user.displayName)
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // Saved searches management
  saveSearch(name: string, query: string, filters: SearchFilters): string {
    const id = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const savedSearch: SavedSearch = {
      id,
      name,
      query,
      filters,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0,
    }

    this.savedSearches.push(savedSearch)
    this.persistSavedSearches()
    return id
  }

  getSavedSearches(): SavedSearch[] {
    return [...this.savedSearches].sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
  }

  deleteSavedSearch(id: string): boolean {
    const index = this.savedSearches.findIndex((s) => s.id === id)
    if (index !== -1) {
      this.savedSearches.splice(index, 1)
      this.persistSavedSearches()
      return true
    }
    return false
  }

  useSavedSearch(id: string): { query: string; filters: SearchFilters } | null {
    const savedSearch = this.savedSearches.find((s) => s.id === id)
    if (savedSearch) {
      savedSearch.lastUsed = new Date()
      savedSearch.useCount++
      this.persistSavedSearches()
      return {
        query: savedSearch.query,
        filters: savedSearch.filters,
      }
    }
    return null
  }

  // Search history management
  private addToSearchHistory(query: string, filters?: SearchFilters, resultCount = 0) {
    const historyItem: SearchHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      filters: filters || {},
      timestamp: new Date(),
      resultCount,
    }

    this.searchHistory.unshift(historyItem)

    // Keep only last 100 history items
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(0, 100)
    }

    this.persistSearchHistory()
  }

  getSearchHistory(): SearchHistory[] {
    return [...this.searchHistory].slice(0, 20) // Return last 20 items
  }

  clearSearchHistory(): void {
    this.searchHistory = []
    this.persistSearchHistory()
  }

  // Persistence methods
  private persistSavedSearches(): void {
    try {
      localStorage.setItem('search_saved_searches', JSON.stringify(this.savedSearches))
    } catch (error) {
      console.error('Failed to persist saved searches:', error)
    }
  }

  private loadSavedSearches(): void {
    try {
      const stored = localStorage.getItem('search_saved_searches')
      if (stored) {
        this.savedSearches = JSON.parse(stored).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastUsed: new Date(s.lastUsed),
        }))
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error)
      this.savedSearches = []
    }
  }

  private persistSearchHistory(): void {
    try {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory))
    } catch (error) {
      console.error('Failed to persist search history:', error)
    }
  }

  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem('search_history')
      if (stored) {
        this.searchHistory = JSON.parse(stored).map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }))
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
      this.searchHistory = []
    }
  }

  // Get search analytics
  getSearchAnalytics(): {
    totalSearches: number
    averageResults: number
    mostSearchedTerms: Array<{ term: string; count: number }>
    searchTrends: Array<{ date: string; count: number }>
  } {
    const totalSearches = this.searchHistory.length
    const averageResults =
      totalSearches > 0
        ? this.searchHistory.reduce((sum, h) => sum + h.resultCount, 0) / totalSearches
        : 0

    // Count search terms
    const termCounts = new Map<string, number>()
    this.searchHistory.forEach((h) => {
      const terms = h.query
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 2)
      terms.forEach((term) => {
        termCounts.set(term, (termCounts.get(term) || 0) + 1)
      })
    })

    const mostSearchedTerms = Array.from(termCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Group by date
    const dateCounts = new Map<string, number>()
    this.searchHistory.forEach((h) => {
      const date = h.timestamp.toISOString().split('T')[0]
      dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
    })

    const searchTrends = Array.from(dateCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalSearches,
      averageResults,
      mostSearchedTerms,
      searchTrends,
    }
  }
}

// Export singleton instance
export const searchService = new SearchService()
