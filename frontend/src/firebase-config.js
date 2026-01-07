// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmVWT4dd3m-H9Wf5ksBSmGA6AKiqk1Nkg",
  authDomain: "trido-11.firebaseapp.com",
  projectId: "trido-11",
  storageBucket: "trido-11.firebasestorage.app",
  messagingSenderId: "543027789224",
  appId: "1:543027789224:web:8b9e94f68379b0b1e7319d",
  measurementId: "G-7D624BB27G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
