/**
 * Notification Service
 * Handles push notifications and browser notifications
 * Part of User Story 1: Real-Time Discussion Channels
 */

import type { Notification, NotificationPermission } from '@/types/communication'

export class NotificationService {
  private permission: NotificationPermission = 'default'
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map()

  constructor() {
    this.initialize()
  }

  /**
   * Initialize notification service
   */
  private async initialize(): Promise<void> {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return
    }

    // Check current permission
    this.permission = Notification.permission as NotificationPermission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission as NotificationPermission
      return this.permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      throw error
    }
  }

  /**
   * Check if notifications are allowed
   */
  isAllowed(): boolean {
    return this.permission === 'granted'
  }

  /**
   * Show notification
   */
  async showNotification(notification: Notification): Promise<void> {
    if (!this.isAllowed()) {
      console.warn('Notifications not allowed')
      return
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        badge: notification.badge || '/favicon-32x32.png',
        tag: notification.tag,
        data: notification.data,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
        timestamp: notification.timestamp || Date.now(),
        vibrate: notification.vibrate,
        actions: notification.actions?.map((action) => ({
          action: action.action,
          title: action.title,
          icon: action.icon,
        })),
      })

      // Handle click
      browserNotification.onclick = () => {
        if (notification.onClick) {
          notification.onClick()
        }
        browserNotification.close()
      }

      // Handle close
      browserNotification.onclose = () => {
        if (notification.onClose) {
          notification.onClose()
        }
      }

      // Handle error
      browserNotification.onerror = (error) => {
        console.error('Notification error:', error)
        if (notification.onError) {
          notification.onError(error)
        }
      }

      // Auto close after 5 seconds if not requiring interaction
      if (!notification.requireInteraction) {
        setTimeout(() => {
          browserNotification.close()
        }, 5000)
      }

      // Notify listeners
      this.notifyListeners('notification_shown', notification)
    } catch (error) {
      console.error('Failed to show notification:', error)
      throw error
    }
  }

  /**
   * Show message notification
   */
  async showMessageNotification(
    channelName: string,
    senderName: string,
    message: string,
    channelId: string,
    messageId: string,
  ): Promise<void> {
    const notification: Notification = {
      title: `New message in #${channelName}`,
      body: `${senderName}: ${message}`,
      icon: '/favicon.ico',
      tag: `message-${channelId}`,
      data: { channelId, messageId, type: 'message' },
      requireInteraction: false,
      onClick: () => {
        // Focus the channel
        window.focus()
        // This would typically navigate to the channel
        console.log('Navigate to channel:', channelId)
      },
    }

    await this.showNotification(notification)
  }

  /**
   * Show channel notification
   */
  async showChannelNotification(
    channelName: string,
    message: string,
    channelId: string,
  ): Promise<void> {
    const notification: Notification = {
      title: `#${channelName}`,
      body: message,
      icon: '/favicon.ico',
      tag: `channel-${channelId}`,
      data: { channelId, type: 'channel' },
      requireInteraction: false,
      onClick: () => {
        window.focus()
        console.log('Navigate to channel:', channelId)
      },
    }

    await this.showNotification(notification)
  }

  /**
   * Show system notification
   */
  async showSystemNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ): Promise<void> {
    const notification: Notification = {
      title,
      body: message,
      icon: this.getIconForType(type),
      tag: `system-${type}`,
      data: { type: 'system', notificationType: type },
      requireInteraction: type === 'error',
      onClick: () => {
        window.focus()
      },
    }

    await this.showNotification(notification)
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
    // This would clear all notifications with our tags
    // Note: There's no direct API to clear all notifications
    // This is more of a conceptual method
    console.log('Clearing all notifications')
  }

  /**
   * Subscribe to notification events
   */
  subscribe(event: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: string, notification: Notification): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(notification)
        } catch (error) {
          console.error('Error in notification listener:', error)
        }
      })
    }
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return 'Notification' in window
  }

  /**
   * Get notification settings
   */
  getSettings(): {
    enabled: boolean
    permission: NotificationPermission
    available: boolean
  } {
    return {
      enabled: this.isAllowed(),
      permission: this.permission,
      available: this.isAvailable(),
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService
