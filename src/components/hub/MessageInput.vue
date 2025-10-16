<!--
  MessageInput Component
  Provides message input with typing indicators and file upload
  Part of User Story 1: Real-Time Discussion Channels
-->

<template>
  <div class="message-input">
    <form @submit.prevent="sendMessage" class="message-form">
      <!-- File Upload Area -->
      <div v-if="showFileUpload" class="file-upload-area">
        <div class="file-upload-content">
          <div v-for="file in selectedFiles" :key="file.name" class="file-preview">
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button @click="removeFile(file)" class="remove-file-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <!-- Attachment Button -->
        <button
          type="button"
          @click="toggleFileUpload"
          class="attachment-btn"
          :title="t('messages.attach_file')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <!-- Text Input -->
        <div class="text-input-container">
          <textarea
            ref="messageTextarea"
            v-model="messageText"
            class="message-textarea"
            :placeholder="placeholder"
            rows="1"
            @input="handleInput"
            @keydown="handleKeydown"
            @focus="handleFocus"
            @blur="handleBlur"
          ></textarea>
        </div>

        <!-- Send Button -->
        <button type="submit" class="send-btn" :disabled="!canSend" :title="t('messages.send')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.txt"
        @change="handleFileSelect"
        class="hidden"
      />
    </form>

    <!-- Typing Indicator -->
    <div v-if="isTyping" class="typing-indicator">
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <span class="typing-text">{{ t('messages.you_typing') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCommunicationStore } from '@/stores/hub/communication'
import { useAccessibility } from '@/composables/useAccessibility'
import type { SendMessageForm } from '@/types/communication'

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  channelId: string
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  maxLength: 2000,
  disabled: false,
})

const emit = defineEmits<{
  (event: 'message-sent', message: SendMessageForm): void
  (event: 'typing-start'): void
  (event: 'typing-stop'): void
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

const messageTextarea = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()
const messageText = ref('')
const selectedFiles = ref<File[]>([])
const showFileUpload = ref(false)
const isTyping = ref(false)
const typingTimeout = ref<NodeJS.Timeout | null>(null)

// ============================================================================
// Computed
// ============================================================================

const canSend = computed(() => {
  return !props.disabled && (messageText.value.trim().length > 0 || selectedFiles.value.length > 0)
})

const placeholder = computed(() => {
  return props.placeholder || t('messages.type_message')
})

// ============================================================================
// Methods
// ============================================================================

/**
 * Send message
 */
async function sendMessage(): Promise<void> {
  if (!canSend.value) return

  try {
    const message: SendMessageForm = {
      content: messageText.value.trim(),
      type: selectedFiles.value.length > 0 ? 'file' : 'text',
      attachments: selectedFiles.value,
    }

    emit('message-sent', message)

    // Clear input
    messageText.value = ''
    selectedFiles.value = []
    showFileUpload.value = false

    // Reset textarea height
    if (messageTextarea.value) {
      messageTextarea.value.style.height = 'auto'
    }

    // Announce success
    announce(t('messages.sent'))
  } catch (error) {
    console.error('Failed to send message:', error)
    announce(t('messages.send_error'))
  }
}

/**
 * Handle input
 */
function handleInput(): void {
  // Auto-resize textarea
  if (messageTextarea.value) {
    messageTextarea.value.style.height = 'auto'
    messageTextarea.value.style.height = `${messageTextarea.value.scrollHeight}px`
  }

  // Handle typing indicator
  if (messageText.value.trim().length > 0) {
    startTyping()
  } else {
    stopTyping()
  }
}

/**
 * Handle keydown
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

/**
 * Handle focus
 */
function handleFocus(): void {
  // Focus handling if needed
  announce(t('messages.input_focused'))
}

/**
 * Handle blur
 */
function handleBlur(): void {
  stopTyping()
}

/**
 * Start typing indicator
 */
function startTyping(): void {
  if (isTyping.value) return

  isTyping.value = true
  emit('typing-start')

  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // Set timeout to stop typing
  typingTimeout.value = setTimeout(() => {
    stopTyping()
  }, 3000)
}

/**
 * Stop typing indicator
 */
function stopTyping(): void {
  if (!isTyping.value) return

  isTyping.value = false
  emit('typing-stop')

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
    typingTimeout.value = null
  }
}

/**
 * Toggle file upload
 */
function toggleFileUpload(): void {
  if (showFileUpload.value) {
    showFileUpload.value = false
  } else {
    fileInput.value?.click()
  }
}

/**
 * Handle file select
 */
function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...files]
    showFileUpload.value = true
    announce(t('messages.files_selected', { count: files.length }))
  }
}

/**
 * Remove file
 */
function removeFile(file: File): void {
  selectedFiles.value = selectedFiles.value.filter((f) => f !== file)

  if (selectedFiles.value.length === 0) {
    showFileUpload.value = false
  }
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

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // Focus textarea on mount
  nextTick(() => {
    messageTextarea.value?.focus()
  })
})

onUnmounted(() => {
  // Cleanup typing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>

<style scoped>
.message-input {
  @apply bg-base-100 border-t border-base-300 p-4;
}

.message-form {
  @apply space-y-3;
}

.file-upload-area {
  @apply bg-base-200 rounded-lg p-3;
}

.file-upload-content {
  @apply space-y-2;
}

.file-preview {
  @apply flex items-center justify-between bg-base-100 rounded-lg p-2;
}

.file-info {
  @apply flex-1 min-w-0;
}

.file-name {
  @apply text-sm font-medium text-base-content block truncate;
}

.file-size {
  @apply text-xs text-base-content/70;
}

.remove-file-btn {
  @apply p-1 text-base-content/50 hover:text-error hover:bg-base-200 rounded transition-colors;
}

.input-area {
  @apply flex items-end gap-2;
}

.attachment-btn {
  @apply p-2 text-base-content/50 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors;
}

.text-input-container {
  @apply flex-1;
}

.message-textarea {
  @apply w-full resize-none border border-base-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
  min-height: 40px;
  max-height: 120px;
}

.send-btn {
  @apply p-2 text-primary hover:text-primary-content hover:bg-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.typing-indicator {
  @apply flex items-center gap-2 text-sm text-base-content/70 mt-2;
}

.typing-dots {
  @apply flex gap-1;
}

.typing-dot {
  @apply w-2 h-2 bg-base-content/50 rounded-full animate-bounce;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.1s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.2s;
}

.typing-text {
  @apply italic;
}

.hidden {
  @apply hidden;
}
</style>
