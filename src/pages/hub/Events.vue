<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.events.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.events.pageSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          {{ t('hub.actions.refresh') }}
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="showCreateForm = true">
          {{ t('hub.events.createEvent') }}
        </button>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold text-base-content">
            {{ t('hub.events.upcomingEvents') }}
          </h2>
          <span class="badge badge-primary">{{ upcomingEvents.length }}</span>
        </div>

        <div v-if="upcomingEvents.length === 0" class="text-center py-8 text-base-content/60">
          <p>{{ t('hub.events.noUpcoming') }}</p>
        </div>

        <div v-else class="space-y-3">
          <EventCard
            v-for="event in upcomingEvents"
            :key="event.id"
            :event="event"
            :rsvp="getRSVPForEvent(event.id)"
            @rsvp="handleRSVP"
            @update-rsvp="handleUpdateRSVP"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold text-base-content">
            {{ t('hub.events.pastEvents') }}
          </h2>
          <span class="badge badge-outline">{{ pastEvents.length }}</span>
        </div>

        <div v-if="pastEvents.length === 0" class="text-center py-8 text-base-content/60">
          <p>{{ t('hub.events.noPast') }}</p>
        </div>

        <div v-else class="space-y-3">
          <EventCard
            v-for="event in pastEvents"
            :key="event.id"
            :event="event"
            :rsvp="getRSVPForEvent(event.id)"
            @rsvp="handleRSVP"
            @update-rsvp="handleUpdateRSVP"
          />
        </div>
      </div>
    </div>

    <!-- Create Event Modal -->
    <div v-if="showCreateForm" class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">{{ t('hub.events.createEvent') }}</h3>

        <form @submit.prevent="createEvent" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('hub.events.location') }}</span>
            </label>
            <input
              v-model="eventForm.location"
              type="text"
              class="input input-bordered w-full"
              :placeholder="t('hub.events.locationPlaceholder')"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('hub.events.dateTime') }}</span>
            </label>
            <input
              v-model="eventForm.event_date"
              type="datetime-local"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('hub.events.maxAttendees') }}</span>
              <span class="label-text-alt">{{ t('hub.events.optional') }}</span>
            </label>
            <input
              v-model="eventForm.max_attendees"
              type="number"
              class="input input-bordered w-full"
              min="1"
            />
          </div>

          <div class="modal-action">
            <button
              type="button"
              class="btn btn-ghost"
              @click="showCreateForm = false"
              :disabled="creating"
            >
              {{ t('hub.actions.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              <span v-if="creating" class="loading loading-spinner loading-xs" />
              {{ t('hub.events.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EventCard from '@/components/hub/EventCard.vue'
import * as communityHubAPI from '@/services/communityHub'
import type { Event, EventRSVP } from '@/services/communityHub'

const { t } = useI18n()

const events = ref<Event[]>([])
const rsvps = ref<EventRSVP[]>([])
const loading = ref(false)
const creating = ref(false)
const showCreateForm = ref(false)

const eventForm = reactive({
  location: '',
  event_date: '',
  max_attendees: null as number | null,
})

const now = new Date()
const upcomingEvents = computed(() =>
  events.value.filter((event) => new Date(event.event_date) > now),
)
const pastEvents = computed(() => events.value.filter((event) => new Date(event.event_date) <= now))

onMounted(async () => {
  await loadEvents()
  await loadRSVPs()
})

const loadEvents = async () => {
  loading.value = true
  try {
    events.value = await communityHubAPI.getEvents()
  } catch (error) {
    console.error('Failed to load events:', error)
  } finally {
    loading.value = false
  }
}

const loadRSVPs = async () => {
  try {
    // In a real implementation, you'd have an API to get user's RSVPs
    rsvps.value = []
  } catch (error) {
    console.error('Failed to load RSVPs:', error)
  }
}

const refresh = async () => {
  await Promise.all([loadEvents(), loadRSVPs()])
}

const getRSVPForEvent = (eventId: number) => {
  return rsvps.value.find((rsvp) => rsvp.event === eventId) || null
}

const handleRSVP = async (eventId: number, status: 'attending' | 'maybe' | 'not_attending') => {
  try {
    const rsvp = await communityHubAPI.rsvpEvent({ event: eventId, status })
    rsvps.value.push(rsvp)
  } catch (error) {
    console.error('Failed to RSVP:', error)
  }
}

const handleUpdateRSVP = async (
  eventId: number,
  status: 'attending' | 'maybe' | 'not_attending',
) => {
  try {
    const rsvp = await communityHubAPI.rsvpEvent({ event: eventId, status })
    const index = rsvps.value.findIndex((r) => r.event === eventId)
    if (index >= 0) {
      rsvps.value[index] = rsvp
    } else {
      rsvps.value.push(rsvp)
    }
  } catch (error) {
    console.error('Failed to update RSVP:', error)
  }
}

const createEvent = async () => {
  if (!eventForm.location || !eventForm.event_date) return

  creating.value = true
  try {
    const event = await communityHubAPI.createEvent({
      thread: 1, // This should be selected from available threads
      event_date: eventForm.event_date,
      location: eventForm.location,
      max_attendees: eventForm.max_attendees,
    })

    events.value.unshift(event)
    showCreateForm.value = false

    // Reset form
    eventForm.location = ''
    eventForm.event_date = ''
    eventForm.max_attendees = null
  } catch (error) {
    console.error('Failed to create event:', error)
  } finally {
    creating.value = false
  }
}
</script>
