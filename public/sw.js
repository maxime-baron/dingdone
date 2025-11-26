const CACHE_NAME = 'dingdone-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Keep track of scheduled notification timeouts
const scheduledNotifications = new Map();

// Message handler for timer notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay, tag, id } = event.data;

    // Schedule notification after delay
    const timeoutId = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag: tag || 'dingdone-timer',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        silent: false, // Use system notification sound
      });
      // Remove from map after showing
      scheduledNotifications.delete(id);
    }, delay);

    // Store timeout reference
    scheduledNotifications.set(id, timeoutId);
  }

  if (event.data && event.data.type === 'SHOW_NOTIFICATION_NOW') {
    const { title, body, tag } = event.data;

    self.registration.showNotification(title, {
      body,
      tag: tag || 'dingdone-timer',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
    });
  }

  if (event.data && event.data.type === 'CANCEL_ALL_NOTIFICATIONS') {
    // Cancel all scheduled notifications
    scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    scheduledNotifications.clear();
  }
});

// Notification click handler - focus or open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('/timer') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open the app
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
