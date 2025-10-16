<!--
  CommunicationHub Component
  Main component for real-time communication channels
  Part of User Story 1: Real-Time Discussion Channels
-->

<template>
  <div class="communication-hub">
    <!-- Header -->
    <div class="hub-header">
      <div class="header-left">
        <h1 class="text-2xl font-bold text-base-content">
          {{ t('hub.title') }}
        </h1>
        <div v-if="currentChannel" class="channel-info">
          <span class="channel-name">{{ currentChannel.name }}</span>
          <span class="channel-members"
            >{{ currentChannel.members.length }} {{ t('hub.members') }}</span
          >
        </div>
      </div>
      <div class="header-right">
        <button
          @click="toggleSidebar"
          class="btn btn-ghost btn-sm"
          :title="t('hub.toggle_sidebar')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="hub-content">
      <!-- Sidebar -->
      <div class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <ChannelList
          :current-channel-id="currentChannelId"
          :can-create-channels="canCreateChannels"
          @channel-selected="selectChannel"
          @channel-created="handleChannelCreated"
        />
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <!-- No Channel Selected -->
        <div v-if="!currentChannel" class="no-channel">
          <div class="no-channel-content">
            <svg
              class="w-16 h-16 text-base-content/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h2 class="text-xl font-semibold text-base-content">
              {{ t('hub.no_channel_selected') }}
            </h2>
            <p class="text-base-content/70">
              {{ t('hub.select_channel_description') }}
            </p>
          </div>
        </div>

        <!-- Channel Content -->
        <div v-else class="channel-content">
          <!-- Messages -->
          <div class="messages-container">
            <MessageList
              :channel-id="currentChannelId"
              :messages="currentMessages"
              :is-loading="isLoadingMessages"
              :has-more-messages="hasMoreMessages"
              :typing-users="typingUsers"
              @load-more="loadMoreMessages"
              @message-reaction="handleMessageReaction"
              @message-reply="handleMessageReply"
              @message-edit="handleMessageEdit"
              @message-delete="handleMessageDelete"
              @attachment-open="handleAttachmentOpen"
              @attachment-download="handleAttachmentDownload"
            />
          </div>

          <!-- Message Input -->
          <div class="input-container">
            <MessageInput
              :channel-id="currentChannelId"
              :placeholder="t('hub.type_message_placeholder')"
              :disabled="!isConnected"
              @message-sent="handleMessageSent"
              @typing-start="handleTypingStart"
              @typing-stop="handleTypingStop"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="!isConnected" class="connection-status">
      <div class="connection-indicator">
        <div class="w-2 h-2 bg-error rounded-full animate-pulse"></div>
        <span class="text-sm text-base-content/70">
          {{ t('hub.connecting') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCommunicationStore } from '@/stores/hub/communication'
import { useAccessibility } from '@/composables/useAccessibility'
import ChannelList from './ChannelList.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import type { Channel, Message, SendMessageForm, TypingIndicator } from '@/types/communication'

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n()
const communicationStore = useCommunicationStore()
const { announce } = useAccessibility()

// ============================================================================
// State
// ============================================================================

const currentChannelId = ref<string | null>(null)
const sidebarCollapsed = ref(false)
const isLoadingMessages = ref(false)
const hasMoreMessages = ref(false)
const typingUsers = ref<TypingIndicator[]>([])

// ============================================================================
// Computed
// ============================================================================

const currentChannel = computed(() => {
  if (!currentChannelId.value) return null
  return communicationStore.state.channels.find((c) => c.id === currentChannelId.value)
})

const currentMessages = computed(() => {
  if (!currentChannelId.value) return []
  return communicationStore.state.messages[currentChannelId.value] || []
})

const isConnected = computed(() => communicationStore.isConnected.value)
const canCreateChannels = computed(
  () => communicationStore.state.currentUser?.permissions.canCreateChannels || false,
)

// ============================================================================
// Methods
// ============================================================================

/**
 * Select a channel
 */
async function selectChannel(channelId: string): Promise<void> {
  try {
    currentChannelId.value = channelId
    await communicationStore.switchToChannel(channelId)
    announce(t('hub.channel_selected', { channel: currentChannel.value?.name }))
  } catch (error) {
    console.error('Failed to select channel:', error)
    announce(t('hub.channel_select_error'))
  }
}

/**
 * Handle channel created
 */
function handleChannelCreated(channel: Channel): void {
  // Channel is already added to store by the ChannelList component
  announce(t('hub.channel_created', { channel: channel.name }))
}

/**
 * Load more messages
 */
async function loadMoreMessages(): Promise<void> {
  if (!currentChannelId.value || isLoadingMessages.value) return

  try {
    isLoadingMessages.value = true
    // This would implement pagination
    // For now, we'll just log it
    console.log('Loading more messages for channel:', currentChannelId.value)
  } finally {
    isLoadingMessages.value = false
  }
}

/**
 * Handle message sent
 */
async function handleMessageSent(message: SendMessageForm): Promise<void> {
  if (!currentChannelId.value) return

  try {
    await communicationStore.sendMessage(message)
    announce(t('hub.message_sent'))
  } catch (error) {
    console.error('Failed to send message:', error)
    announce(t('hub.message_send_error'))
  }
}

/**
 * Handle typing start
 */
function handleTypingStart(): void {
  if (!currentChannelId.value) return
  communicationStore.sendTyping(true)
}

/**
 * Handle typing stop
 */
function handleTypingStop(): void {
  if (!currentChannelId.value) return
  communicationStore.sendTyping(false)
}

/**
 * Handle message reaction
 */
async function handleMessageReaction(messageId: string, emoji: string): Promise<void> {
  if (!currentChannelId.value) return

  try {
    await communicationStore.addReaction(currentChannelId.value, messageId, emoji)
  } catch (error) {
    console.error('Failed to add reaction:', error)
  }
}

/**
 * Handle message reply
 */
function handleMessageReply(message: Message): void {
  // This would open a reply interface
  console.log('Reply to message:', message.id)
}

/**
 * Handle message edit
 */
function handleMessageEdit(message: Message): void {
  // This would open an edit interface
  console.log('Edit message:', message.id)
}

/**
 * Handle message delete
 */
async function handleMessageDelete(messageId: string): Promise<void> {
  if (!currentChannelId.value) return

  try {
    // This would implement message deletion
    console.log('Delete message:', messageId)
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

/**
 * Handle attachment open
 */
function handleAttachmentOpen(attachment: any): void {
  // This would open the attachment
  console.log('Open attachment:', attachment.id)
}

/**
 * Handle attachment download
 */
function handleAttachmentDownload(attachment: any): void {
  // This would download the attachment
  console.log('Download attachment:', attachment.id)
}

/**
 * Toggle sidebar
 */
function toggleSidebar(): void {
  sidebarCollapsed.value = !sidebarCollapsed.value
  announce(sidebarCollapsed.value ? t('hub.sidebar_collapsed') : t('hub.sidebar_expanded'))
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(async () => {
  try {
    // Initialize communication store
    await communicationStore.initialize()

    // Load initial data
    await communicationStore.loadChannels()

    // Select first channel if available
    if (communicationStore.state.channels.length > 0) {
      await selectChannel(communicationStore.state.channels[0].id)
    }
  } catch (error) {
    console.error('Failed to initialize communication hub:', error)
    announce(t('hub.initialization_error'))
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.communication-hub {
  @apply flex flex-col h-screen bg-base-100;
}

.hub-header {
  @apply flex items-center justify-between p-4 border-b border-base-300 bg-base-100;
}

.header-left {
  @apply flex items-center gap-4;
}

.channel-info {
  @apply flex items-center gap-2 text-sm text-base-content/70;
}

.channel-name {
  @apply font-medium text-base-content;
}

.header-right {
  @apply flex items-center gap-2;
}

.hub-content {
  @apply flex flex-1 overflow-hidden;
}

.sidebar {
  @apply w-80 border-r border-base-300 bg-base-100 transition-all duration-300;
}

.sidebar-collapsed {
  @apply w-0 overflow-hidden;
}

.chat-area {
  @apply flex flex-col flex-1;
}

.no-channel {
  @apply flex items-center justify-center h-full;
}

.no-channel-content {
  @apply text-center space-y-4;
}

.channel-content {
  @apply flex flex-col h-full;
}

.messages-container {
  @apply flex-1 overflow-hidden;
}

.input-container {
  @apply border-t border-base-300;
}

.connection-status {
  @apply fixed bottom-4 right-4 z-50;
}

.connection-indicator {
  @apply flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2 shadow-lg;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-ghost {
  @apply bg-transparent text-base-content hover:bg-base-200;
}

.btn-sm {
  @apply px-2 py-1 text-sm;
}
</style>
