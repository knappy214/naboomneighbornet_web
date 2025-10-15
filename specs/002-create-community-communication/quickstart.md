# Quickstart: Community Communication Hub

**Feature**: Community Communication Hub  
**Date**: 2025-01-27  
**Purpose**: Implementation guide and patterns for developers

## Overview

This quickstart guide provides practical implementation patterns for the Community Communication Hub feature. It covers Vue 3 Composition API with TypeScript, Pinia state management, Vue I18n internationalization, DaisyUI components, and real-time WebSocket communication.

## Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- Vue 3 with TypeScript
- Vite 7+ with @tailwindcss/vite plugin
- Pinia for state management
- Vue I18n for internationalization
- DaisyUI 5 with Tailwind CSS 4

## Project Setup

### 1. Install Dependencies

```bash
npm install vue@^3.4.0 pinia@^2.1.0 vue-i18n@^9.0.0
npm install -D @tailwindcss/vite tailwindcss@^4.0.0 daisyui@^5.0.0
npm install -D vitest @vue/test-utils jsdom
```

### 2. Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

### 3. Tailwind CSS Configuration

```css
/* src/app.css */
@import 'tailwindcss';
@plugin "daisyui";
```

### 4. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Core Implementation Patterns

### 1. Pinia Store Setup

```typescript
// src/stores/hub/communication.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, Channel, UserProfile, Event } from '@/types/communication'

export const useCommunicationStore = defineStore(
  'communication',
  () => {
    // State
    const channels = ref<Channel[]>([])
    const currentChannel = ref<Channel | null>(null)
    const messages = ref<Record<string, Message[]>>({})
    const users = ref<Record<string, UserProfile>>({})
    const events = ref<Event[]>([])
    const isConnected = ref(false)
    const isOffline = ref(false)

    // Getters
    const getChannelMessages = computed(() => (channelId: string) => {
      return messages.value[channelId] || []
    })

    const getOnlineUsers = computed(() => {
      return Object.values(users.value).filter((user) => user.status === 'online')
    })

    const getUnreadCount = computed(() => (channelId: string) => {
      const channelMessages = messages.value[channelId] || []
      return channelMessages.filter((msg) => !msg.metadata.isRead).length
    })

    // Actions
    const addMessage = (message: Message) => {
      if (!messages.value[message.channelId]) {
        messages.value[message.channelId] = []
      }
      messages.value[message.channelId].push(message)
    }

    const setCurrentChannel = (channel: Channel) => {
      currentChannel.value = channel
    }

    const markAsRead = (channelId: string) => {
      const channelMessages = messages.value[channelId] || []
      channelMessages.forEach((msg) => {
        msg.metadata.isRead = true
      })
    }

    return {
      // State
      channels,
      currentChannel,
      messages,
      users,
      events,
      isConnected,
      isOffline,
      // Getters
      getChannelMessages,
      getOnlineUsers,
      getUnreadCount,
      // Actions
      addMessage,
      setCurrentChannel,
      markAsRead,
    }
  },
  {
    persist: true,
  },
)
```

### 2. Vue I18n Setup

```typescript
// src/plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import af from '@/locales/af.json'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, af },
})

export default i18n
```

```json
// src/locales/en.json
{
  "communication": {
    "channels": {
      "title": "Channels",
      "general": "General",
      "safety": "Safety",
      "events": "Events",
      "announcements": "Announcements"
    },
    "messages": {
      "placeholder": "Type a message...",
      "send": "Send",
      "typing": "{user} is typing...",
      "online": "Online",
      "offline": "Offline"
    },
    "events": {
      "title": "Events",
      "create": "Create Event",
      "attend": "Attend",
      "maybe": "Maybe",
      "notAttending": "Not Attending"
    }
  }
}
```

```json
// src/locales/af.json
{
  "communication": {
    "channels": {
      "title": "Kanale",
      "general": "Algemeen",
      "safety": "Veiligheid",
      "events": "Gebeurtenisse",
      "announcements": "Aankondigings"
    },
    "messages": {
      "placeholder": "Tik 'n boodskap...",
      "send": "Stuur",
      "typing": "{user} tik...",
      "online": "Aanlyn",
      "offline": "Aflyn"
    },
    "events": {
      "title": "Gebeurtenisse",
      "create": "Skep Gebeurtenis",
      "attend": "Woon By",
      "maybe": "Miskien",
      "notAttending": "Woon Nie By Nie"
    }
  }
}
```

### 3. WebSocket Composable

```typescript
// src/composables/useWebSocket.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useCommunicationStore } from '@/stores/hub/communication'

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  const store = useCommunicationStore()

  const connect = () => {
    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        isConnected.value = true
        store.isConnected = true
        reconnectAttempts.value = 0
        console.log('WebSocket connected')
      }

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleMessage(data)
      }

      ws.value.onclose = () => {
        isConnected.value = false
        store.isConnected = false
        handleReconnect()
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        handleReconnect()
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      handleReconnect()
    }
  }

  const handleReconnect = () => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      setTimeout(() => {
        reconnectAttempts.value++
        connect()
      }, reconnectDelay * reconnectAttempts.value)
    }
  }

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'message_received':
        store.addMessage(data.payload.message)
        break
      case 'typing_indicator':
        // Handle typing indicator
        break
      case 'presence_update':
        // Handle presence update
        break
      case 'channel_update':
        // Handle channel update
        break
      case 'event_update':
        // Handle event update
        break
    }
  }

  const sendMessage = (message: any) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify(message))
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
  }
}
```

### 4. Channel List Component

```vue
<!-- src/components/hub/ChannelList.vue -->
<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-header">
      <h2 class="card-title">{{ $t('communication.channels.title') }}</h2>
    </div>
    <div class="card-body p-0">
      <ul class="menu">
        <li v-for="channel in channels" :key="channel.id">
          <a
            :class="{ active: currentChannel?.id === channel.id }"
            @click="selectChannel(channel)"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <div class="badge badge-primary badge-sm">{{ channel.type }}</div>
              <span>{{ channel.name }}</span>
            </div>
            <div v-if="getUnreadCount(channel.id) > 0" class="badge badge-error badge-sm">
              {{ getUnreadCount(channel.id) }}
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCommunicationStore } from '@/stores/hub/communication'
import type { Channel } from '@/types/communication'

const store = useCommunicationStore()

const channels = computed(() => store.channels)
const currentChannel = computed(() => store.currentChannel)
const getUnreadCount = computed(() => store.getUnreadCount)

const selectChannel = (channel: Channel) => {
  store.setCurrentChannel(channel)
  store.markAsRead(channel.id)
}
</script>
```

### 5. Message List Component

```vue
<!-- src/components/hub/MessageList.vue -->
<template>
  <div class="card bg-base-100 shadow-xl flex-1">
    <div class="card-header">
      <h2 class="card-title">{{ currentChannel?.name }}</h2>
      <div class="badge badge-success">{{ $t('communication.messages.online') }}</div>
    </div>
    <div class="card-body p-0">
      <div class="chat chat-start max-h-96 overflow-y-auto">
        <div
          v-for="message in messages"
          :key="message.id"
          class="chat-bubble"
          :class="{ 'chat-bubble-primary': message.userId === currentUserId }"
        >
          <div class="chat-header">
            <span class="chat-title">{{ getUserName(message.userId) }}</span>
            <time class="text-xs opacity-50">{{ formatTime(message.timestamp) }}</time>
          </div>
          <div class="chat-content">{{ message.content }}</div>
          <div v-if="message.reactions.length > 0" class="chat-footer">
            <div class="flex gap-1">
              <span
                v-for="reaction in message.reactions"
                :key="reaction.emoji"
                class="badge badge-sm"
              >
                {{ reaction.emoji }} {{ reaction.count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCommunicationStore } from '@/stores/hub/communication'
import { useAuthStore } from '@/stores/auth'

const store = useCommunicationStore()
const authStore = useAuthStore()

const currentChannel = computed(() => store.currentChannel)
const currentUserId = computed(() => authStore.user?.id)

const messages = computed(() => {
  if (!currentChannel.value) return []
  return store.getChannelMessages(currentChannel.value.id)
})

const getUserName = (userId: string) => {
  const user = store.users[userId]
  return user ? user.displayName : 'Unknown User'
}

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>
```

### 6. Message Input Component

```vue
<!-- src/components/hub/MessageInput.vue -->
<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="messageContent"
          type="text"
          :placeholder="$t('communication.messages.placeholder')"
          class="input input-bordered flex-1"
          :disabled="!isConnected"
        />
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!messageContent.trim() || !isConnected"
        >
          {{ $t('communication.messages.send') }}
        </button>
      </form>
      <div v-if="!isConnected" class="alert alert-warning mt-2">
        <span>{{ $t('communication.messages.offline') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCommunicationStore } from '@/stores/hub/communication'
import { useWebSocket } from '@/composables/useWebSocket'

const store = useCommunicationStore()
const { isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws')

const messageContent = ref('')

const sendMessage = () => {
  if (!messageContent.value.trim() || !store.currentChannel) return

  const message = {
    type: 'message_received',
    payload: {
      message: {
        id: crypto.randomUUID(),
        channelId: store.currentChannel.id,
        userId: 'current-user-id', // Get from auth store
        content: messageContent.value,
        type: 'text',
        timestamp: new Date(),
        reactions: [],
        attachments: [],
        metadata: {
          isEdited: false,
          isDeleted: false,
          isPinned: false,
          isSystemMessage: false,
        },
      },
    },
  }

  sendMessage(message)
  messageContent.value = ''
}
</script>
```

### 7. Event List Component

```vue
<!-- src/components/hub/EventList.vue -->
<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-header">
      <h2 class="card-title">{{ $t('communication.events.title') }}</h2>
      <button class="btn btn-primary btn-sm">
        {{ $t('communication.events.create') }}
      </button>
    </div>
    <div class="card-body p-0">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>{{ $t('communication.events.title') }}</th>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.id">
              <td>
                <div class="font-bold">{{ event.title }}</div>
                <div class="text-sm opacity-50">{{ event.description }}</div>
              </td>
              <td>{{ formatDate(event.startDate) }}</td>
              <td>
                <div class="badge badge-outline">{{ event.type }}</div>
              </td>
              <td>
                <div class="badge" :class="getStatusClass(event.status)">
                  {{ event.status }}
                </div>
              </td>
              <td>
                <div class="flex gap-1">
                  <button class="btn btn-xs btn-primary">
                    {{ $t('communication.events.attend') }}
                  </button>
                  <button class="btn btn-xs btn-outline">
                    {{ $t('communication.events.maybe') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCommunicationStore } from '@/stores/hub/communication'
import type { Event } from '@/types/communication'

const store = useCommunicationStore()

const events = computed(() => store.events)

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'published':
      return 'badge-success'
    case 'draft':
      return 'badge-warning'
    case 'cancelled':
      return 'badge-error'
    case 'completed':
      return 'badge-info'
    default:
      return 'badge-neutral'
  }
}
</script>
```

### 8. Main Communication Hub Component

```vue
<!-- src/components/hub/CommunicationHub.vue -->
<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow-lg">
      <div class="navbar-start">
        <h1 class="text-xl font-bold">Naboom Community</h1>
      </div>
      <div class="navbar-end">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </div>

    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <!-- Channel List -->
        <div class="lg:col-span-1">
          <ChannelList />
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2">
          <MessageList />
          <MessageInput />
        </div>

        <!-- Events Sidebar -->
        <div class="lg:col-span-1">
          <EventList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChannelList from './ChannelList.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import EventList from './EventList.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
</script>
```

## Testing Patterns

### 1. Component Testing

```typescript
// src/__tests__/components/hub/ChannelList.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChannelList from '@/components/hub/ChannelList.vue'
import { useCommunicationStore } from '@/stores/hub/communication'

describe('ChannelList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders channels correctly', () => {
    const store = useCommunicationStore()
    store.channels = [
      {
        id: '1',
        name: 'General',
        type: 'general',
        isPrivate: false,
        members: [],
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    ]

    const wrapper = mount(ChannelList)
    expect(wrapper.text()).toContain('General')
  })

  it('selects channel when clicked', async () => {
    const store = useCommunicationStore()
    const mockChannel = {
      id: '1',
      name: 'General',
      type: 'general',
      isPrivate: false,
      members: [],
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
    }

    store.channels = [mockChannel]
    const setCurrentChannelSpy = vi.spyOn(store, 'setCurrentChannel')

    const wrapper = mount(ChannelList)
    await wrapper.find('a').trigger('click')

    expect(setCurrentChannelSpy).toHaveBeenCalledWith(mockChannel)
  })
})
```

### 2. Store Testing

```typescript
// src/__tests__/stores/communication.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCommunicationStore } from '@/stores/hub/communication'

describe('Communication Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds message to correct channel', () => {
    const store = useCommunicationStore()
    const message = {
      id: '1',
      channelId: 'channel1',
      userId: 'user1',
      content: 'Hello world',
      type: 'text' as const,
      timestamp: new Date(),
      reactions: [],
      attachments: [],
      metadata: {
        isEdited: false,
        isDeleted: false,
        isPinned: false,
        isSystemMessage: false,
      },
    }

    store.addMessage(message)
    expect(store.messages['channel1']).toContain(message)
  })

  it('calculates unread count correctly', () => {
    const store = useCommunicationStore()
    store.messages = {
      channel1: [
        {
          id: '1',
          channelId: 'channel1',
          userId: 'user1',
          content: 'Hello',
          type: 'text' as const,
          timestamp: new Date(),
          reactions: [],
          attachments: [],
          metadata: {
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystemMessage: false,
            isRead: false,
          },
        },
      ],
    }

    expect(store.getUnreadCount('channel1')).toBe(1)
  })
})
```

## Performance Optimization

### 1. Virtual Scrolling for Messages

```typescript
// src/composables/useVirtualScrolling.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useVirtualScrolling(items: Ref<any[]>, itemHeight: number) {
  const containerRef = ref<HTMLElement>()
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const visibleItems = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.min(start + Math.ceil(containerHeight.value / itemHeight), items.value.length)
    return items.value.slice(start, end)
  })

  const totalHeight = computed(() => items.value.length * itemHeight)
  const offsetY = computed(() => scrollTop.value - (scrollTop.value % itemHeight))

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  const updateContainerHeight = () => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
    }
  }

  onMounted(() => {
    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerHeight)
  })

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  }
}
```

### 2. Message Pagination

```typescript
// src/composables/useMessagePagination.ts
import { ref, computed } from 'vue'

export function useMessagePagination(messages: Ref<Message[]>, pageSize = 50) {
  const currentPage = ref(1)
  const isLoading = ref(false)

  const paginatedMessages = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return messages.value.slice(start, end)
  })

  const hasMore = computed(() => {
    return currentPage.value * pageSize < messages.value.length
  })

  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    currentPage.value++
    isLoading.value = false
  }

  return {
    paginatedMessages,
    hasMore,
    isLoading,
    loadMore,
  }
}
```

## Error Handling

### 1. Global Error Handler

```typescript
// src/composables/useErrorHandler.ts
import { ref } from 'vue'

export function useErrorHandler() {
  const error = ref<string | null>(null)
  const isRetrying = ref(false)

  const handleError = (err: any, retryFn?: () => Promise<void>) => {
    console.error('Error:', err)
    error.value = err.message || 'An error occurred'

    if (retryFn) {
      isRetrying.value = true
      retryFn().finally(() => {
        isRetrying.value = false
      })
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    error,
    isRetrying,
    handleError,
    clearError,
  }
}
```

### 2. Offline Support

```typescript
// src/composables/useOfflineQueue.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useOfflineQueue() {
  const isOnline = ref(navigator.onLine)
  const queuedMessages = ref<Message[]>([])

  const addToQueue = (message: Message) => {
    queuedMessages.value.push(message)
    localStorage.setItem('offlineMessages', JSON.stringify(queuedMessages.value))
  }

  const syncQueue = async () => {
    if (!isOnline.value || queuedMessages.value.length === 0) return

    for (const message of queuedMessages.value) {
      try {
        // Send message to server
        await sendMessage(message)
      } catch (error) {
        console.error('Failed to sync message:', error)
        break
      }
    }

    queuedMessages.value = []
    localStorage.removeItem('offlineMessages')
  }

  const handleOnline = () => {
    isOnline.value = true
    syncQueue()
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load queued messages from localStorage
    const stored = localStorage.getItem('offlineMessages')
    if (stored) {
      queuedMessages.value = JSON.parse(stored)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    queuedMessages,
    addToQueue,
    syncQueue,
  }
}
```

This quickstart guide provides a comprehensive foundation for implementing the Community Communication Hub feature with Vue 3, TypeScript, and modern web technologies.
