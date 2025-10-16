import { api } from './api'
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

export class EventService {
  private baseUrl = '/api/events'

  /**
   * Create a new event
   */
  async createEvent(
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentAttendees' | 'attendees'>,
  ): Promise<Event> {
    try {
      const response = await api.post(`${this.baseUrl}`, eventData)
      return response.data
    } catch (error) {
      console.error('Failed to create event:', error)
      throw new Error('Failed to create event')
    }
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<Event> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Failed to get event:', error)
      throw new Error('Failed to get event')
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    try {
      const response = await api.patch(`${this.baseUrl}/${eventId}`, updates)
      return response.data
    } catch (error) {
      console.error('Failed to update event:', error)
      throw new Error('Failed to update event')
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${eventId}`)
    } catch (error) {
      console.error('Failed to delete event:', error)
      throw new Error('Failed to delete event')
    }
  }

  /**
   * Search events with filters and pagination
   */
  async searchEvents(query: EventSearchQuery): Promise<{ events: Event[]; total: number }> {
    try {
      const response = await api.post(`${this.baseUrl}/search`, query)
      return response.data
    } catch (error) {
      console.error('Failed to search events:', error)
      throw new Error('Failed to search events')
    }
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: EventFilter,
  ): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/date-range`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          ...filters,
        },
      })
      return response.data
    } catch (error) {
      console.error('Failed to get events by date range:', error)
      throw new Error('Failed to get events by date range')
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/upcoming`, {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error('Failed to get upcoming events:', error)
      throw new Error('Failed to get upcoming events')
    }
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(category: EventCategory, limit: number = 20): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/category/${category}`, {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error('Failed to get events by category:', error)
      throw new Error('Failed to get events by category')
    }
  }

  /**
   * Get user's events (created or attending)
   */
  async getUserEvents(
    userId: string,
    type: 'created' | 'attending' | 'all' = 'all',
  ): Promise<Event[]> {
    try {
      const response = await api.get(`${this.baseUrl}/user/${userId}`, {
        params: { type },
      })
      return response.data
    } catch (error) {
      console.error('Failed to get user events:', error)
      throw new Error('Failed to get user events')
    }
  }

  /**
   * RSVP to an event
   */
  async rsvpToEvent(
    eventId: string,
    status: AttendeeStatus,
    notes?: string,
  ): Promise<EventAttendee> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/rsvp`, {
        status,
        notes,
      })
      return response.data
    } catch (error) {
      console.error('Failed to RSVP to event:', error)
      throw new Error('Failed to RSVP to event')
    }
  }

  /**
   * Update RSVP status
   */
  async updateRsvp(
    eventId: string,
    status: AttendeeStatus,
    notes?: string,
  ): Promise<EventAttendee> {
    try {
      const response = await api.patch(`${this.baseUrl}/${eventId}/rsvp`, {
        status,
        notes,
      })
      return response.data
    } catch (error) {
      console.error('Failed to update RSVP:', error)
      throw new Error('Failed to update RSVP')
    }
  }

  /**
   * Get event attendees
   */
  async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}/attendees`)
      return response.data
    } catch (error) {
      console.error('Failed to get event attendees:', error)
      throw new Error('Failed to get event attendees')
    }
  }

  /**
   * Add event reminder
   */
  async addEventReminder(
    eventId: string,
    reminder: {
      type: 'email' | 'push' | 'sms' | 'in_app'
      triggerTime: Date
      message: string
      recipients: string[]
    },
  ): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${eventId}/reminders`, reminder)
    } catch (error) {
      console.error('Failed to add event reminder:', error)
      throw new Error('Failed to add event reminder')
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId?: string): Promise<EventStats> {
    try {
      const url = eventId ? `${this.baseUrl}/${eventId}/stats` : `${this.baseUrl}/stats`
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Failed to get event stats:', error)
      throw new Error('Failed to get event stats')
    }
  }

  /**
   * Duplicate an event
   */
  async duplicateEvent(eventId: string, newStartDate: Date): Promise<Event> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/duplicate`, {
        newStartDate,
      })
      return response.data
    } catch (error) {
      console.error('Failed to duplicate event:', error)
      throw new Error('Failed to duplicate event')
    }
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string, reason?: string): Promise<Event> {
    try {
      const response = await api.patch(`${this.baseUrl}/${eventId}/cancel`, {
        reason,
      })
      return response.data
    } catch (error) {
      console.error('Failed to cancel event:', error)
      throw new Error('Failed to cancel event')
    }
  }

  /**
   * Postpone an event
   */
  async postponeEvent(
    eventId: string,
    newStartDate: Date,
    newEndDate: Date,
    reason?: string,
  ): Promise<Event> {
    try {
      const response = await api.patch(`${this.baseUrl}/${eventId}/postpone`, {
        newStartDate,
        newEndDate,
        reason,
      })
      return response.data
    } catch (error) {
      console.error('Failed to postpone event:', error)
      throw new Error('Failed to postpone event')
    }
  }

  /**
   * Get event notifications
   */
  async getEventNotifications(eventId: string): Promise<EventNotification[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}/notifications`)
      return response.data
    } catch (error) {
      console.error('Failed to get event notifications:', error)
      throw new Error('Failed to get event notifications')
    }
  }

  /**
   * Send event notification
   */
  async sendEventNotification(
    eventId: string,
    notification: {
      type: string
      title: string
      message: string
      recipients: string[]
      scheduledFor?: Date
    },
  ): Promise<EventNotification> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/notifications`, notification)
      return response.data
    } catch (error) {
      console.error('Failed to send event notification:', error)
      throw new Error('Failed to send event notification')
    }
  }

  /**
   * Upload event attachment
   */
  async uploadEventAttachment(
    eventId: string,
    file: File,
  ): Promise<{
    id: string
    filename: string
    url: string
    mimeType: string
    size: number
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(`${this.baseUrl}/${eventId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Failed to upload event attachment:', error)
      throw new Error('Failed to upload event attachment')
    }
  }

  /**
   * Delete event attachment
   */
  async deleteEventAttachment(eventId: string, attachmentId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${eventId}/attachments/${attachmentId}`)
    } catch (error) {
      console.error('Failed to delete event attachment:', error)
      throw new Error('Failed to delete event attachment')
    }
  }
}

export const eventService = new EventService()
export default eventService
