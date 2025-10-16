import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventStore } from '@/stores/hub/events'
import { languageAwareNotificationService } from '@/services/languageAwareNotificationService'
import type { Event, EventNotification, EventNotificationType } from '@/types/events'

export function useEventNotifications() {
  const { t } = useI18n()
  const eventStore = useEventStore()

  // State
  const notifications = ref<EventNotification[]>([])
  const unreadCount = ref(0)
  const isPermissionGranted = ref(false)
  const isSupported = ref(false)

  // Computed
  const hasUnreadNotifications = computed(() => unreadCount.value > 0)
  const recentNotifications = computed(() =>
    notifications.value
      .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
      .slice(0, 10),
  )

  // Methods
  async function checkNotificationSupport() {
    isSupported.value = 'Notification' in window && 'serviceWorker' in navigator
    return isSupported.value
  }

  async function requestPermission() {
    if (!isSupported.value) {
      throw new Error('Notifications not supported')
    }

    try {
      const permission = await Notification.requestPermission()
      isPermissionGranted.value = permission === 'granted'
      return isPermissionGranted.value
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      throw error
    }
  }

  async function sendEventNotification(
    eventId: string,
    type: EventNotificationType,
    title: string,
    message: string,
    recipients: string[],
    scheduledFor?: Date,
  ) {
    if (!isPermissionGranted.value) {
      throw new Error('Notification permission not granted')
    }

    try {
      const notification = await eventStore.sendEventNotification(eventId, {
        type,
        title,
        message,
        recipients,
        scheduledFor,
      })

      notifications.value.unshift(notification)
      return notification
    } catch (error) {
      console.error('Failed to send event notification:', error)
      throw error
    }
  }

  async function sendEventCreatedNotification(event: Event) {
    const title = t('notifications.eventCreated.title')
    const message = t('notifications.eventCreated.message', {
      title: event.title,
      date: new Date(event.startDate).toLocaleDateString(),
    })

    return sendEventNotification(
      event.id,
      'event_created',
      title,
      message,
      [], // Recipients would be determined by event visibility
      new Date(),
    )
  }

  async function sendEventUpdatedNotification(event: Event, changes: string[]) {
    const title = t('notifications.eventUpdated.title')
    const message = t('notifications.eventUpdated.message', {
      title: event.title,
      changes: changes.join(', '),
    })

    return sendEventNotification(
      event.id,
      'event_updated',
      title,
      message,
      event.attendees.map((a) => a.userId),
      new Date(),
    )
  }

  async function sendEventCancelledNotification(event: Event, reason?: string) {
    const title = t('notifications.eventCancelled.title')
    const message = t('notifications.eventCancelled.message', {
      title: event.title,
      reason: reason || t('notifications.eventCancelled.noReason'),
    })

    return sendEventNotification(
      event.id,
      'event_cancelled',
      title,
      message,
      event.attendees.map((a) => a.userId),
      new Date(),
    )
  }

  async function sendEventReminderNotification(event: Event, reminderType: '24h' | '1h' | '15min') {
    const title = t('notifications.eventReminder.title')
    const message = t('notifications.eventReminder.message', {
      title: event.title,
      time: getReminderTimeText(reminderType),
    })

    return sendEventNotification(
      event.id,
      'event_reminder',
      title,
      message,
      event.attendees.filter((a) => a.status === 'attending').map((a) => a.userId),
      new Date(),
    )
  }

  async function sendRsvpReceivedNotification(event: Event, attendeeName: string, status: string) {
    const title = t('notifications.rsvpReceived.title')
    const message = t('notifications.rsvpReceived.message', {
      attendeeName,
      status: t(`events.rsvpStatus.${status}`),
      eventTitle: event.title,
    })

    return sendEventNotification(
      event.id,
      'rsvp_received',
      title,
      message,
      [event.createdBy], // Notify event creator
      new Date(),
    )
  }

  async function sendEventStartingSoonNotification(event: Event) {
    const title = t('notifications.eventStartingSoon.title')
    const message = t('notifications.eventStartingSoon.message', {
      title: event.title,
      time: new Date(event.startDate).toLocaleTimeString(),
    })

    return sendEventNotification(
      event.id,
      'event_starting_soon',
      title,
      message,
      event.attendees.filter((a) => a.status === 'attending').map((a) => a.userId),
      new Date(),
    )
  }

  async function sendWeatherAlertNotification(event: Event, weatherCondition: string) {
    const title = t('notifications.weatherAlert.title')
    const message = t('notifications.weatherAlert.message', {
      title: event.title,
      condition: weatherCondition,
    })

    return sendEventNotification(
      event.id,
      'weather_alert',
      title,
      message,
      event.attendees.map((a) => a.userId),
      new Date(),
    )
  }

  async function sendLocationChangeNotification(
    event: Event,
    oldLocation: string,
    newLocation: string,
  ) {
    const title = t('notifications.locationChange.title')
    const message = t('notifications.locationChange.message', {
      title: event.title,
      oldLocation,
      newLocation,
    })

    return sendEventNotification(
      event.id,
      'location_change',
      title,
      message,
      event.attendees.map((a) => a.userId),
      new Date(),
    )
  }

  async function sendTimeChangeNotification(event: Event, oldTime: string, newTime: string) {
    const title = t('notifications.timeChange.title')
    const message = t('notifications.timeChange.message', {
      title: event.title,
      oldTime,
      newTime,
    })

    return sendEventNotification(
      event.id,
      'time_change',
      title,
      message,
      event.attendees.map((a) => a.userId),
      new Date(),
    )
  }

  async function sendDiscussionActivityNotification(event: Event, messageCount: number) {
    const title = t('notifications.discussionActivity.title')
    const message = t('notifications.discussionActivity.message', {
      title: event.title,
      count: messageCount,
    })

    return sendEventNotification(
      event.id,
      'discussion_activity',
      title,
      message,
      event.attendees.map((a) => a.userId),
      new Date(),
    )
  }

  async function markNotificationAsRead(notificationId: string) {
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification) {
      notification.isSent = true
      notification.sentAt = new Date()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllNotificationsAsRead() {
    notifications.value.forEach((notification) => {
      if (!notification.isSent) {
        notification.isSent = true
        notification.sentAt = new Date()
      }
    })
    unreadCount.value = 0
  }

  async function deleteNotification(notificationId: string) {
    const index = notifications.value.findIndex((n) => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    }
  }

  async function clearAllNotifications() {
    notifications.value = []
    unreadCount.value = 0
  }

  async function fetchNotifications(eventId?: string) {
    try {
      if (eventId) {
        const eventNotifications = await eventStore.getEventNotifications(eventId)
        notifications.value = eventNotifications
      } else {
        // Fetch all notifications for the user
        // This would typically be a separate API endpoint
        notifications.value = []
      }

      unreadCount.value = notifications.value.filter((n) => !n.isSent).length
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  }

  function getReminderTimeText(reminderType: '24h' | '1h' | '15min'): string {
    switch (reminderType) {
      case '24h':
        return t('notifications.reminderTimes.24h')
      case '1h':
        return t('notifications.reminderTimes.1h')
      case '15min':
        return t('notifications.reminderTimes.15min')
      default:
        return t('notifications.reminderTimes.soon')
    }
  }

  // Schedule automatic reminders
  function scheduleEventReminders(event: Event) {
    const startDate = new Date(event.startDate)
    const now = new Date()

    // 24 hours before
    const reminder24h = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
    if (reminder24h > now) {
      setTimeout(() => {
        sendEventReminderNotification(event, '24h')
      }, reminder24h.getTime() - now.getTime())
    }

    // 1 hour before
    const reminder1h = new Date(startDate.getTime() - 60 * 60 * 1000)
    if (reminder1h > now) {
      setTimeout(() => {
        sendEventReminderNotification(event, '1h')
      }, reminder1h.getTime() - now.getTime())
    }

    // 15 minutes before
    const reminder15min = new Date(startDate.getTime() - 15 * 60 * 1000)
    if (reminder15min > now) {
      setTimeout(() => {
        sendEventReminderNotification(event, '15min')
      }, reminder15min.getTime() - now.getTime())
    }

    // Starting soon (5 minutes before)
    const reminderStartingSoon = new Date(startDate.getTime() - 5 * 60 * 1000)
    if (reminderStartingSoon > now) {
      setTimeout(() => {
        sendEventStartingSoonNotification(event)
      }, reminderStartingSoon.getTime() - now.getTime())
    }
  }

  // Weather monitoring (placeholder)
  function startWeatherMonitoring(event: Event) {
    if (!event.metadata.weatherDependent || !event.location) return

    // This would integrate with a weather service
    // For now, it's a placeholder
    console.log('Weather monitoring started for event:', event.title)
  }

  // Lifecycle
  onMounted(async () => {
    await checkNotificationSupport()
    if (isSupported.value) {
      await requestPermission()
    }
  })

  return {
    // State
    notifications,
    unreadCount,
    isPermissionGranted,
    isSupported,

    // Computed
    hasUnreadNotifications,
    recentNotifications,

    // Methods
    checkNotificationSupport,
    requestPermission,
    sendEventNotification,
    sendEventCreatedNotification,
    sendEventUpdatedNotification,
    sendEventCancelledNotification,
    sendEventReminderNotification,
    sendRsvpReceivedNotification,
    sendEventStartingSoonNotification,
    sendWeatherAlertNotification,
    sendLocationChangeNotification,
    sendTimeChangeNotification,
    sendDiscussionActivityNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications,
    scheduleEventReminders,
    startWeatherMonitoring,
  }
}
