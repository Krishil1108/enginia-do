const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const firebaseNotificationService = require('../services/firebaseNotificationService');
const { deleteOldNotifications, getNotificationStats, runManualCleanup } = require('../services/notificationCleanup');

// Track recent notifications to prevent rapid duplicates (5-second window)
const recentNotifications = new Map();

// Get notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .populate('taskId')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count
router.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.params.userId, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read for a user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all notifications for a user
router.delete('/user/:userId/clear-all', async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.params.userId });
    res.json({ 
      message: 'All notifications cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Note: deleteOldNotifications is imported from notificationCleanup service
// and runs automatically via scheduled jobs in that service

// Create notification
router.post('/', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    const newNotification = await notification.save();
    
    // Note: Push notifications are handled by the frontend via /send-push endpoint
    // This avoids duplicate notifications and gives frontend more control
    
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Push notification routes

// Subscribe to push notifications (FCM token registration)
router.post('/subscribe', async (req, res) => {
  try {
    const { fcmToken, userId } = req.body;
    
    if (!fcmToken || !userId) {
      return res.status(400).json({ 
        error: 'FCM token and userId are required' 
      });
    }

    // Find user by either _id or username
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findOne({ username: userId });
    }
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Save FCM token to user
    user.fcmToken = fcmToken;
    await user.save();

    console.log(`✅ User ${userId} subscribed to Firebase push notifications`);
    
    // Send a welcome notification
    const result = await firebaseNotificationService.sendNotification(
      fcmToken,
      {
        title: 'Notifications Enabled!',
        body: 'You will now receive push notifications for task updates.',
        data: { type: 'welcome' }
      }
    );

    res.status(201).json({ 
      message: 'Subscription successful',
      success: true 
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ 
      error: 'Failed to subscribe to notifications',
      success: false 
    });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'UserId is required' 
      });
    }

    // Find user and remove FCM token
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findOne({ username: userId });
    }
    
    if (user) {
      user.fcmToken = null;
      await user.save();
      console.log(`User ${userId} unsubscribed from push notifications`);
      res.json({ 
        message: 'Unsubscribed successfully',
        success: true 
      });
    } else {
      res.status(404).json({ 
        error: 'User not found',
        success: false 
      });
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ 
      error: 'Failed to unsubscribe from notifications',
      success: false 
    });
  }
});

// Send push notification to specific user
router.post('/send-push', async (req, res) => {
  try {
    const { userId, title, body, data, actions } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ 
        error: 'UserId and title are required' 
      });
    }

    // Check for duplicate notifications (5-second window)
    const notificationKey = `${userId}_${title}_${body}`;
    const now = Date.now();
    const lastSent = recentNotifications.get(notificationKey);
    
    if (lastSent && (now - lastSent) < 5000) {
      console.log(`⏭️ Skipping duplicate push notification for ${userId} - sent ${now - lastSent}ms ago`);
      return res.json({ 
        success: true, 
        message: 'Duplicate notification prevented',
        skipped: true 
      });
    }
    
    // Record this notification
    recentNotifications.set(notificationKey, now);
    
    // Clean up old entries (older than 10 seconds)
    for (const [key, timestamp] of recentNotifications.entries()) {
      if (now - timestamp > 10000) {
        recentNotifications.delete(key);
      }
    }

    const result = await sendPushNotification(userId, {
      title,
      body: body || '',
      data: data || {},
      actions: actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      success: false 
    });
  }
});

// Test push notification
router.post('/test-push', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'UserId is required' 
      });
    }

    const result = await sendPushNotification(userId, {
      title: 'Test Notification',
      body: 'This is a test notification from the Task Management System!',
      data: { type: 'test', timestamp: new Date().toISOString() }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send test notification',
      success: false 
    });
  }
});

// Get push notification stats
router.get('/push-stats', async (req, res) => {
  try {
    const usersWithTokens = await User.countDocuments({ fcmToken: { $exists: true, $ne: null } });
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } })
      .select('username name fcmToken')
      .limit(50);
    
    const stats = {
      totalSubscriptions: usersWithTokens,
      subscribedUsers: users.map(u => ({
        userId: u._id,
        username: u.username,
        name: u.name,
        hasToken: !!u.fcmToken
      }))
    };
    
    console.log('📊 Current push notification stats:', { totalSubscriptions: stats.totalSubscriptions });
    res.json(stats);
  } catch (error) {
    console.error('Error getting push stats:', error);
    res.status(500).json({ error: 'Failed to get push stats' });
  }
});

// Helper function to send push notifications using Firebase
async function sendPushNotification(userId, notificationData) {
  try {
    console.log(`📤 Attempting to send Firebase push notification to userId: ${userId}`);
    
    // Find user by either _id or username
    let user = null;
    
    // Check if userId looks like a MongoDB ObjectId (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    if (isObjectId) {
      user = await User.findById(userId);
    }
    
    // If not found by ID or not an ObjectId, try username
    if (!user) {
      user = await User.findOne({ username: userId });
    }
    
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return { 
        success: false, 
        error: `User not found: ${userId}` 
      };
    }
    
    if (!user.fcmToken) {
      console.log(`❌ No FCM token found for user: ${userId}`);
      return { 
        success: false, 
        error: `User has no FCM token registered` 
      };
    }
    
    console.log(`✅ Found FCM token for user: ${userId}`);
    
    // Send notification via Firebase
    const result = await firebaseNotificationService.sendNotification(
      user.fcmToken,
      {
        title: notificationData.title,
        body: notificationData.body || '',
        data: notificationData.data || {}
      }
    );
    
    console.log(`📬 Firebase notification result:`, result);
    return result;
    
  } catch (error) {
    console.error('Error sending Firebase push notification:', error);
    return { 
      success: false, 
      error: 'Failed to send push notification: ' + error.message 
    };
  }
}

// WhatsApp-style burst active notification test
router.post('/burst-test', async (req, res) => {
  console.log('💥 Received burst test notification request');
  
  try {
    const { userId } = req.body;
    
    let targetUsers = [];
    if (userId) {
      let user = await User.findById(userId);
      if (!user) user = await User.findOne({ username: userId });
      if (user && user.fcmToken) targetUsers.push(user);
    } else {
      targetUsers = await User.find({ fcmToken: { $exists: true, $ne: null } });
    }
    
    if (targetUsers.length === 0) {
      return res.json({ success: false, message: 'No users with FCM tokens found' });
    }

    const notifications = [
      {
        title: '🚨 URGENT: Task Reminder',
        body: 'You have an important task due soon! This notification should be very noticeable.'
      },
      {
        title: '📋 Task Update Alert',
        body: 'Your task list has been updated - check it now!'
      },
      {
        title: '⚡ Quick Action Required',
        body: 'Tap to complete your pending task - just like WhatsApp!'
      }
    ];

    let totalSuccess = 0;
    
    // Send notifications with delays
    for (const [index, notif] of notifications.entries()) {
      setTimeout(async () => {
        for (const user of targetUsers) {
          try {
            const result = await firebaseNotificationService.sendNotification(
              user.fcmToken,
              {
                title: notif.title,
                body: notif.body,
                data: {
                  burst: 'true',
                  sequence: String(index + 1),
                  total: String(notifications.length),
                  urgent: 'true'
                }
              }
            );
            
            if (result.success) {
              totalSuccess++;
              console.log(`✅ Burst notification ${index + 1} sent to ${user.username}`);
            }
          } catch (error) {
            console.error(`❌ Burst notification ${index + 1} failed for ${user.username}:`, error);
          }
        }
      }, index * 3000); // Send every 3 seconds
    }

    res.json({ 
      success: true, 
      message: `Burst of ${notifications.length} Firebase notifications initiated for ${targetUsers.length} user(s)`,
      targetUsers: targetUsers.length
    });
  } catch (error) {
    console.error('❌ Burst notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notification cleanup routes
// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getNotificationStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Failed to get notification stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manual cleanup trigger (for testing/admin use)
router.post('/cleanup', async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    
    if (daysOld < 1) {
      return res.status(400).json({
        success: false,
        error: 'daysOld must be at least 1'
      });
    }
    
    const result = await runManualCleanup(daysOld);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check cleanup status
router.get('/cleanup/status', async (req, res) => {
  try {
    const stats = await getNotificationStats();
    const now = new Date();
    
    res.json({
      success: true,
      message: 'Automatic cleanup is active',
      schedule: 'Every 24 hours',
      nextCleanup: 'Running continuously',
      currentStats: stats,
      cleanupThreshold: '30 days',
      lastChecked: now.toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to get cleanup status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, sendPushNotification };
