// Firebase Cloud Messaging Service Worker
// Enhanced notifications with detailed status changes
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Keep service worker alive
self.addEventListener('install', (event) => {
  console.log('🔥 Firebase SW installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔥 Firebase SW activated');
  event.waitUntil(clients.claim());
});

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCQ6eqxmHSvtlSpb280cGUQJyhQuh6RH9Q",
  authDomain: "engine-11-a08c8.firebaseapp.com",
  projectId: "engine-11-a08c8",
  storageBucket: "engine-11-a08c8.firebasestorage.app",
  messagingSenderId: "554554618350",
  appId: "1:554554618350:web:8eee6501172e862fd41eff",
  measurementId: "G-Y149J2PC6F"
});

const messaging = firebase.messaging();

// Track recent notifications to prevent duplicates
const recentNotifications = new Map();

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 [BACKGROUND] Received message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Enginia-do Notification';
  const notificationBody = payload.notification?.body || payload.data?.body || '';
  
  // Check for duplicate notifications (5-second window)
  const notificationKey = `${notificationTitle}_${notificationBody}`;
  const now = Date.now();
  const lastShown = recentNotifications.get(notificationKey);
  
  if (lastShown && (now - lastShown) < 5000) {
    console.log('⏭️ [BACKGROUND] Skipping duplicate notification');
    return;
  }
  
  // Record this notification
  recentNotifications.set(notificationKey, now);
  
  // Clean up old entries (older than 10 seconds)
  for (const [key, timestamp] of recentNotifications.entries()) {
    if (now - timestamp > 10000) {
      recentNotifications.delete(key);
    }
  }

  const notificationOptions = {
    body: notificationBody,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `task-${payload.data?.taskId || 'default'}-${now}`,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    renotify: true,
    silent: false,
    data: payload.data || {},
    actions: [
      { action: 'view', title: '👁️ View' },
      { action: 'dismiss', title: '❌ Dismiss' }
    ]
  };

  console.log('📢 [BACKGROUND] Showing notification:', notificationTitle);
  
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('✅ [BACKGROUND] Notification displayed successfully');
    })
    .catch((error) => {
      console.error('❌ [BACKGROUND] Failed to show notification:', error);
    });
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Firebase notification clicked:', event.action || 'default');
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // Open or focus the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Try to focus existing window first
          for (const client of clientList) {
            if (client.url.includes('enginia-do') || client.url.includes('localhost')) {
              console.log('🎯 Focusing existing Firebase app window');
              return client.focus();
            }
          }
          // If no existing window, open new one
          console.log('🆕 Opening new Firebase app window');
          return clients.openWindow('/');
        })
    );
  } else if (event.action === 'dismiss') {
    console.log('❌ Firebase notification dismissed');
    return;
  }
});
