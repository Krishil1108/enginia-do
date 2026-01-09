// Notification Service for Firebase Push Notifications
import API_URL from '../config';
import { messaging } from '../firebase-config';
import { getToken } from 'firebase/messaging';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.FIREBASE_PROJECT_ID = 'engine-11-a08c8'; // Current Firebase project
  }

  // Check if stored token is from old Firebase project
  async validateStoredToken() {
    try {
      const storedProjectId = localStorage.getItem('firebase_project_id');
      if (storedProjectId && storedProjectId !== this.FIREBASE_PROJECT_ID) {
        console.log('🔄 Firebase project changed - clearing old token');
        await this.clearOldToken();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  // Clear old Firebase token
  async clearOldToken() {
    try {
      localStorage.removeItem('fcm_token');
      localStorage.removeItem('firebase_project_id');
      this.fcmToken = null;
      console.log('✅ Old Firebase token cleared');
    } catch (error) {
      console.error('Error clearing old token:', error);
    }
  }

  // Initialize the notification service
  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker for Firebase
      console.log('Registering Firebase service worker...');
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Firebase Service Worker registered successfully');
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    return permission === 'granted';
  }

  // Check if notifications are supported and permitted
  isNotificationSupported() {
    return this.isSupported && Notification.permission === 'granted';
  }

  // Subscribe to Firebase push notifications
  async subscribeToPush() {
    // Validate existing token first
    await this.validateStoredToken();
    try {
      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Add a small delay to ensure service worker is fully activated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get FCM token
      console.log('Requesting FCM token...');
      const token = await getToken(messaging, {
        vapidKey: 'BIJvVGEUhnp0YmaFoETOxZV0OpZs8Kg8VRgxy9xM9R3Ud2TorbxqEbSIhhRL6ee3VuCTw_289OHvcfkPWH71Flg'
      });

      if (token) {
        this.fcmToken = token;
        console.log('FCM token obtained:', token.substring(0, 20) + '...');
        
        // Store project ID with token
        localStorage.setItem('firebase_project_id', this.FIREBASE_PROJECT_ID);
        localStorage.setItem('fcm_token', token);
        
        // Send token to server
        await this.sendTokenToServer(token);
        
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    try {
      await this.removeTokenFromServer();
      this.fcmToken = null;
      console.log('Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  // Send FCM token to server
  async sendTokenToServer(token) {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        console.error('No user logged in');
        return;
      }

      console.log('Registering FCM token for user:', user.username);

      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fcmToken: token,
          userId: user._id || user.username
        })
      });

      if (response.ok) {
        console.log('FCM token registered successfully');
      } else {
        throw new Error('Failed to register FCM token');
      }
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  // Remove token from server
  async removeTokenFromServer() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) return;

      await fetch(`${API_URL}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id || user.username
        })
      });
    } catch (error) {
      console.error('Error removing token from server:', error);
    }
  }

  // Test notification
  async testNotification() {
    if (!this.isNotificationSupported()) {
      alert('Notifications are not supported or not permitted');
      return;
    }

    console.log('🧪 Testing Firebase notification system...');
    
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        alert('Please log in to test notifications');
        return;
      }

      const response = await fetch(`${API_URL}/notifications/test-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id || user.username
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Test notification sent successfully');
        alert('✅ Test notification sent! Check your device for the notification.');
      } else {
        console.error('❌ Test notification failed:', result.error);
        alert('Test notification failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      alert('Failed to send test notification');
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    return {
      subscribed: !!this.fcmToken,
      supported: this.isSupported,
      permission: Notification.permission
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
