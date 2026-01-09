// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQ6eqxmHSvtlSpb280cGUQJyhQuh6RH9Q",
  authDomain: "engine-11-a08c8.firebaseapp.com",
  projectId: "engine-11-a08c8",
  storageBucket: "engine-11-a08c8.firebasestorage.app",
  messagingSenderId: "554554618350",
  appId: "1:554554618350:web:8eee6501172e862fd41eff",
  measurementId: "G-Y149J2PC6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
