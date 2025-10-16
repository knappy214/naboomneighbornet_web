import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventService } from '@/services/eventService'
import type {
  Event,
  EventAttendee,
  EventFilter,
  EventSearchQuery,
  EventStats,
  EventNotification,
  AttendeeStatus,
  EventStatus,
  EventVisibility,
  EventCategory,
} from '@/types/events'

export const useEventStore = defineStore(
  'events',
  () => {
    // State
    const events = ref<Event[]>([])
    const currentEvent = ref<Event | null>(null)
    const eventAttendees = ref<EventAttendee[]>([])
    const eventNotifications = ref<EventNotification[]>([])
    const eventStats = ref<EventStats | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const filters = ref<EventFilter>({})
    const searchQuery = ref<EventSearchQuery>({
      limit: 20,
      offset: 0,
    })

    // Getters
    const upcomingEvents = computed(() =>
      events.value
        .filter((event) => event.status === 'published' && new Date(event.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    )

    const pastEvents = computed(() =>
      events.value
        .filter((event) => event.status === 'published' && new Date(event.endDate) < new Date())
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    )

    const eventsByCategory = computed(() => {
      const grouped: Record<EventCategory, Event[]> = {} as Record<EventCategory, Event[]>
      events.value.forEach((event) => {
        if (!grouped[event.category]) {
          grouped[event.category] = []
        }
        grouped[event.category].push(event)
      })
      return grouped
    })

    const myEvents = computed(() => {
      // This would need to be filtered by current user ID
      return events.value.filter((event) => event.createdBy === 'current-user-id')
    })

    const eventsByStatus = computed(() => {
      const grouped: Record<EventStatus, Event[]> = {} as Record<EventStatus, Event[]>
      events.value.forEach((event) => {
        if (!grouped[event.status]) {
          grouped[event.status] = []
        }
        grouped[event.status].push(event)
      })
      return grouped
    })

    const totalEvents = computed(() => events.value.length)
    const totalAttendees = computed(() =>
      events.value.reduce((sum, event) => sum + event.currentAttendees, 0),
    )

    // Actions
    async function fetchEvents(query?: EventSearchQuery) {
      loading.value = true
      error.value = null

      try {
        const searchQuery = query || {
          limit: 20,
          offset: 0,
          filters: filters.value,
        }

        const result = await eventService.searchEvents(searchQuery)
        events.value = result.events
        searchQuery.value = searchQuery
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch events'
        console.error('Error fetching events:', err)
      } finally {
        loading.value = false
      }
    }

    async function fetchEvent(eventId: string) {
      loading.value = true
      error.value = null

      try {
        const event = await eventService.getEvent(eventId)
        currentEvent.value = event

        // Update the event in the events array if it exists
        const index = events.value.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          events.value[index] = event
        } else {
          events.value.push(event)
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch event'
        console.error('Error fetching event:', err)
      } finally {
        loading.value = false
      }
    }

    async function createEvent(
      eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees' | 'attendees'>,
    ) {
      loading.value = true
      error.value = null

      try {
        const newEvent = await eventService.createEvent(eventData)
        events.value.unshift(newEvent)
        return newEvent
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to create event'
        console.error('Error creating event:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function updateEvent(eventId: string, updates: Partial<Event>) {
      loading.value = true
      error.value = null

      try {
        const updatedEvent = await eventService.updateEvent(eventId, updates)

        // Update the event in the events array
        const index = events.value.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          events.value[index] = updatedEvent
        }

        // Update current event if it's the same
        if (currentEvent.value?.id === eventId) {
          currentEvent.value = updatedEvent
        }

        return updatedEvent
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to update event'
        console.error('Error updating event:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function deleteEvent(eventId: string) {
      loading.value = true
      error.value = null

      try {
        await eventService.deleteEvent(eventId)

        // Remove the event from the events array
        const index = events.value.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          events.value.splice(index, 1)
        }

        // Clear current event if it's the same
        if (currentEvent.value?.id === eventId) {
          currentEvent.value = null
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to delete event'
        console.error('Error deleting event:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function rsvpToEvent(eventId: string, status: AttendeeStatus, notes?: string) {
      loading.value = true
      error.value = null

      try {
        const attendee = await eventService.rsvpToEvent(eventId, status, notes)

        // Update event attendees
        const eventIndex = events.value.findIndex((e) => e.id === eventId)
        if (eventIndex !== -1) {
          const existingAttendeeIndex = events.value[eventIndex].attendees.findIndex(
            (a) => a.userId === attendee.userId,
          )
          if (existingAttendeeIndex !== -1) {
            events.value[eventIndex].attendees[existingAttendeeIndex] = attendee
          } else {
            events.value[eventIndex].attendees.push(attendee)
          }

          // Update current attendees count
          events.value[eventIndex].currentAttendees = events.value[eventIndex].attendees.filter(
            (a) => a.status === 'attending',
          ).length
        }

        // Update current event if it's the same
        if (currentEvent.value?.id === eventId) {
          const existingAttendeeIndex = currentEvent.value.attendees.findIndex(
            (a) => a.userId === attendee.userId,
          )
          if (existingAttendeeIndex !== -1) {
            currentEvent.value.attendees[existingAttendeeIndex] = attendee
          } else {
            currentEvent.value.attendees.push(attendee)
          }
          currentEvent.value.currentAttendees = currentEvent.value.attendees.filter(
            (a) => a.status === 'attending',
          ).length
        }

        return attendee
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to RSVP to event'
        console.error('Error RSVPing to event:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchEventAttendees(eventId: string) {
      loading.value = true
      error.value = null

      try {
        const attendees = await eventService.getEventAttendees(eventId)
        eventAttendees.value = attendees
        return attendees
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch event attendees'
        console.error('Error fetching event attendees:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchEventStats(eventId?: string) {
      loading.value = true
      error.value = null

      try {
        const stats = await eventService.getEventStats(eventId)
        eventStats.value = stats
        return stats
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch event stats'
        console.error('Error fetching event stats:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchUpcomingEvents(limit: number = 10) {
      loading.value = true
      error.value = null

      try {
        const upcoming = await eventService.getUpcomingEvents(limit)
        // Merge with existing events, avoiding duplicates
        upcoming.forEach((event) => {
          const existingIndex = events.value.findIndex((e) => e.id === event.id)
          if (existingIndex !== -1) {
            events.value[existingIndex] = event
          } else {
            events.value.push(event)
          }
        })
        return upcoming
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch upcoming events'
        console.error('Error fetching upcoming events:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchEventsByCategory(category: EventCategory, limit: number = 20) {
      loading.value = true
      error.value = null

      try {
        const categoryEvents = await eventService.getEventsByCategory(category, limit)
        return categoryEvents
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch events by category'
        console.error('Error fetching events by category:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function cancelEvent(eventId: string, reason?: string) {
      loading.value = true
      error.value = null

      try {
        const cancelledEvent = await eventService.cancelEvent(eventId, reason)

        // Update the event in the events array
        const index = events.value.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          events.value[index] = cancelledEvent
        }

        // Update current event if it's the same
        if (currentEvent.value?.id === eventId) {
          currentEvent.value = cancelledEvent
        }

        return cancelledEvent
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to cancel event'
        console.error('Error cancelling event:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    async function postponeEvent(
      eventId: string,
      newStartDate: Date,
      newEndDate: Date,
      reason?: string,
    ) {
      loading.value = true
      error.value = null

      try {
        const postponedEvent = await eventService.postponeEvent(
          eventId,
          newStartDate,
          newEndDate,
          reason,
        )

        // Update the event in the events array
        const index = events.value.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          events.value[index] = postponedEvent
        }

        // Update current event if it's the same
        if (currentEvent.value?.id === eventId) {
          currentEvent.value = postponedEvent
        }

        return postponedEvent
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to postpone event'
        console.error('Error postponing event:', err)
        throw err
      } finally {
        loading.value = false
      }
    }

    function setFilters(newFilters: EventFilter) {
      filters.value = newFilters
    }

    function clearFilters() {
      filters.value = {}
    }

    function setSearchQuery(query: EventSearchQuery) {
      searchQuery.value = query
    }

    function clearError() {
      error.value = null
    }

    function setCurrentEvent(event: Event | null) {
      currentEvent.value = event
    }

    // Reset store
    function $reset() {
      events.value = []
      currentEvent.value = null
      eventAttendees.value = []
      eventNotifications.value = []
      eventStats.value = null
      loading.value = false
      error.value = null
      filters.value = {}
      searchQuery.value = { limit: 20, offset: 0 }
    }

    return {
      // State
      events,
      currentEvent,
      eventAttendees,
      eventNotifications,
      eventStats,
      loading,
      error,
      filters,
      searchQuery,

      // Getters
      upcomingEvents,
      pastEvents,
      eventsByCategory,
      myEvents,
      eventsByStatus,
      totalEvents,
      totalAttendees,

      // Actions
      fetchEvents,
      fetchEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      rsvpToEvent,
      fetchEventAttendees,
      fetchEventStats,
      fetchUpcomingEvents,
      fetchEventsByCategory,
      cancelEvent,
      postponeEvent,
      setFilters,
      clearFilters,
      setSearchQuery,
      clearError,
      setCurrentEvent,
      $reset,
    }
  },
  {
    persist: {
      key: 'event-store',
      storage: localStorage,
      paths: ['events', 'filters', 'searchQuery'],
    },
  },
)
