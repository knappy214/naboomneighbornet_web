<template>
  <div v-if="event" class="event-details">
    <!-- Event Header -->
    <div class="event-header mb-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold">{{ event.title }}</h1>
            <div class="badge badge-primary badge-lg">
              {{ t(`events.categories.${event.category}`) }}
            </div>
            <div class="badge badge-ghost badge-lg">
              {{ t(`events.statuses.${event.status}`) }}
            </div>
          </div>

          <div class="flex items-center gap-4 text-base-content/70">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{{ formatEventDate(event.startDate, event.endDate) }}</span>
            </div>

            <div v-if="event.location || event.isVirtual" class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span v-if="event.isVirtual" class="text-primary">{{
                t('events.virtualEvent')
              }}</span>
              <span v-else>{{ event.location }}</span>
            </div>

            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span
                >{{ event.currentAttendees
                }}{{ event.maxAttendees ? ` / ${event.maxAttendees}` : '' }}
                {{ t('events.attendees') }}</span
              >
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-square">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <a @click="editEvent">{{ t('common.edit') }}</a>
              </li>
              <li>
                <a @click="duplicateEvent">{{ t('events.duplicate') }}</a>
              </li>
              <li>
                <a @click="shareEvent">{{ t('common.share') }}</a>
              </li>
              <li v-if="event.status === 'published'">
                <a @click="cancelEvent">{{ t('events.cancel') }}</a>
              </li>
              <li>
                <a @click="deleteEvent" class="text-error">{{ t('common.delete') }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Description -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ t('events.description') }}</h3>
            <div class="prose max-w-none">
              <p class="whitespace-pre-wrap">{{ event.description }}</p>
            </div>
          </div>
        </div>

        <!-- Discussion Thread -->
        <div v-if="event.discussionThreadId" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ t('events.discussion') }}</h3>
            <div class="text-center py-8">
              <svg
                class="w-12 h-12 mx-auto text-base-content/30 mb-4"
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
              <p class="text-base-content/70">{{ t('events.discussionPlaceholder') }}</p>
              <button class="btn btn-primary btn-sm mt-4" @click="openDiscussion">
                {{ t('events.openDiscussion') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div v-if="event.metadata.attachments.length > 0" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ t('events.attachments') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="attachment in event.metadata.attachments"
                :key="attachment.id"
                class="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                @click="downloadAttachment(attachment)"
              >
                <div class="flex-shrink-0">
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
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ attachment.filename }}</p>
                  <p class="text-xs text-base-content/70">{{ formatFileSize(attachment.size) }}</p>
                </div>
                <button class="btn btn-ghost btn-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- RSVP Section -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ t('events.rsvp') }}</h3>

            <div v-if="!userRsvp" class="space-y-2">
              <button class="btn btn-primary w-full" @click="rsvpToEvent('attending')">
                {{ t('events.attending') }}
              </button>
              <button class="btn btn-outline w-full" @click="rsvpToEvent('maybe')">
                {{ t('events.maybe') }}
              </button>
              <button class="btn btn-ghost w-full" @click="rsvpToEvent('not_attending')">
                {{ t('events.notAttending') }}
              </button>
            </div>

            <div v-else class="space-y-2">
              <div class="alert" :class="getRsvpAlertClass(userRsvp.status)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ t(`events.rsvpStatus.${userRsvp.status}`) }}</span>
              </div>

              <button class="btn btn-outline w-full" @click="changeRsvp">
                {{ t('events.changeRsvp') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Event Info -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ t('events.eventInfo') }}</h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/70">{{ t('events.createdBy') }}</span>
                <span class="text-sm font-medium">{{ event.createdBy }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/70">{{ t('events.createdAt') }}</span>
                <span class="text-sm font-medium">{{ formatDate(event.createdAt) }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/70">{{ t('events.visibility') }}</span>
                <span class="text-sm font-medium">{{
                  t(`events.visibilityOptions.${event.visibility}`)
                }}</span>
              </div>

              <div v-if="event.isRecurring" class="flex items-center justify-between">
                <span class="text-sm text-base-content/70">{{ t('events.recurring') }}</span>
                <span class="text-sm font-medium">{{ t('common.yes') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendees -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">
              {{ t('events.attendees') }}
              <span class="badge badge-primary badge-sm">{{ event.currentAttendees }}</span>
            </h3>

            <div v-if="event.attendees.length === 0" class="text-center py-4">
              <p class="text-sm text-base-content/70">{{ t('events.noAttendeesYet') }}</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="attendee in event.attendees.slice(0, 10)"
                :key="attendee.userId"
                class="flex items-center gap-3"
              >
                <div class="avatar">
                  <div
                    class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center"
                  >
                    {{ attendee.displayName.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ attendee.displayName }}</p>
                  <p class="text-xs text-base-content/70">
                    {{ t(`events.rsvpStatus.${attendee.status}`) }}
                  </p>
                </div>
                <div v-if="attendee.isOrganizer" class="badge badge-primary badge-xs">
                  {{ t('events.organizer') }}
                </div>
              </div>

              <div v-if="event.attendees.length > 10" class="text-center">
                <button class="btn btn-ghost btn-sm" @click="viewAllAttendees">
                  {{ t('events.viewAllAttendees') }} ({{ event.attendees.length - 10 }}
                  {{ t('events.more') }})
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="event.tags.length > 0" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ t('events.tags') }}</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in event.tags" :key="tag" class="badge badge-outline">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="alert alert-error">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{{ error }}</span>
    <button class="btn btn-sm btn-ghost" @click="retry">
      {{ t('common.retry') }}
    </button>
  </div>

  <!-- Not Found State -->
  <div v-else class="text-center py-12">
    <svg
      class="w-16 h-16 mx-auto text-base-content/30 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
    <h3 class="text-lg font-semibold mb-2">{{ t('events.eventNotFound') }}</h3>
    <p class="text-base-content/70 mb-4">{{ t('events.eventNotFoundDescription') }}</p>
    <button class="btn btn-primary" @click="$emit('back-to-list')">
      {{ t('events.backToList') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventStore } from '@/stores/hub/events'
import type { Event, EventAttendee, AttendeeStatus } from '@/types/events'

interface Props {
  eventId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'edit-event', eventData: Event): void
  (event: 'back-to-list'): void
}>()

const { t } = useI18n()
const eventStore = useEventStore()

// Reactive data
const userRsvp = ref<EventAttendee | null>(null)

// Computed properties
const { currentEvent: event, loading, error } = eventStore

// Methods
function formatEventDate(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const isSameDay = start.toDateString() === end.toDateString()

  if (isSameDay) {
    return `${start.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return `${start.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} - ${end.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getRsvpAlertClass(status: AttendeeStatus): string {
  switch (status) {
    case 'attending':
      return 'alert-success'
    case 'maybe':
      return 'alert-warning'
    case 'not_attending':
      return 'alert-error'
    default:
      return 'alert-info'
  }
}

async function rsvpToEvent(status: AttendeeStatus) {
  if (!event.value) return

  try {
    await eventStore.rsvpToEvent(event.value.id, status)
    // Update user RSVP status
    userRsvp.value = event.value.attendees.find((a) => a.userId === 'current-user-id') || null
  } catch (error) {
    console.error('Failed to RSVP:', error)
  }
}

function changeRsvp() {
  userRsvp.value = null
}

function editEvent() {
  if (event.value) {
    emit('edit-event', event.value)
  }
}

function duplicateEvent() {
  // Implementation for duplicating event
  console.log('Duplicate event:', event.value)
}

function shareEvent() {
  // Implementation for sharing event
  console.log('Share event:', event.value)
}

function cancelEvent() {
  // Implementation for cancelling event
  console.log('Cancel event:', event.value)
}

function deleteEvent() {
  // Implementation for deleting event
  console.log('Delete event:', event.value)
}

function openDiscussion() {
  // Implementation for opening discussion
  console.log('Open discussion for event:', event.value)
}

function downloadAttachment(attachment: any) {
  // Implementation for downloading attachment
  console.log('Download attachment:', attachment)
}

function viewAllAttendees() {
  // Implementation for viewing all attendees
  console.log('View all attendees for event:', event.value)
}

function retry() {
  eventStore.fetchEvent(props.eventId)
}

// Lifecycle
onMounted(() => {
  eventStore.fetchEvent(props.eventId)
})

// Watch for event changes
watch(event, (newEvent) => {
  if (newEvent) {
    // Find user's RSVP status
    userRsvp.value = newEvent.attendees.find((a) => a.userId === 'current-user-id') || null
  }
})

// Watch for eventId changes
watch(
  () => props.eventId,
  (newEventId) => {
    if (newEventId) {
      eventStore.fetchEvent(newEventId)
    }
  },
)
</script>

<style scoped>
.event-details {
  @apply space-y-6;
}

.event-header {
  @apply border-b border-base-300 pb-6;
}

.card {
  @apply transition-all duration-200;
}

.prose {
  @apply text-base-content/80;
}

.alert {
  @apply transition-all duration-200;
}

.badge {
  @apply transition-all duration-200;
}

.avatar {
  @apply flex-shrink-0;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.dropdown-content {
  @apply z-50;
}
</style>
