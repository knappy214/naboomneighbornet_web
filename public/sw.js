/* eslint-env serviceworker */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch (_error) {
    data = { title: 'Community Hub', body: event.data?.text() ?? '' }
  }

  const title = data.title ?? 'Community Hub'
  const options = {
    body: data.body ?? '',
    data: data.url ?? '/',
    badge: '/favicon-32x32.png',
    icon: '/android-chrome-192x192.png',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const destination = event.notification.data || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'navigate', url: destination })
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(destination)
      }
      return null
    }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'ping') {
    event.source?.postMessage({ type: 'pong', timestamp: Date.now() })
  }
})
