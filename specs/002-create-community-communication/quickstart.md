# Quickstart Guide: Community Communication Hub

**Feature**: Community Communication Hub  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This quickstart guide provides developers with the essential information needed to implement the Community Communication Hub feature for the Naboom Platform. The guide covers setup, key concepts, and implementation patterns.

## Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- Vue 3 with Composition API
- TypeScript 5.0+
- Tailwind CSS 4 + DaisyUI 5
- Pinia for state management
- Vue I18n for internationalization

## Quick Setup

### 1. Install Dependencies

```bash
npm install @vue/composition-api vue-i18n pinia
npm install -D @types/node typescript
```

### 2. Environment Configuration

Create `.env.local`:

```env
VITE_API_BASE_URL=https://api.naboom.co.za/v1
VITE_WS_URL=wss://api.naboom.co.za/v1/ws
VITE_APP_NAME=Naboom Community
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,af
```

### 3. Basic Project Structure

```
src/
├── components/hub/
│   ├── ChannelList.vue
│   ├── MessageList.vue
│   ├── MessageInput.vue
│   └── CommunicationHub.vue
├── composables/
│   ├── useWebSocket.ts
│   ├── useOfflineQueue.ts
│   └── useTypingIndicator.ts
├── services/
│   └── communication.ts
├── stores/hub/
│   └── communication.ts
├── types/
│   └── communication.ts
└── locales/
    ├── en.json
    └── af.json
```

## Core Concepts

### Real-Time Communication

The communication hub uses WebSocket connections for real-time features:

```typescript
// WebSocket connection management
const { connect, disconnect, sendMessage } = useWebSocket();

// Connect to communication hub
await connect('wss://api.naboom.co.za/v1/ws/communication');

// Send a message
await sendMessage({
  channelId: 'channel-uuid',
  content: 'Hello community!',
  type: 'text'
});
```

### Channel Management

Channels are organized discussion spaces:

```typescript
// Channel types
type ChannelType = 'general' | 'safety' | 'events';

// Channel interface
interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  members: string[];
  moderators: string[];
  settings: ChannelSettings;
}
```

### Message Handling

Messages support various types and features:

```typescript
// Message types
type MessageType = 'text' | 'image' | 'file' | 'event' | 'system';

// Message interface
interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
}
```

### Offline Support

Messages are queued locally when offline:

```typescript
// Offline message queuing
const { queueMessage, syncPendingMessages } = useOfflineQueue();

// Queue message when offline
await queueMessage({
  channelId: 'channel-uuid',
  content: 'This will be sent when online',
  type: 'text'
});

// Sync when connection restored
await syncPendingMessages();
```

## Implementation Patterns

### Vue 3 Composition API

Use `<script setup>` with TypeScript:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommunicationStore } from '@/stores/hub/communication';

interface Props {
  channelId: string;
}

const props = withDefaults(defineProps<Props>(), {
  channelId: ''
});

const emit = defineEmits<{
  (event: 'message-sent', message: Message): void;
  (event: 'typing-started'): void;
  (event: 'typing-stopped'): void;
}>();

const { t } = useI18n();
const communicationStore = useCommunicationStore();

const messages = computed(() => 
  communicationStore.getMessagesByChannel(props.channelId)
);

const sendMessage = async (content: string) => {
  try {
    const message = await communicationStore.sendMessage({
      channelId: props.channelId,
      content,
      type: 'text'
    });
    emit('message-sent', message);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
</script>
```

### DaisyUI Component Integration

Use DaisyUI components for consistent styling:

```vue
<template>
  <div class="chat chat-start">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img :src="message.sender.avatar" :alt="message.sender.displayName" />
      </div>
    </div>
    <div class="chat-header">
      {{ message.sender.displayName }}
      <time class="text-xs opacity-50">{{ formatTime(message.timestamp) }}</time>
    </div>
    <div class="chat-bubble">{{ message.content }}</div>
    <div class="chat-footer opacity-50">
      {{ message.status }}
    </div>
  </div>
</template>
```

### State Management with Pinia

Organize state by feature domain:

```typescript
// stores/hub/communication.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Channel, Message, UserProfile } from '@/types/communication';

export const useCommunicationStore = defineStore('communication', () => {
  // State
  const channels = ref<Channel[]>([]);
  const messages = ref<Message[]>([]);
  const currentChannel = ref<Channel | null>(null);
  const users = ref<UserProfile[]>([]);
  const isConnected = ref(false);

  // Getters
  const getMessagesByChannel = computed(() => 
    (channelId: string) => messages.value.filter(m => m.channelId === channelId)
  );

  const getChannelById = computed(() => 
    (id: string) => channels.value.find(c => c.id === id)
  );

  // Actions
  const fetchChannels = async () => {
    try {
      const response = await communicationService.getChannels();
      channels.value = response.data.channels;
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const sendMessage = async (messageData: SendMessageRequest) => {
    try {
      const message = await communicationService.sendMessage(messageData);
      messages.value.push(message);
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return {
    channels,
    messages,
    currentChannel,
    users,
    isConnected,
    getMessagesByChannel,
    getChannelById,
    fetchChannels,
    sendMessage
  };
});
```

### Multilingual Support

Implement Vue I18n for English and Afrikaans:

```typescript
// locales/en.json
{
  "communication": {
    "channels": {
      "general": "General Discussion",
      "safety": "Safety Alerts",
      "events": "Community Events"
    },
    "messages": {
      "send": "Send Message",
      "typing": "is typing...",
      "online": "Online",
      "offline": "Offline"
    },
    "events": {
      "create": "Create Event",
      "rsvp": "RSVP",
      "attending": "Attending",
      "declined": "Declined"
    }
  }
}

// locales/af.json
{
  "communication": {
    "channels": {
      "general": "Algemene Bespreking",
      "safety": "Veiligheidswaarskuwings",
      "events": "Gemeenskapsgebeurtenisse"
    },
    "messages": {
      "send": "Stuur Boodskap",
      "typing": "tik...",
      "online": "Aanlyn",
      "offline": "Aflyn"
    },
    "events": {
      "create": "Skep Gebeurtenis",
      "rsvp": "RSVP",
      "attending": "Woon By",
      "declined": "Afgewys"
    }
  }
}
```

### WebSocket Integration

Handle real-time communication:

```typescript
// composables/useWebSocket.ts
import { ref, onUnmounted } from 'vue';
import type { Message, TypingIndicator, PresenceStatus } from '@/types/communication';

export function useWebSocket() {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;

  const connect = async (url: string) => {
    try {
      ws.value = new WebSocket(url);
      
      ws.value.onopen = () => {
        isConnected.value = true;
        reconnectAttempts.value = 0;
        console.log('WebSocket connected');
      };

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        attemptReconnect(url);
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const sendMessage = (message: Message) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify({
        type: 'message',
        data: message
      }));
    }
  };

  const sendTypingIndicator = (channelId: string, isTyping: boolean) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify({
        type: 'typing',
        data: { channelId, isTyping }
      }));
    }
  };

  const attemptReconnect = (url: string) => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++;
      setTimeout(() => connect(url), 1000 * reconnectAttempts.value);
    }
  };

  const disconnect = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator
  };
}
```

## API Integration

### Service Layer

Create service classes for API communication:

```typescript
// services/communication.ts
import { apiClient } from '@/lib/api';
import type { 
  Channel, 
  Message, 
  CreateChannelRequest, 
  SendMessageRequest 
} from '@/types/communication';

export class CommunicationService {
  async getChannels(): Promise<{ channels: Channel[] }> {
    const response = await apiClient.get('/channels');
    return response.data;
  }

  async createChannel(data: CreateChannelRequest): Promise<Channel> {
    const response = await apiClient.post('/channels', data);
    return response.data;
  }

  async getMessages(channelId: string, limit = 50): Promise<{ messages: Message[] }> {
    const response = await apiClient.get(`/channels/${channelId}/messages`, {
      params: { limit }
    });
    return response.data;
  }

  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post(`/channels/${data.channelId}/messages`, data);
    return response.data;
  }
}

export const communicationService = new CommunicationService();
```

### Error Handling

Implement comprehensive error handling:

```typescript
// utils/errorHandler.ts
export class CommunicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'CommunicationError';
  }
}

export const handleCommunicationError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    throw new CommunicationError(
      data.message || 'An error occurred',
      data.code || 'UNKNOWN_ERROR',
      status
    );
  } else if (error.request) {
    throw new CommunicationError(
      'Network error - please check your connection',
      'NETWORK_ERROR',
      0
    );
  } else {
    throw new CommunicationError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      0
    );
  }
};
```

## Testing Patterns

### Component Testing

Test Vue components with Vue Test Utils:

```typescript
// __tests__/MessageList.spec.ts
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import MessageList from '@/components/hub/MessageList.vue';
import { useCommunicationStore } from '@/stores/hub/communication';

describe('MessageList', () => {
  let wrapper: any;
  let store: any;

  beforeEach(() => {
    const pinia = createPinia();
    store = useCommunicationStore(pinia);
    
    wrapper = mount(MessageList, {
      props: { channelId: 'test-channel' },
      global: {
        plugins: [pinia]
      }
    });
  });

  it('displays messages for the channel', async () => {
    const mockMessages = [
      { id: '1', content: 'Hello', channelId: 'test-channel' },
      { id: '2', content: 'World', channelId: 'test-channel' }
    ];
    
    store.messages = mockMessages;
    await wrapper.vm.$nextTick();
    
    expect(wrapper.findAll('.message')).toHaveLength(2);
  });
});
```

### Store Testing

Test Pinia stores:

```typescript
// __tests__/communication-store.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { useCommunicationStore } from '@/stores/hub/communication';

describe('Communication Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('fetches channels successfully', async () => {
    const store = useCommunicationStore();
    
    // Mock API response
    vi.spyOn(communicationService, 'getChannels').mockResolvedValue({
      channels: [{ id: '1', name: 'General' }]
    });
    
    await store.fetchChannels();
    
    expect(store.channels).toHaveLength(1);
    expect(store.channels[0].name).toBe('General');
  });
});
```

## Performance Optimization

### Message Virtualization

Implement virtual scrolling for large message lists:

```typescript
// composables/useVirtualScrolling.ts
import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useVirtualScrolling(items: Ref<any[]>, itemHeight = 50) {
  const containerRef = ref<HTMLElement>();
  const scrollTop = ref(0);
  const containerHeight = ref(0);

  const visibleItems = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight.value / itemHeight) + 1,
      items.value.length
    );
    
    return items.value.slice(start, end).map((item, index) => ({
      ...item,
      index: start + index
    }));
  });

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight;
      containerRef.value.addEventListener('scroll', handleScroll);
    }
  });

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll);
    }
  });

  return {
    containerRef,
    visibleItems
  };
}
```

### Lazy Loading

Implement lazy loading for components:

```typescript
// router/index.ts
import { defineAsyncComponent } from 'vue';

const CommunicationHub = defineAsyncComponent(() => 
  import('@/components/hub/CommunicationHub.vue')
);

const EventHub = defineAsyncComponent(() => 
  import('@/components/hub/EventHub.vue')
);

export const routes = [
  {
    path: '/hub',
    component: CommunicationHub
  },
  {
    path: '/events',
    component: EventHub
  }
];
```

## Deployment Considerations

### Environment Variables

Configure for different environments:

```env
# Production
VITE_API_BASE_URL=https://api.naboom.co.za/v1
VITE_WS_URL=wss://api.naboom.co.za/v1/ws

# Staging
VITE_API_BASE_URL=https://staging-api.naboom.co.za/v1
VITE_WS_URL=wss://staging-api.naboom.co.za/v1/ws

# Development
VITE_API_BASE_URL=http://localhost:8000/v1
VITE_WS_URL=ws://localhost:8000/v1/ws
```

### Build Optimization

Optimize for production:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia', 'vue-i18n'],
          'communication': [
            './src/components/hub',
            './src/stores/hub',
            './src/services/communication.ts'
          ]
        }
      }
    }
  }
});
```

## Next Steps

1. **Review the API contracts** in `/contracts/communication-api.yaml`
2. **Study the data model** in `/data-model.md`
3. **Implement core components** following the patterns above
4. **Add comprehensive tests** for all functionality
5. **Integrate with existing Naboom Platform** architecture

## Support

For questions or issues:

- Review the full specification in `spec.md`
- Check the implementation tasks in `tasks.md`
- Consult the Naboom Community Platform Constitution
- Contact the development team

---

**Note**: This quickstart provides the essential patterns and examples. Refer to the full specification and data model for complete implementation details.
