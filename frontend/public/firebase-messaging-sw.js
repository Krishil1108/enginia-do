// Firebase Cloud Messaging Service Worker
// INSTANT notifications - no deduplication
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

// Handle background messages from Firebase (data-only messages)
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Service Worker received message (INSTANT):', payload);

  // Extract from data payload (we send data-only messages now)
  const notificationTitle = payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.data?.body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: `task-${Date.now()}`, // Unique tag for each notification to prevent grouping
    requireInteraction: false, // Don't require interaction for faster display
    silent: false, // Ensure notification makes sound
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    data: payload.data
  };

  console.log('📣 Showing notification instantly:', notificationTitle);
  return self.registration.showNotification(notificationTitle, notificationOptions);
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
