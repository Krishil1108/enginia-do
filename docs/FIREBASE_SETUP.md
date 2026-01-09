# Firebase Setup Instructions for Enjinia-do

## Prerequisites
You need a Firebase project with Cloud Messaging enabled.

## Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **engine-11-a08c8**
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Go to the "Service accounts" tab
6. Click "Generate new private key"
7. Download the JSON file
8. Rename it to `firebase-service-account.json`
9. Place it in the `backend/` directory

## Step 2: Verify Firebase Configuration

The Firebase configuration is already set up in the frontend:
- Project ID: `engine-11-a08c8`
- App ID: `1:543027789224:web:8b9e94f68379b0b1e7319d`

Files configured:
- `frontend/src/firebase.js`
- `frontend/src/firebase-config.js`
- `frontend/public/firebase-messaging-sw.js`

## Step 3: Install Dependencies

### Backend
```bash
cd backend
npm install
```

This will install:
- `firebase-admin` - For sending push notifications from server
- `node-cron` - For automatic notification cleanup

### Frontend
```bash
cd frontend
npm install
```

This will install:
- `firebase` - For receiving push notifications in browser

## Step 4: Test Notifications

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend:
```bash
cd frontend
npm start
```

3. Login to the app
4. Allow notification permissions when prompted
5. The app will automatically request FCM token and save it

## API Endpoints

### Notification Management
- `GET /api/notifications/user/:userId` - Get user notifications
- `GET /api/notifications/user/:userId/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all as read
- `DELETE /api/notifications/user/:userId/clear-all` - Clear all
- `POST /api/notifications` - Create notification
- `POST /api/notifications/send-push` - Send push notification

### FCM Token Management
- `POST /api/users/fcm-token` - Save FCM token for user

### Notification Statistics
- `GET /api/notifications/stats` - Get notification statistics
- `POST /api/notifications/cleanup` - Manual cleanup trigger
- `GET /api/notifications/cleanup/status` - Cleanup status

## Features Implemented

1. **Firebase Cloud Messaging (FCM)**
   - Push notifications to web browsers
   - Background notifications when app is closed
   - Foreground notifications when app is open

2. **Notification Service**
   - Save FCM tokens to database
   - Send notifications to users
   - Handle notification clicks

3. **Auto Cleanup**
   - Automatically delete notifications older than 30 days
   - Runs daily at 2 AM
   - Manual cleanup API available

4. **Duplicate Prevention**
   - Prevents duplicate notifications within 5-second window
   - Tracks recent notifications

5. **Service Worker**
   - Handles background push notifications
   - Shows notification with actions (View, Dismiss)
   - Opens app when notification clicked

## Troubleshooting

### No notifications received?
1. Check if FCM token is saved: Check browser console logs
2. Verify Firebase service account file exists
3. Check backend logs for Firebase initialization
4. Ensure notification permissions are granted in browser

### Firebase not initialized?
1. Ensure `firebase-service-account.json` exists in backend/
2. Check file has correct format
3. Restart backend server

### Token not saving?
1. Check browser console for errors
2. Verify `/api/users/fcm-token` endpoint is working
3. Check if user is logged in

## Security Notes

- Keep `firebase-service-account.json` private and secure
- Add it to `.gitignore` to prevent committing to repository
- Never share service account credentials
- Use environment variables in production

## Support

For issues or questions, check:
1. Browser console logs (F12)
2. Backend server logs
3. Firebase Console for delivery reports
