// public/sw.js - Service Worker for Pilot Płynności PWA & Web Push (N-11 / D-14)

self.addEventListener('install', () => {
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Pilot Płynności',
    body: 'Tydzień 3 czeka. Wrócisz za stery?',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: '/gra/1?resume=T3',
    },
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = { ...data, ...json };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const title = data.title || 'Pilot Płynności';
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'pilot-reminder',
    renotify: true,
    data: data.data || { url: '/gra/1?resume=T3' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an existing game window is open, focus it and navigate
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// Support scheduling simulated demo notification directly inside the service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_DEMO_REMINDER') {
    const delayMs = (event.data.delaySeconds || 30) * 1000;
    const notificationData = event.data.payload || {
      title: 'Pilot Płynności',
      body: 'Tydzień 3 czeka. Wrócisz za stery?',
      icon: '/favicon.ico',
      data: { url: '/gra/1?resume=T3' },
    };

    setTimeout(() => {
      self.registration.showNotification(
        notificationData.title || 'Pilot Płynności',
        {
          body: notificationData.body,
          icon: notificationData.icon || '/favicon.ico',
          tag: 'demo-reminder',
          data: notificationData.data || { url: '/gra/1?resume=T3' },
        }
      );
    }, delayMs);
  }
});
