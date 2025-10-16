<!--
  ChannelList Component
  Displays a list of communication channels with real-time updates
  Part of User Story 1: Real-Time Discussion Channels
-->

<template>
  <div class="channel-list">
    <!-- Header -->
    <div class="channel-list-header">
      <h2 class="text-lg font-semibold text-base-content">
        {{ t('channels.title') }}
      </h2>
      <button
        v-if="canCreateChannels"
        @click="showCreateChannel = true"
        class="btn btn-primary btn-sm"
        :aria-label="t('channels.create_channel')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ t('channels.create') }}
      </button>
    </div>

    <!-- Channel List -->
    <div class="channel-list-content">
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="channel-item"
        :class="{
          'channel-item-active': channel.id === currentChannelId,
          'channel-item-unread': getUnreadCount(channel.id) > 0,
        }"
        @click="selectChannel(channel.id)"
        :aria-label="`${channel.name} - ${getUnreadCount(channel.id)} unread messages`"
        role="button"
        tabindex="0"
        @keydown.enter="selectChannel(channel.id)"
        @keydown.space.prevent="selectChannel(channel.id)"
      >
        <!-- Channel Icon -->
        <div class="channel-icon">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="getChannelIconClass(channel.type)"
          >
            {{ getChannelIcon(channel.type) }}
          </div>
        </div>

        <!-- Channel Info -->
        <div class="channel-info">
          <div class="channel-name">
            {{ channel.name }}
            <span v-if="getUnreadCount(channel.id) > 0" class="unread-badge">
              {{ getUnreadCount(channel.id) }}
            </span>
          </div>
          <div class="channel-description">
            {{ channel.description || t('channels.no_description') }}
          </div>
          <div class="channel-meta">
            <span class="channel-type">{{ t(`channels.types.${channel.type}`) }}</span>
            <span v-if="channel.members.length > 0" class="channel-members">
              {{ channel.members.length }} {{ t('channels.members') }}
            </span>
          </div>
        </div>

        <!-- Channel Status -->
        <div class="channel-status">
          <div
            v-if="isChannelOnline(channel.id)"
            class="online-indicator"
            :title="t('channels.online')"
          >
            <div class="w-2 h-2 bg-success rounded-full"></div>
          </div>
          <div v-else class="offline-indicator" :title="t('channels.offline')">
            <div class="w-2 h-2 bg-base-300 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="channels.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg
            class="w-12 h-12 text-base-300"
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
        </div>
        <div class="empty-state-text">
          <h3 class="text-lg font-medium text-base-content">
            {{ t('channels.empty.title') }}
          </h3>
          <p class="text-base-content/70">
            {{ t('channels.empty.description') }}
          </p>
        </div>
        <button v-if="canCreateChannels" @click="showCreateChannel = true" class="btn btn-primary">
          {{ t('channels.create_first') }}
        </button>
      </div>
    </div>

    <!-- Create Channel Modal -->
    <div v-if="showCreateChannel" class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">
          {{ t('channels.create_channel') }}
        </h3>

        <form @submit.prevent="createChannel">
          <div class="form-control mb-4">
            <label class="label" for="channel-name">
              <span class="label-text">{{ t('channels.name') }}</span>
            </label>
            <input
              id="channel-name"
              v-model="newChannel.name"
              type="text"
              class="input input-bordered"
              :placeholder="t('channels.name_placeholder')"
              required
              :aria-describedby="channelNameError ? 'channel-name-error' : undefined"
            />
            <div v-if="channelNameError" id="channel-name-error" class="label">
              <span class="label-text-alt text-error">{{ channelNameError }}</span>
            </div>
          </div>

          <div class="form-control mb-4">
            <label class="label" for="channel-description">
              <span class="label-text">{{ t('channels.description') }}</span>
            </label>
            <textarea
              id="channel-description"
              v-model="newChannel.description"
              class="textarea textarea-bordered"
              :placeholder="t('channels.description_placeholder')"
              rows="3"
            ></textarea>
          </div>

          <div class="form-control mb-4">
            <label class="label" for="channel-type">
              <span class="label-text">{{ t('channels.type') }}</span>
            </label>
            <select
              id="channel-type"
              v-model="newChannel.type"
              class="select select-bordered"
              required
            >
              <option value="general">{{ t('channels.types.general') }}</option>
              <option value="safety">{{ t('channels.types.safety') }}</option>
              <option value="events">{{ t('channels.types.events') }}</option>
              <option value="private">{{ t('channels.types.private') }}</option>
            </select>
          </div>

          <div class="form-control mb-6">
            <label class="label cursor-pointer">
              <span class="label-text">{{ t('channels.is_public') }}</span>
              <input v-model="newChannel.isPublic" type="checkbox" class="toggle toggle-primary" />
            </label>
          </div>

          <div class="modal-action">
            <button type="button" @click="cancelCreateChannel" class="btn btn-ghost">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isCreatingChannel">
              <span v-if="isCreatingChannel" class="loading loading-spinner loading-sm"></span>
              {{ t('channels.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCommunicationStore } from '@/stores/hub/communication'
import { useAccessibility } from '@/composables/useAccessibility'
import type { Channel, ChannelType, CreateChannelForm } from '@/types/communication'

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  currentChannelId?: string
  canCreateChannels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canCreateChannels: true,
})

const emit = defineEmits<{
  (event: 'channel-selected', channelId: string): void
  (event: 'channel-created', channel: Channel): void
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

const showCreateChannel = ref(false)
const isCreatingChannel = ref(false)
const channelNameError = ref('')

const newChannel = reactive<CreateChannelForm>({
  name: '',
  description: '',
  type: 'general',
  isPublic: true,
  allowInvites: true,
})

// ============================================================================
// Computed
// ============================================================================

const channels = computed(() => communicationStore.state.channels)
const currentChannelId = computed(() => props.currentChannelId)

// ============================================================================
// Methods
// ============================================================================

/**
 * Select a channel
 */
function selectChannel(channelId: string): void {
  emit('channel-selected', channelId)
  announce(
    t('channels.selected', { channel: channels.value.find((c) => c.id === channelId)?.name }),
  )
}

/**
 * Get unread count for a channel
 */
function getUnreadCount(channelId: string): number {
  const messages = communicationStore.state.messages[channelId] || []
  return messages.filter(
    (msg) =>
      msg.userId !== communicationStore.state.currentUser?.id &&
      !msg.readBy?.includes(communicationStore.state.currentUser?.id || ''),
  ).length
}

/**
 * Get channel icon
 */
function getChannelIcon(type: ChannelType): string {
  const icons = {
    general: '#',
    safety: '🛡️',
    events: '📅',
    private: '🔒',
  }
  return icons[type] || '#'
}

/**
 * Get channel icon class
 */
function getChannelIconClass(type: ChannelType): string {
  const classes = {
    general: 'bg-primary text-primary-content',
    safety: 'bg-warning text-warning-content',
    events: 'bg-info text-info-content',
    private: 'bg-base-300 text-base-content',
  }
  return classes[type] || 'bg-primary text-primary-content'
}

/**
 * Check if channel is online
 */
function isChannelOnline(channelId: string): boolean {
  // This would check if the channel has active members
  // For now, return true for all channels
  return true
}

/**
 * Create a new channel
 */
async function createChannel(): Promise<void> {
  try {
    isCreatingChannel.value = true
    channelNameError.value = ''

    // Validate channel name
    if (!newChannel.name.trim()) {
      channelNameError.value = t('channels.name_required')
      return
    }

    // Check if channel name already exists
    const existingChannel = channels.value.find(
      (c) => c.name.toLowerCase() === newChannel.name.toLowerCase(),
    )
    if (existingChannel) {
      channelNameError.value = t('channels.name_exists')
      return
    }

    // Create channel
    const channel = await communicationStore.createChannel(newChannel)

    // Emit event
    emit('channel-created', channel)

    // Announce success
    announce(t('channels.created', { channel: channel.name }))

    // Close modal
    cancelCreateChannel()
  } catch (error) {
    console.error('Failed to create channel:', error)
    channelNameError.value = t('channels.create_error')
  } finally {
    isCreatingChannel.value = false
  }
}

/**
 * Cancel channel creation
 */
function cancelCreateChannel(): void {
  showCreateChannel.value = false
  channelNameError.value = ''

  // Reset form
  Object.assign(newChannel, {
    name: '',
    description: '',
    type: 'general',
    isPublic: true,
    allowInvites: true,
  })
}

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  // Load channels if not already loaded
  if (channels.value.length === 0) {
    communicationStore.loadChannels()
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.channel-list {
  @apply flex flex-col h-full bg-base-100;
}

.channel-list-header {
  @apply flex items-center justify-between p-4 border-b border-base-300;
}

.channel-list-content {
  @apply flex-1 overflow-y-auto;
}

.channel-item {
  @apply flex items-center p-3 hover:bg-base-200 cursor-pointer transition-colors;
}

.channel-item-active {
  @apply bg-primary/10 border-r-2 border-primary;
}

.channel-item-unread {
  @apply font-semibold;
}

.channel-icon {
  @apply flex-shrink-0 mr-3;
}

.channel-info {
  @apply flex-1 min-w-0;
}

.channel-name {
  @apply text-sm font-medium text-base-content flex items-center gap-2;
}

.unread-badge {
  @apply bg-primary text-primary-content text-xs px-2 py-1 rounded-full;
}

.channel-description {
  @apply text-xs text-base-content/70 truncate;
}

.channel-meta {
  @apply text-xs text-base-content/50 flex gap-2;
}

.channel-status {
  @apply flex-shrink-0 ml-2;
}

.online-indicator,
.offline-indicator {
  @apply flex items-center justify-center;
}

.empty-state {
  @apply flex flex-col items-center justify-center p-8 text-center;
}

.empty-state-icon {
  @apply mb-4;
}

.empty-state-text {
  @apply mb-6;
}

.modal {
  @apply fixed inset-0 z-50;
}

.modal-box {
  @apply bg-base-100 rounded-lg shadow-lg max-w-md w-full mx-4;
}

.form-control {
  @apply mb-4;
}

.label {
  @apply block text-sm font-medium text-base-content mb-1;
}

.input,
.textarea,
.select {
  @apply w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary;
}

.toggle {
  @apply relative inline-flex h-6 w-11 items-center rounded-full;
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

.loading {
  @apply animate-spin;
}

.loading-spinner {
  @apply border-2 border-current border-t-transparent rounded-full;
}

.loading-sm {
  @apply w-4 h-4;
}
</style>
