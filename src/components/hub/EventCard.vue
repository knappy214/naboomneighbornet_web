<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-base-content truncate">
            {{ event.location }}
          </h3>
          <p class="text-sm text-base-content/70 mt-1">
            {{ formatEventDate(event.event_date) }}
          </p>
          <div v-if="event.max_attendees" class="mt-2">
            <span class="text-xs text-base-content/60">
              {{ t('hub.events.maxAttendeesCount', { count: event.max_attendees }) }}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="badge" :class="statusBadge">
            {{ statusLabel }}
          </div>
          <button
            v-if="!isRSVPed"
            class="btn btn-primary btn-sm"
            @click="rsvpEvent"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.events.rsvp') }}
          </button>
          <button v-else class="btn btn-outline btn-sm" @click="updateRSVP" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.events.updateRsvp') }}
          </button>
        </div>
      </div>

      <div v-if="rsvpStatus" class="mt-3 pt-3 border-t border-base-200">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-base-content/60">{{ t('hub.events.yourStatus') }}:</span>
          <span class="font-medium" :class="rsvpStatusClass">
            {{ rsvpStatusLabel }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Event, EventRSVP } from '@/services/communityHub'

interface Props {
  event: Event
  rsvp?: EventRSVP | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  rsvp: [eventId: number, status: 'attending' | 'maybe' | 'not_attending']
  updateRsvp: [eventId: number, status: 'attending' | 'maybe' | 'not_attending']
}>()

const { t } = useI18n()
const loading = ref(false)

const isRSVPed = computed(() => !!props.rsvp)
const rsvpStatus = computed(() => props.rsvp?.status)
const rsvpStatusLabel = computed(() => {
  if (!rsvpStatus.value) return ''
  return t(`hub.events.status.${rsvpStatus.value}`)
})

const rsvpStatusClass = computed(() => {
  switch (rsvpStatus.value) {
    case 'attending':
      return 'text-success'
    case 'maybe':
      return 'text-warning'
    case 'not_attending':
      return 'text-error'
    default:
      return 'text-base-content/60'
  }
})

const statusBadge = computed(() => {
  const now = new Date()
  const eventDate = new Date(props.event.event_date)

  if (eventDate < now) {
    return 'badge-error'
  }

  const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (hoursUntil < 24) {
    return 'badge-warning'
  }

  return 'badge-success'
})

const statusLabel = computed(() => {
  const now = new Date()
  const eventDate = new Date(props.event.event_date)

  if (eventDate < now) {
    return t('hub.events.past')
  }

  const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (hoursUntil < 1) {
    return t('hub.events.soon')
  }
  if (hoursUntil < 24) {
    return t('hub.events.today')
  }

  return t('hub.events.upcoming')
})

const formatEventDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const rsvpEvent = async () => {
  loading.value = true
  try {
    emit('rsvp', props.event.id, 'attending')
  } finally {
    loading.value = false
  }
}

const updateRSVP = async () => {
  loading.value = true
  try {
    // Cycle through statuses: attending -> maybe -> not_attending -> attending
    const statuses: Array<'attending' | 'maybe' | 'not_attending'> = [
      'attending',
      'maybe',
      'not_attending',
    ]
    const currentIndex = statuses.indexOf(rsvpStatus.value || 'attending')
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    emit('updateRsvp', props.event.id, nextStatus)
  } finally {
    loading.value = false
  }
}
</script>
