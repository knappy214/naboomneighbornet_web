/**
 * Language-Aware Notification Service
 * Handles notifications with language detection and translation
 * Part of User Story 2: Multilingual Community Interface
 */

import { notificationService } from '@/services/notificationService'
import { translationService } from '@/services/translationService'
import { detectLanguage } from '@/utils/languageDetection'
import type { Notification, Language } from '@/types/communication'

export class LanguageAwareNotificationService {
  private userLanguage: Language = 'en'

  /**
   * Set user's preferred language
   */
  setUserLanguage(language: Language): void {
    this.userLanguage = language
  }

  /**
   * Get user's preferred language
   */
  getUserLanguage(): Language {
    return this.userLanguage
  }

  /**
   * Show notification with automatic language detection and translation
   */
  async showNotification(notification: Notification): Promise<void> {
    try {
      // Detect language of notification content
      const languageDetection = detectLanguage(notification.body)

      // If notification is in a different language than user's preference, translate it
      if (languageDetection.language !== this.userLanguage) {
        const translatedNotification = await this.translateNotification(
          notification,
          this.userLanguage,
        )
        await notificationService.showNotification(translatedNotification)
      } else {
        await notificationService.showNotification(notification)
      }
    } catch (error) {
      console.error('Failed to show language-aware notification:', error)
      // Fallback to original notification
      await notificationService.showNotification(notification)
    }
  }

  /**
   * Show message notification with language awareness
   */
  async showMessageNotification(
    channelName: string,
    senderName: string,
    message: string,
    channelId: string,
    messageId: string,
    messageLanguage?: string,
  ): Promise<void> {
    try {
      // Detect message language if not provided
      const detectedLanguage = messageLanguage || detectLanguage(message).language

      // Translate if needed
      let translatedMessage = message
      if (detectedLanguage !== this.userLanguage) {
        const translation = await translationService.translate(message, {
          sourceLanguage: detectedLanguage,
          targetLanguage: this.userLanguage,
        })
        translatedMessage = translation.translatedText
      }

      const notification: Notification = {
        title: this.getLocalizedTitle('newMessage', { channel: channelName }),
        body: `${senderName}: ${translatedMessage}`,
        icon: '/favicon.ico',
        tag: `message-${channelId}`,
        data: { channelId, messageId, type: 'message', originalLanguage: detectedLanguage },
        requireInteraction: false,
        onClick: () => {
          window.focus()
          console.log('Navigate to channel:', channelId)
        },
      }

      await this.showNotification(notification)
    } catch (error) {
      console.error('Failed to show message notification:', error)
    }
  }

  /**
   * Show channel notification with language awareness
   */
  async showChannelNotification(
    channelName: string,
    message: string,
    channelId: string,
    messageLanguage?: string,
  ): Promise<void> {
    try {
      // Detect message language if not provided
      const detectedLanguage = messageLanguage || detectLanguage(message).language

      // Translate if needed
      let translatedMessage = message
      if (detectedLanguage !== this.userLanguage) {
        const translation = await translationService.translate(message, {
          sourceLanguage: detectedLanguage,
          targetLanguage: this.userLanguage,
        })
        translatedMessage = translation.translatedText
      }

      const notification: Notification = {
        title: `#${channelName}`,
        body: translatedMessage,
        icon: '/favicon.ico',
        tag: `channel-${channelId}`,
        data: { channelId, type: 'channel', originalLanguage: detectedLanguage },
        requireInteraction: false,
        onClick: () => {
          window.focus()
          console.log('Navigate to channel:', channelId)
        },
      }

      await this.showNotification(notification)
    } catch (error) {
      console.error('Failed to show channel notification:', error)
    }
  }

  /**
   * Show system notification with localization
   */
  async showSystemNotification(
    key: string,
    params: Record<string, any> = {},
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ): Promise<void> {
    try {
      const title = this.getLocalizedTitle(key, params)
      const body = this.getLocalizedMessage(key, params)

      const notification: Notification = {
        title,
        body,
        icon: this.getIconForType(type),
        tag: `system-${type}-${key}`,
        data: { type: 'system', notificationType: type, key, params },
        requireInteraction: type === 'error',
        onClick: () => {
          window.focus()
        },
      }

      await this.showNotification(notification)
    } catch (error) {
      console.error('Failed to show system notification:', error)
    }
  }

  /**
   * Translate notification content
   */
  private async translateNotification(
    notification: Notification,
    targetLanguage: Language,
  ): Promise<Notification> {
    try {
      const translatedTitle = await translationService.translate(notification.title, {
        targetLanguage,
      })

      const translatedBody = await translationService.translate(notification.body, {
        targetLanguage,
      })

      return {
        ...notification,
        title: translatedTitle.translatedText,
        body: translatedBody.translatedText,
      }
    } catch (error) {
      console.error('Failed to translate notification:', error)
      return notification
    }
  }

  /**
   * Get localized title
   */
  private getLocalizedTitle(key: string, params: Record<string, any> = {}): string {
    const titles: Record<Language, Record<string, string>> = {
      en: {
        newMessage: 'New message in #{channel}',
        newChannel: 'New channel: #{channel}',
        userJoined: '{user} joined the channel',
        userLeft: '{user} left the channel',
        messageMentioned: '{user} mentioned you in #{channel}',
        eventCreated: 'New event: {event}',
        eventUpdated: 'Event updated: {event}',
        eventReminder: 'Event reminder: {event}',
        systemMessage: 'System notification',
        permissionDenied: 'Notification permission denied',
        permissionGranted: 'Notifications enabled',
      },
      af: {
        newMessage: 'Nuwe boodskap in #{channel}',
        newChannel: 'Nuwe kanaal: #{channel}',
        userJoined: '{user} het by die kanaal aangesluit',
        userLeft: '{user} het die kanaal verlaat',
        messageMentioned: '{user} het jou genoem in #{channel}',
        eventCreated: 'Nuwe gebeurtenis: {event}',
        eventUpdated: 'Gebeurtenis opdateer: {event}',
        eventReminder: 'Gebeurtenis herinnering: {event}',
        systemMessage: 'Stelsel kennisgewing',
        permissionDenied: 'Kennisgewing toestemming geweier',
        permissionGranted: 'Kennisgewings geaktiveer',
      },
    }

    const title = titles[this.userLanguage]?.[key] || titles.en[key] || key
    return this.interpolateString(title, params)
  }

  /**
   * Get localized message
   */
  private getLocalizedMessage(key: string, params: Record<string, any> = {}): string {
    const messages: Record<Language, Record<string, string>> = {
      en: {
        newMessage: 'You have a new message',
        newChannel: 'A new channel has been created',
        userJoined: 'A user has joined the channel',
        userLeft: 'A user has left the channel',
        messageMentioned: 'Someone mentioned you in a message',
        eventCreated: 'A new event has been created',
        eventUpdated: 'An event has been updated',
        eventReminder: 'An event is starting soon',
        systemMessage: 'You have a system notification',
        permissionDenied: 'Notification permission has been denied',
        permissionGranted: 'Notifications have been enabled',
      },
      af: {
        newMessage: "Jy het 'n nuwe boodskap",
        newChannel: "'n Nuwe kanaal is geskep",
        userJoined: "'n Gebruiker het by die kanaal aangesluit",
        userLeft: "'n Gebruiker het die kanaal verlaat",
        messageMentioned: "Iemand het jou in 'n boodskap genoem",
        eventCreated: "'n Nuwe gebeurtenis is geskep",
        eventUpdated: "'n Gebeurtenis is opdateer",
        eventReminder: "'n Gebeurtenis begin binnekort",
        systemMessage: "Jy het 'n stelsel kennisgewing",
        permissionDenied: 'Kennisgewing toestemming is geweier',
        permissionGranted: 'Kennisgewings is geaktiveer',
      },
    }

    const message = messages[this.userLanguage]?.[key] || messages.en[key] || key
    return this.interpolateString(message, params)
  }

  /**
   * Interpolate string with parameters
   */
  private interpolateString(template: string, params: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match
    })
  }

  /**
   * Get icon for notification type
   */
  private getIconForType(type: string): string {
    const icons = {
      info: '/favicon.ico',
      success: '/favicon.ico',
      warning: '/favicon.ico',
      error: '/favicon.ico',
    }
    return icons[type as keyof typeof icons] || '/favicon.ico'
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    notificationService.clearAllNotifications()
  }

  /**
   * Get notification settings
   */
  getSettings(): {
    enabled: boolean
    permission: string
    available: boolean
    language: Language
  } {
    const settings = notificationService.getSettings()
    return {
      ...settings,
      language: this.userLanguage,
    }
  }
}

// Export singleton instance
export const languageAwareNotificationService = new LanguageAwareNotificationService()
export default languageAwareNotificationService
