// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmVWT4dd3m-H9Wf5ksBSmGA6AKiqk1Nkg",
  authDomain: "engine-11-a08c8.firebaseapp.com",
  projectId: "engine-11-a08c8",
  storageBucket: "engine-11-a08c8.firebasestorage.app",
  messagingSenderId: "543027789224",
  appId: "1:543027789224:web:8b9e94f68379b0b1e7319d",
  measurementId: "G-7D624BB27G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging, getToken, onMessage };
