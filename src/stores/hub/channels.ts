import { defineStore } from 'pinia'
import { fetchChannels } from '@/services/hub'
import { ChannelWebSocket } from '@/lib/ws'
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
    sockets: new Map<string, ChannelWebSocket>(),
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
        this.channels = await fetchChannels()
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
      this.ensureSocket(channelId)
      const threadsStore = useThreadsStore()
      threadsStore.loadThreads(channelId)
    },
    ensureSocket(channelId: string) {
      const authStore = useAuthStore()
      const token = authStore.accessToken
      if (!token) return

      if (!this.sockets.has(channelId)) {
        const manager = new ChannelWebSocket({
          channelId,
          token,
          onEvent: (event) => this.handleRealtimeEvent(channelId, event),
          onStatusChange: (status) => {
            this.statuses[channelId] = status
          },
        })
        this.sockets.set(channelId, manager)
        manager.connect()
      }
    },
    disconnectChannel(channelId: string) {
      const socket = this.sockets.get(channelId)
      socket?.disconnect()
      this.sockets.delete(channelId)
      this.statuses[channelId] = 'offline'
    },
    teardown() {
      this.sockets.forEach((socket) => socket.disconnect())
      this.sockets.clear()
    },
    handleRealtimeEvent(channelId: string, event: HubRealtimeEvent) {
      const threadsStore = useThreadsStore()
      const postsStore = usePostsStore()

      switch (event.type) {
        case 'thread.created':
        case 'thread.updated':
          threadsStore.applyRealtimeUpdate(channelId, event)
          break
        case 'post.created':
        case 'post.updated':
          postsStore.applyRealtimeUpdate(event)
          break
        default:
          break
      }

      const channel = this.channels.find((c) => c.id === channelId)
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
