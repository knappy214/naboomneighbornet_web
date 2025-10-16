<!--
  MessageList Component
  Displays messages in a channel with real-time updates and virtual scrolling
  Part of User Story 1: Real-Time Discussion Channels
-->

<template>
  <div class="message-list" ref="messageListRef">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="text-base-content/70">{{ t('messages.loading') }}</p>
    </div>

    <!-- Messages Container -->
    <div
      v-else
      class="messages-container"
      :class="{ 'messages-container-scrolling': isScrolling }"
      @scroll="handleScroll"
    >
      <!-- Load More Button -->
      <div v-if="hasMoreMessages" class="load-more-container">
        <button @click="loadMoreMessages" class="btn btn-ghost btn-sm" :disabled="isLoadingMore">
          <span v-if="isLoadingMore" class="loading loading-spinner loading-sm"></span>
          {{ t('messages.load_more') }}
        </button>
      </div>

      <!-- Messages -->
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="message-item"
        :class="{
          'message-item-own': message.userId === currentUserId,
          'message-item-system': message.type === 'system',
          'message-item-deleted': message.deletedAt,
        }"
      >
        <!-- Message Header -->
        <div v-if="shouldShowMessageHeader(message)" class="message-header">
          <div class="message-avatar">
            <img
              v-if="message.avatar"
              :src="message.avatar"
              :alt="message.displayName"
              class="w-8 h-8 rounded-full"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium"
            >
              {{ getInitials(message.displayName) }}
            </div>
          </div>
          <div class="message-info">
            <div class="message-author">
              {{ message.displayName }}
              <span class="message-username">@{{ message.username }}</span>
              <span class="message-timestamp">
                {{ formatMessageTime(message.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Message Content -->
        <div class="message-content">
          <!-- Deleted Message -->
          <div v-if="message.deletedAt" class="message-deleted">
            <svg
              class="w-4 h-4 text-base-content/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span class="text-base-content/50 italic">
              {{ t('messages.deleted') }}
            </span>
          </div>

          <!-- System Message -->
          <div v-else-if="message.type === 'system'" class="message-system">
            <div class="message-system-content">
              {{ message.content }}
            </div>
          </div>

          <!-- Regular Message -->
          <div v-else class="message-regular">
            <!-- Message Text -->
            <div class="message-text" v-html="formatMessageContent(message.content)"></div>

            <!-- Message Attachments -->
            <div v-if="message.metadata.attachments?.length" class="message-attachments">
              <div
                v-for="attachment in message.metadata.attachments"
                :key="attachment.id"
                class="message-attachment"
              >
                <img
                  v-if="attachment.mimeType.startsWith('image/')"
                  :src="attachment.url"
                  :alt="attachment.filename"
                  class="max-w-xs rounded-lg cursor-pointer"
                  @click="openAttachment(attachment)"
                />
                <div v-else class="attachment-file" @click="downloadAttachment(attachment)">
                  <svg
                    class="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div class="attachment-info">
                    <div class="attachment-filename">{{ attachment.filename }}</div>
                    <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Reactions -->
            <div v-if="message.reactions.length" class="message-reactions">
              <button
                v-for="reaction in message.reactions"
                :key="reaction.emoji"
                class="reaction-button"
                :class="{ 'reaction-button-active': hasUserReacted(reaction) }"
                @click="toggleReaction(message.id, reaction.emoji)"
              >
                <span class="reaction-emoji">{{ reaction.emoji }}</span>
                <span class="reaction-count">{{ reaction.count }}</span>
              </button>
            </div>

            <!-- Message Actions -->
            <div class="message-actions">
              <button
                v-if="canReactToMessage(message)"
                @click="showReactionPicker(message.id)"
                class="action-button"
                :title="t('messages.add_reaction')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button
                v-if="canReplyToMessage(message)"
                @click="replyToMessage(message)"
                class="action-button"
                :title="t('messages.reply')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <button
                v-if="canEditMessage(message)"
                @click="editMessage(message)"
                class="action-button"
                :title="t('messages.edit')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                v-if="canDeleteMessage(message)"
                @click="deleteMessage(message.id)"
                class="action-button text-error"
                :title="t('messages.delete')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing Indicators -->
      <div v-if="typingUsers.length" class="typing-indicators">
        <div class="typing-indicator">
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span class="typing-text">
            {{ formatTypingUsers(typingUsers) }} {{ t('messages.typing') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Scroll to Bottom Button -->
    <div v-if="showScrollToBottom" class="scroll-to-bottom">
      <button
        @click="scrollToBottom"
        class="btn btn-primary btn-circle"
        :title="t('messages.scroll_to_bottom')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCommunicationStore } from '@/stores/hub/communication'
import { useAccessibility } from '@/composables/useAccessibility'
import type { Message, TypingIndicator } from '@/types/communication'

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  channelId: string
  messages: Message[]
  isLoading?: boolean
  hasMoreMessages?: boolean
  typingUsers?: TypingIndicator[]
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasMoreMessages: false,
  typingUsers: () => [],
})

const emit = defineEmits<{
  (event: 'load-more'): void
  (event: 'message-reaction', messageId: string, emoji: string): void
  (event: 'message-reply', message: Message): void
  (event: 'message-edit', message: Message): void
  (event: 'message-delete', messageId: string): void
  (event: 'attachment-open', attachment: any): void
  (event: 'attachment-download', attachment: any): void
}>()

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n()
const communicationStore = useCommunicationStore()
const { announce } = useAccessibility()

// ============================================================================
// State
// ============================================================================

const messageListRef = ref<HTMLElement>()
const isScrolling = ref(false)
const isLoadingMore = ref(false)
const showScrollToBottom = ref(false)
const lastMessageId = ref<string | null>(null)

// ============================================================================
// Computed
// ============================================================================

const currentUserId = computed(() => communicationStore.state.currentUser?.id)
const visibleMessages = computed(() => props.messages)

// ============================================================================
// Methods
// ============================================================================

/**
 * Handle scroll events
 */
function handleScroll(event: Event): void {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // Check if scrolled to bottom
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
  showScrollToBottom.value = !isAtBottom

  // Check if scrolled to top (for loading more messages)
  if (scrollTop === 0 && props.hasMoreMessages && !isLoadingMore.value) {
    loadMoreMessages()
  }
}

/**
 * Load more messages
 */
async function loadMoreMessages(): Promise<void> {
  if (isLoadingMore.value) return

  try {
    isLoadingMore.value = true
    emit('load-more')
  } finally {
    isLoadingMore.value = false
  }
}

/**
 * Scroll to bottom
 */
function scrollToBottom(): void {
  const container = messageListRef.value?.querySelector('.messages-container')
  if (container) {
    container.scrollTop = container.scrollHeight
    showScrollToBottom.value = false
  }
}

/**
 * Check if message header should be shown
 */
function shouldShowMessageHeader(message: Message, index: number): boolean {
  if (index === 0) return true

  const previousMessage = props.messages[index - 1]
  if (!previousMessage) return true

  // Show header if different user or more than 5 minutes apart
  const timeDiff = message.createdAt.getTime() - previousMessage.createdAt.getTime()
  return message.userId !== previousMessage.userId || timeDiff > 5 * 60 * 1000
}

/**
 * Get user initials
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format message time
 */
function formatMessageTime(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return t('messages.just_now')
  } else if (diffInMinutes < 60) {
    return t('messages.minutes_ago', { count: diffInMinutes })
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return t('messages.hours_ago', { count: hours })
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Format message content
 */
function formatMessageContent(content: string): string {
  // Basic formatting for mentions, links, etc.
  let formatted = content
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="link">$1</a>')
    .replace(/\n/g, '<br>')

  return formatted
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if user has reacted to a message
 */
function hasUserReacted(reaction: any): boolean {
  return reaction.users?.includes(currentUserId.value) || false
}

/**
 * Toggle reaction
 */
function toggleReaction(messageId: string, emoji: string): void {
  emit('message-reaction', messageId, emoji)
}

/**
 * Show reaction picker
 */
function showReactionPicker(messageId: string): void {
  // This would show a reaction picker modal
  console.log('Show reaction picker for message:', messageId)
}

/**
 * Reply to message
 */
function replyToMessage(message: Message): void {
  emit('message-reply', message)
}

/**
 * Edit message
 */
function editMessage(message: Message): void {
  emit('message-edit', message)
}

/**
 * Delete message
 */
function deleteMessage(messageId: string): void {
  if (confirm(t('messages.delete_confirm'))) {
    emit('message-delete', messageId)
  }
}

/**
 * Open attachment
 */
function openAttachment(attachment: any): void {
  emit('attachment-open', attachment)
}

/**
 * Download attachment
 */
function downloadAttachment(attachment: any): void {
  emit('attachment-download', attachment)
}

/**
 * Check if user can react to message
 */
function canReactToMessage(message: Message): boolean {
  return message.type !== 'system' && !message.deletedAt
}

/**
 * Check if user can reply to message
 */
function canReplyToMessage(message: Message): boolean {
  return message.type !== 'system' && !message.deletedAt
}

/**
 * Check if user can edit message
 */
function canEditMessage(message: Message): boolean {
  return (
    message.userId === currentUserId.value &&
    message.type !== 'system' &&
    !message.deletedAt &&
    !message.metadata.isEdited
  )
}

/**
 * Check if user can delete message
 */
function canDeleteMessage(message: Message): boolean {
  return message.userId === currentUserId.value && message.type !== 'system' && !message.deletedAt
}

/**
 * Format typing users
 */
function formatTypingUsers(users: TypingIndicator[]): string {
  if (users.length === 0) return ''
  if (users.length === 1) return users[0].username
  if (users.length === 2) return `${users[0].username} and ${users[1].username}`
  return `${users[0].username} and ${users.length - 1} others`
}

// ============================================================================
// Watchers
// ============================================================================

// Watch for new messages and scroll to bottom
watch(
  () => props.messages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  },
)

// Watch for typing users changes
watch(
  () => props.typingUsers.length,
  (newLength) => {
    if (newLength > 0) {
      announce(t('messages.someone_typing'))
    }
  },
)

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // Scroll to bottom on mount
  nextTick(() => {
    scrollToBottom()
  })
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.message-list {
  @apply flex flex-col h-full bg-base-100 relative;
}

.loading-state {
  @apply flex flex-col items-center justify-center h-full text-center;
}

.messages-container {
  @apply flex-1 overflow-y-auto p-4 space-y-2;
}

.messages-container-scrolling {
  @apply scroll-smooth;
}

.load-more-container {
  @apply flex justify-center py-4;
}

.message-item {
  @apply flex flex-col;
}

.message-item-own {
  @apply items-end;
}

.message-item-system {
  @apply items-center;
}

.message-item-deleted {
  @apply opacity-50;
}

.message-header {
  @apply flex items-start gap-3 mb-1;
}

.message-avatar {
  @apply flex-shrink-0;
}

.message-info {
  @apply flex-1 min-w-0;
}

.message-author {
  @apply text-sm font-medium text-base-content flex items-center gap-2;
}

.message-username {
  @apply text-xs text-base-content/70;
}

.message-timestamp {
  @apply text-xs text-base-content/50;
}

.message-content {
  @apply ml-11;
}

.message-item-own .message-content {
  @apply ml-0 mr-11;
}

.message-deleted {
  @apply flex items-center gap-2 text-sm;
}

.message-system {
  @apply text-center;
}

.message-system-content {
  @apply text-sm text-base-content/70 bg-base-200 rounded-lg px-3 py-2 inline-block;
}

.message-regular {
  @apply space-y-2;
}

.message-text {
  @apply text-sm text-base-content break-words;
}

.message-text :deep(.mention) {
  @apply bg-primary/20 text-primary px-1 rounded;
}

.message-text :deep(.link) {
  @apply text-primary hover:underline;
}

.message-attachments {
  @apply space-y-2;
}

.message-attachment {
  @apply max-w-xs;
}

.attachment-file {
  @apply flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors;
}

.attachment-info {
  @apply flex-1 min-w-0;
}

.attachment-filename {
  @apply text-sm font-medium text-base-content truncate;
}

.attachment-size {
  @apply text-xs text-base-content/70;
}

.message-reactions {
  @apply flex flex-wrap gap-1;
}

.reaction-button {
  @apply flex items-center gap-1 px-2 py-1 bg-base-200 rounded-full text-xs hover:bg-base-300 transition-colors;
}

.reaction-button-active {
  @apply bg-primary/20 text-primary;
}

.reaction-emoji {
  @apply text-sm;
}

.reaction-count {
  @apply text-xs font-medium;
}

.message-actions {
  @apply flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.message-item:hover .message-actions {
  @apply opacity-100;
}

.action-button {
  @apply p-1 text-base-content/50 hover:text-base-content hover:bg-base-200 rounded transition-colors;
}

.scroll-to-bottom {
  @apply absolute bottom-4 right-4 z-10;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary text-primary-content hover:bg-primary/90;
}

.btn-ghost {
  @apply bg-transparent text-base-content hover:bg-base-200;
}

.btn-sm {
  @apply px-2 py-1 text-sm;
}

.btn-circle {
  @apply rounded-full w-12 h-12 flex items-center justify-center;
}

.loading {
  @apply animate-spin;
}

.loading-spinner {
  @apply border-2 border-current border-t-transparent rounded-full;
}

.loading-sm {
  @apply w-4 h-4;
}

.loading-lg {
  @apply w-8 h-8;
}

.typing-indicators {
  @apply p-4;
}

.typing-indicator {
  @apply flex items-center gap-2 text-sm text-base-content/70;
}

.typing-dots {
  @apply flex gap-1;
}

.typing-dot {
  @apply w-2 h-2 bg-base-content/50 rounded-full animate-bounce;
}

.typing-dot:nth-child(2) {
  @apply animation-delay-100;
}

.typing-dot:nth-child(3) {
  @apply animation-delay-200;
}

.typing-text {
  @apply italic;
}
</style>
