<template>
  <v-card class="elevation-2" height="500">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
      {{ $t('communication.title') }}
      <v-spacer />
      <v-btn color="primary" variant="outlined" size="small" @click="handleNewMessage">
        <v-icon start>mdi-plus</v-icon>
        {{ $t('communication.newMessage') }}
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="messages">
          <v-icon start>mdi-message</v-icon>
          {{ $t('communication.tabs.messages') }}
        </v-tab>
        <v-tab value="neighbors">
          <v-icon start>mdi-account-group</v-icon>
          {{ $t('communication.tabs.neighbors') }}
        </v-tab>
        <v-tab value="broadcasts">
          <v-icon start>mdi-broadcast</v-icon>
          {{ $t('communication.tabs.broadcasts') }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Messages Tab -->
        <v-window-item value="messages">
          <v-list class="pa-0" max-height="350">
            <v-list-item
              v-for="message in messages"
              :key="message.id"
              :prepend-avatar="message.sender.avatar"
              :title="message.sender.name"
              :subtitle="message.preview"
              @click="handleMessageClick(message)"
              class="cursor-pointer"
            >
              <template #append>
                <div class="d-flex flex-column align-end">
                  <v-chip
                    :color="getMessageStatusColor(message.status)"
                    size="x-small"
                    class="mb-1"
                  >
                    {{ $t(`communication.messageStatus.${message.status}`) }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatTime(message.timestamp) }}
                  </span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>

        <!-- Neighbors Tab -->
        <v-window-item value="neighbors">
          <v-list class="pa-0" max-height="350">
            <v-list-item
              v-for="neighbor in neighbors"
              :key="neighbor.id"
              :prepend-avatar="neighbor.avatar"
              :title="neighbor.name"
              :subtitle="neighbor.farmName"
            >
              <template #append>
                <div class="d-flex align-center">
                  <v-chip :color="neighbor.isOnline ? 'success' : 'grey'" size="small" class="mr-2">
                    <v-icon start size="12">
                      {{ neighbor.isOnline ? 'mdi-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                    {{
                      neighbor.isOnline
                        ? $t('communication.status.online')
                        : $t('communication.status.offline')
                    }}
                  </v-chip>
                  <v-btn
                    icon="mdi-message"
                    size="small"
                    variant="text"
                    @click="handleMessageNeighbor(neighbor)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>

        <!-- Broadcasts Tab -->
        <v-window-item value="broadcasts">
          <v-list class="pa-0" max-height="350">
            <v-list-item
              v-for="broadcast in broadcasts"
              :key="broadcast.id"
              :prepend-icon="broadcast.icon"
              :title="broadcast.title"
              :subtitle="broadcast.content"
            >
              <template #append>
                <div class="d-flex flex-column align-end">
                  <v-chip
                    :color="
                      broadcast.priority === 'high'
                        ? 'error'
                        : broadcast.priority === 'medium'
                          ? 'warning'
                          : 'info'
                    "
                    size="x-small"
                    class="mb-1"
                  >
                    {{ $t(`communication.priority.${broadcast.priority}`) }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatTime(broadcast.timestamp) }}
                  </span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>
      </v-window>
    </v-card-text>

    <!-- Message Composer -->
    <v-card-actions v-if="showComposer">
      <v-textarea
        v-model="newMessage"
        :placeholder="$t('communication.composer.placeholder')"
        variant="outlined"
        density="compact"
        rows="2"
        class="flex-grow-1"
        hide-details
      />
      <v-btn
        color="primary"
        variant="elevated"
        :disabled="!newMessage.trim()"
        @click="handleSendMessage"
        class="ml-2"
      >
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </v-card-actions>

    <!-- Message Detail Dialog -->
    <v-dialog v-model="showMessageDialog" max-width="600">
      <v-card v-if="selectedMessage">
        <v-card-title class="d-flex align-center">
          <v-avatar class="mr-3" size="40">
            <v-img :src="selectedMessage.sender.avatar" />
          </v-avatar>
          <div>
            <h3 class="text-h6">{{ selectedMessage.sender.name }}</h3>
            <p class="text-caption mb-0">{{ selectedMessage.sender.farmName }}</p>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showMessageDialog = false" />
        </v-card-title>
        <v-card-text>
          <p class="text-body-1">{{ selectedMessage.content }}</p>
          <v-divider class="my-4" />
          <div class="text-caption text-medium-emphasis">
            {{ $t('communication.sentAt') }}: {{ formatDateTime(selectedMessage.timestamp) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="outlined" @click="handleReply">
            <v-icon start>mdi-reply</v-icon>
            {{ $t('communication.reply') }}
          </v-btn>
          <v-spacer />
          <v-btn color="error" variant="text" @click="handleDeleteMessage">
            <v-icon start>mdi-delete</v-icon>
            {{ $t('communication.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// TypeScript interfaces
interface Message {
  id: string
  sender: {
    id: string
    name: string
    farmName: string
    avatar: string
  }
  content: string
  preview: string
  timestamp: Date
  status: 'unread' | 'read' | 'sent' | 'delivered'
  type: 'direct' | 'group' | 'broadcast'
}

interface Neighbor {
  id: string
  name: string
  farmName: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
  distance?: number
}

interface Broadcast {
  id: string
  title: string
  content: string
  icon: string
  priority: 'low' | 'medium' | 'high'
  timestamp: Date
  author: string
}

interface Props {
  farmId?: string
  showComposer?: boolean
  maxHeight?: number
}

interface Emits {
  (e: 'new-message'): void
  (e: 'message-click', message: Message): void
  (e: 'message-neighbor', neighbor: Neighbor): void
  (e: 'send-message', content: string): void
  (e: 'reply', message: Message): void
  (e: 'delete-message', messageId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  farmId: '',
  showComposer: true,
  maxHeight: 350,
})

const emit = defineEmits<Emits>()

// Composables
const { t, locale } = useI18n()

// Reactive data
const activeTab = ref('messages')
const newMessage = ref('')
const showMessageDialog = ref(false)
const selectedMessage = ref<Message | null>(null)

// Mock data - in real app, this would come from props or API
const messages = computed<Message[]>(() => [
  {
    id: '1',
    sender: {
      id: '1',
      name: 'Jan van der Merwe',
      farmName: 'Sunnyside Farm',
      avatar: '/avatars/jan.jpg',
    },
    content: 'The weather looks good for planting tomorrow. Anyone interested in coordinating?',
    preview: 'The weather looks good for planting tomorrow...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'unread',
    type: 'direct',
  },
  {
    id: '2',
    sender: {
      id: '2',
      name: 'Maria Botha',
      farmName: 'Green Valley',
      avatar: '/avatars/maria.jpg',
    },
    content: 'Equipment sharing this weekend - who needs the tractor?',
    preview: 'Equipment sharing this weekend...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'read',
    type: 'group',
  },
  {
    id: '3',
    sender: {
      id: '3',
      name: 'Piet Joubert',
      farmName: 'Mountain View',
      avatar: '/avatars/piet.jpg',
    },
    content: 'Security alert: Suspicious activity near the eastern fence',
    preview: 'Security alert: Suspicious activity...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'delivered',
    type: 'broadcast',
  },
])

const neighbors = computed<Neighbor[]>(() => [
  {
    id: '1',
    name: 'Jan van der Merwe',
    farmName: 'Sunnyside Farm',
    avatar: '/avatars/jan.jpg',
    isOnline: true,
    distance: 2.5,
  },
  {
    id: '2',
    name: 'Maria Botha',
    farmName: 'Green Valley',
    avatar: '/avatars/maria.jpg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    distance: 1.8,
  },
  {
    id: '3',
    name: 'Piet Joubert',
    farmName: 'Mountain View',
    avatar: '/avatars/piet.jpg',
    isOnline: true,
    distance: 3.2,
  },
])

const broadcasts = computed<Broadcast[]>(() => [
  {
    id: '1',
    title: 'Weather Warning',
    content: 'Heavy rain expected this evening. Secure equipment and livestock.',
    icon: 'mdi-weather-rainy',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    author: 'Weather Service',
  },
  {
    id: '2',
    title: 'Community Meeting',
    content: 'Monthly community meeting scheduled for next Friday at 7 PM.',
    icon: 'mdi-calendar',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    author: 'Community Coordinator',
  },
  {
    id: '3',
    title: 'Equipment Maintenance',
    content: 'Annual equipment maintenance program starting next week.',
    icon: 'mdi-tools',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    author: 'Maintenance Team',
  },
])

// Methods
const getMessageStatusColor = (status: string) => {
  switch (status) {
    case 'unread':
      return 'primary'
    case 'read':
      return 'success'
    case 'sent':
      return 'info'
    case 'delivered':
      return 'success'
    default:
      return 'grey'
  }
}

const formatTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return t('communication.timeAgo.minutes', { count: minutes })
  } else if (hours < 24) {
    return t('communication.timeAgo.hours', { count: hours })
  } else {
    return t('communication.timeAgo.days', { count: days })
  }
}

const formatDateTime = (timestamp: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

const handleNewMessage = () => {
  emit('new-message')
}

const handleMessageClick = (message: Message) => {
  selectedMessage.value = message
  showMessageDialog.value = true
  emit('message-click', message)
}

const handleMessageNeighbor = (neighbor: Neighbor) => {
  emit('message-neighbor', neighbor)
}

const handleSendMessage = () => {
  if (newMessage.value.trim()) {
    emit('send-message', newMessage.value)
    newMessage.value = ''
  }
}

const handleReply = () => {
  if (selectedMessage.value) {
    emit('reply', selectedMessage.value)
  }
  showMessageDialog.value = false
}

const handleDeleteMessage = () => {
  if (selectedMessage.value) {
    emit('delete-message', selectedMessage.value.id)
  }
  showMessageDialog.value = false
}
</script>

<i18n>
{
  "en": {
    "communication": {
      "title": "Neighbor Communication",
      "newMessage": "New Message",
      "tabs": {
        "messages": "Messages",
        "neighbors": "Neighbors",
        "broadcasts": "Broadcasts"
      },
      "messageStatus": {
        "unread": "Unread",
        "read": "Read",
        "sent": "Sent",
        "delivered": "Delivered"
      },
      "status": {
        "online": "Online",
        "offline": "Offline"
      },
      "priority": {
        "low": "Low",
        "medium": "Medium",
        "high": "High"
      },
      "composer": {
        "placeholder": "Type your message here..."
      },
      "sentAt": "Sent at",
      "reply": "Reply",
      "delete": "Delete",
      "timeAgo": {
        "minutes": "{count} min ago",
        "hours": "{count} hr ago",
        "days": "{count} days ago"
      }
    }
  },
  "af": {
    "communication": {
      "title": "Buur Kommunikasie",
      "newMessage": "Nuwe Boodskap",
      "tabs": {
        "messages": "Boodskappe",
        "neighbors": "Bure",
        "broadcasts": "Uitsendings"
      },
      "messageStatus": {
        "unread": "Ongelees",
        "read": "Gelees",
        "sent": "Gestuur",
        "delivered": "Afgelewer"
      },
      "status": {
        "online": "Aanlyn",
        "offline": "Aflyn"
      },
      "priority": {
        "low": "Laag",
        "medium": "Medium",
        "high": "Hoog"
      },
      "composer": {
        "placeholder": "Tik jou boodskap hier..."
      },
      "sentAt": "Gestuur om",
      "reply": "Antwoord",
      "delete": "Skrap",
      "timeAgo": {
        "minutes": "{count} min gelede",
        "hours": "{count} uur gelede",
        "days": "{count} dae gelede"
      }
    }
  }
}
</i18n>
