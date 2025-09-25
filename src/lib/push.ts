import { usePrefsStore } from '@/stores/hub/prefs'
import { registerPushSubscription, unregisterPushSubscription } from '@/services/hub'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function initializePush(registration?: ServiceWorkerRegistration) {
  const store = usePrefsStore()
  if (!store.pushSupported || !('Notification' in window)) {
    store.setPermission('unsupported')
    return
  }

  const swRegistration = registration ?? (await navigator.serviceWorker.ready)
  store.setPermission(Notification.permission)

  if (Notification.permission === 'granted' && store.notificationsEnabled) {
    await ensureSubscription(swRegistration)
  }
}

export async function requestNotificationPermission() {
  const store = usePrefsStore()
  if (!('Notification' in window)) {
    store.setPermission('unsupported')
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  store.setPermission(permission)
  store.setNotificationsEnabled(permission === 'granted')
  return permission
}

export async function ensureSubscription(registration: ServiceWorkerRegistration) {
  const store = usePrefsStore()
  try {
    const existing = await registration.pushManager.getSubscription()
    if (existing) {
      store.setSubscription({
        endpoint: existing.endpoint,
        expirationTime: existing.expirationTime,
      })
      await registerPushSubscription(existing)
      return existing
    }

    if (!store.vapidPublicKey) {
      console.warn('No VAPID key configured, skipping push subscription')
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(store.vapidPublicKey),
    })

    store.setSubscription({
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
    })
    await registerPushSubscription(subscription)
    return subscription
  } catch (error) {
    console.warn('Failed to ensure push subscription', error)
    store.setNotificationsEnabled(false)
    return null
  } finally {
    store.setLastSubscriptionCheck(Date.now())
  }
}

export async function disableSubscription(registration: ServiceWorkerRegistration) {
  const store = usePrefsStore()
  try {
    const existing = await registration.pushManager.getSubscription()
    if (existing) {
      await unregisterPushSubscription(existing)
      await existing.unsubscribe()
    }
    store.setSubscription(null)
    store.setNotificationsEnabled(false)
  } catch (error) {
    console.warn('Failed to disable push subscription', error)
  }
}
