import { defineStore } from 'pinia'
import * as communityHubAPI from '@/services/communityHub'
import { createCommunityHubWebSocket } from '@/services/communityHubWebSocket'
import { useAuthStore } from '@/stores/auth'
import { useThreadsStore } from './threads'
import { usePostsStore } from './posts'
import type { HubChannel, HubRealtimeEvent, WebSocketStatus } from '@/types/hub'

export const useChannelsStore = defineStore('hub-channels', {
  state: () => ({
    channels: [] as HubChannel[],
    loading: false,
    error: null as string | null,
    activeChannelId: null as string | null,
    statuses: {} as Record<string, WebSocketStatus>,
    webSocket: null as ReturnType<typeof createCommunityHubWebSocket> | null,
  }),
  getters: {
    activeChannel(state): HubChannel | undefined {
      return state.channels.find((channel) => channel.id === state.activeChannelId)
    },
  },
  actions: {
    async initialize() {
      if (this.channels.length) return
      await this.loadChannels()
    },
    async loadChannels() {
      this.loading = true
      this.error = null
      try {
        this.channels = await communityHubAPI.getChannels()
        if (!this.activeChannelId && this.channels.length) {
          this.setActiveChannel(this.channels[0].id)
        }
      } catch (error) {
        this.error = (error as Error).message
      } finally {
        this.loading = false
      }
    },
    setActiveChannel(channelId: string) {
      this.activeChannelId = channelId
      this.ensureWebSocket()
      const threadsStore = useThreadsStore()
      threadsStore.loadThreads(channelId)
    },
    ensureWebSocket() {
      const authStore = useAuthStore()
      const token = authStore.accessToken
      if (!token || this.webSocket) return

      this.webSocket = createCommunityHubWebSocket(token, (status) => {
        // Update status for all channels
        this.channels.forEach((channel) => {
          this.statuses[channel.id] = status
        })
      })

      // Set up event listeners
      this.webSocket.addEventListener('thread.created', (event) => this.handleRealtimeEvent(event))
      this.webSocket.addEventListener('thread.updated', (event) => this.handleRealtimeEvent(event))
      this.webSocket.addEventListener('post.created', (event) => this.handleRealtimeEvent(event))
      this.webSocket.addEventListener('post.updated', (event) => this.handleRealtimeEvent(event))
      this.webSocket.addEventListener('alert.created', (event) => this.handleRealtimeEvent(event))
      this.webSocket.addEventListener('event.created', (event) => this.handleRealtimeEvent(event))
    },
    disconnectWebSocket() {
      if (this.webSocket) {
        this.webSocket.disconnect()
        this.webSocket = null
      }
      this.channels.forEach((channel) => {
        this.statuses[channel.id] = 'offline'
      })
    },
    teardown() {
      this.disconnectWebSocket()
    },
    handleRealtimeEvent(event: HubRealtimeEvent) {
      const threadsStore = useThreadsStore()
      const postsStore = usePostsStore()

      // Extract channel ID from event data
      const channelId = event.data?.channel?.id || event.data?.thread?.channel
      if (!channelId) return

      switch (event.type) {
        case 'thread.created':
        case 'thread.updated':
          threadsStore.applyRealtimeUpdate(String(channelId), event)
          break
        case 'post.created':
        case 'post.updated':
          postsStore.applyRealtimeUpdate(event)
          break
        default:
          break
      }

      const channel = this.channels.find((c) => c.id === String(channelId))
      if (channel) {
        channel.unreadCount += 1
        channel.lastActivity = new Date().toISOString()
      }
    },
    markChannelRead(channelId: string) {
      const channel = this.channels.find((c) => c.id === channelId)
      if (channel) {
        channel.unreadCount = 0
      }
    },
  },
})
