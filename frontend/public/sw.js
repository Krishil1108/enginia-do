// Service Worker for Task Management System
const CACHE_NAME = 'task-manager-v2';
const urlsToCache = [
  '/'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache');
        
        // Cache essential resources one by one with error handling
        const cachePromises = urlsToCache.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`Cached: ${url}`);
          } catch (error) {
            console.warn(`Failed to cache ${url}:`, error);
            // Continue with other resources even if one fails
          }
        });
        
        await Promise.all(cachePromises);
        console.log('Service Worker installed successfully');
        
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
        // Still proceed with SW installation for push notifications
        return self.skipWaiting();
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip API calls for caching
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Fetch from network and cache for future use
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.warn('Failed to cache response:', error);
            });
          
          return response;
        });
      })
      .catch((error) => {
        console.warn('Fetch failed:', error);
        // Return a fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated and ready for push notifications');
      // Claim all clients to ensure this SW is used immediately
      return self.clients.claim();
    })
  );
});

// Push event listener for notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Task Management System',
    body: 'You have a new notification',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%236366f1"/%3E%3Cpath d="M25 50L40 65L75 30" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%236366f1"/%3E%3Cpath d="M25 50L40 65L75 30" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E',
    tag: 'task-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Task'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      console.log('Failed to parse push data:', e);
      notificationData.body = event.data.text();
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data || {}
    }
  );

  event.waitUntil(notificationPromise);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync data when back online
      fetch('/api/sync')
        .then(response => response.json())
        .then(data => console.log('Background sync completed:', data))
        .catch(err => console.log('Background sync failed:', err))
    );
  }
});