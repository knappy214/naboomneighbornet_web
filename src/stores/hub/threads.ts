import { defineStore } from 'pinia'
import * as communityHubAPI from '@/services/communityHub'
import type { HubThread, HubRealtimeEvent } from '@/types/hub'

const normalizeThread = (channelId: string, payload: Record<string, unknown>): HubThread => ({
  id: String(payload.id ?? payload.thread_id ?? crypto.randomUUID()),
  channelId,
  title: String(payload.title ?? payload.name ?? 'Untitled Thread'),
  author: String(payload.author ?? payload.created_by ?? 'Community Bot'),
  createdAt: String(payload.created_at ?? new Date().toISOString()),
  updatedAt: String(payload.updated_at ?? payload.created_at ?? new Date().toISOString()),
  replyCount: Number(payload.reply_count ?? payload.posts_count ?? 0),
  lastReplySnippet:
    typeof payload.last_reply_snippet === 'string' ? payload.last_reply_snippet : '',
  pinned: Boolean(payload.pinned ?? false),
  searchRank: payload.rank ? Number(payload.rank) : undefined,
})

export const useThreadsStore = defineStore('hub-threads', {
  state: () => ({
    threadsByChannel: {} as Record<string, HubThread[]>,
    loading: false,
    searchTerm: '' as string,
    searchResults: {} as Record<string, HubThread[]>,
    searchLoading: false,
    searchTotals: {} as Record<string, number>,
    controllers: {} as Record<string, AbortController | null>,
  }),
  getters: {
    threadsForChannel: (state) => (channelId: string) => state.threadsByChannel[channelId] ?? [],
    searchForChannel: (state) => (channelId: string) => state.searchResults[channelId] ?? [],
    searchTotalForChannel: (state) => (channelId: string) => state.searchTotals[channelId] ?? 0,
    threadById: (state) => (threadId: string) => {
      for (const threads of Object.values(state.threadsByChannel)) {
        const found = threads.find((thread) => thread.id === threadId)
        if (found) return found
      }
      for (const threads of Object.values(state.searchResults)) {
        const found = threads.find((thread) => thread.id === threadId)
        if (found) return found
      }
      return undefined
    },
  },
  actions: {
    async loadThreads(channelId: string) {
      this.loading = true
      try {
        const threads = await communityHubAPI.getThreads({ channel: parseInt(channelId) })
        this.threadsByChannel[channelId] = threads
      } finally {
        this.loading = false
      }
    },
    async performSearch(channelId: string, query: string) {
      this.searchTerm = query
      if (!query.trim()) {
        this.searchResults[channelId] = []
        this.searchTotals[channelId] = 0
        this.searchTerm = ''
        return
      }

      if (this.controllers[channelId]) {
        this.controllers[channelId]?.abort()
      }

      const controller = new AbortController()
      this.controllers[channelId] = controller
      this.searchLoading = true

      try {
        const results = await communityHubAPI.searchThreads(query, parseInt(channelId))
        this.searchResults[channelId] = results
        this.searchTotals[channelId] = results.length
        this.searchTerm = query
      } finally {
        if (this.controllers[channelId] === controller) {
          this.controllers[channelId] = null
        }
        this.searchLoading = false
      }
    },
    applyRealtimeUpdate(channelId: string, event: HubRealtimeEvent) {
      const collection = this.threadsByChannel[channelId] ?? []
      const payload = event.payload || {}
      const updated = normalizeThread(channelId, payload)

      const existingIndex = collection.findIndex((thread) => thread.id === updated.id)
      if (existingIndex >= 0) {
        collection.splice(existingIndex, 1, { ...collection[existingIndex], ...updated })
      } else {
        collection.unshift(updated)
      }
      this.threadsByChannel[channelId] = [...collection]
    },
  },
})
