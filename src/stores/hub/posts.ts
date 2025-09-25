import { defineStore } from 'pinia'
import { fetchThreadPosts, createPost } from '@/services/hub'
import type { HubPost, HubRealtimeEvent, PostComposerPayload } from '@/types/hub'

const normalizePost = (threadId: string, payload: Record<string, unknown>): HubPost => ({
  id: String(payload.id ?? crypto.randomUUID()),
  threadId,
  author: String(payload.author ?? payload.created_by ?? 'Community Bot'),
  createdAt: String(payload.created_at ?? new Date().toISOString()),
  body: String(payload.body ?? payload.content ?? ''),
  optimistic: Boolean(payload.optimistic ?? false),
})

export const usePostsStore = defineStore('hub-posts', {
  state: () => ({
    postsByThread: {} as Record<string, HubPost[]>,
    loadingMap: {} as Record<string, boolean>,
    errorMap: {} as Record<string, string | null>,
  }),
  getters: {
    postsForThread: (state) => (threadId: string) => state.postsByThread[threadId] ?? [],
    isLoading: (state) => (threadId: string) => state.loadingMap[threadId] ?? false,
  },
  actions: {
    async loadPosts(threadId: string) {
      this.loadingMap[threadId] = true
      this.errorMap[threadId] = null
      try {
        this.postsByThread[threadId] = await fetchThreadPosts(threadId)
      } catch (error) {
        this.errorMap[threadId] = (error as Error).message
      } finally {
        this.loadingMap[threadId] = false
      }
    },
    async sendPost(threadId: string, payload: PostComposerPayload) {
      const optimisticPost: HubPost = {
        id: crypto.randomUUID(),
        threadId,
        author: 'You',
        createdAt: new Date().toISOString(),
        body: payload.body,
        optimistic: true,
      }

      const collection = this.postsByThread[threadId] ?? []
      collection.push(optimisticPost)
      this.postsByThread[threadId] = [...collection]

      try {
        const saved = await createPost(threadId, payload)
        this.replacePost(threadId, optimisticPost.id, saved)
      } catch (error) {
        this.errorMap[threadId] = (error as Error).message
        this.removePost(threadId, optimisticPost.id)
        throw error
      }
    },
    replacePost(threadId: string, placeholderId: string, post: HubPost) {
      const collection = this.postsByThread[threadId] ?? []
      const index = collection.findIndex((item) => item.id === placeholderId)
      if (index >= 0) {
        collection.splice(index, 1, { ...post, optimistic: false })
        this.postsByThread[threadId] = [...collection]
      }
    },
    removePost(threadId: string, postId: string) {
      const collection = this.postsByThread[threadId] ?? []
      this.postsByThread[threadId] = collection.filter((post) => post.id !== postId)
    },
    applyRealtimeUpdate(event: HubRealtimeEvent) {
      const payload = event.payload || {}
      const threadId = String(payload.thread_id ?? payload.threadId ?? '')
      if (!threadId) return
      const post = normalizePost(threadId, payload)
      const collection = this.postsByThread[threadId] ?? []
      const existingIndex = collection.findIndex((item) => item.id === post.id)
      if (existingIndex >= 0) {
        collection.splice(existingIndex, 1, { ...collection[existingIndex], ...post })
      } else {
        collection.push(post)
      }
      this.postsByThread[threadId] = [...collection]
    },
  },
})
