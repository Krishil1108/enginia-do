const Notification = require('../models/Notification');
const cron = require('node-cron');

/**
 * Delete notifications older than specified days
 * @param {number} daysOld - Number of days to keep notifications (default 30)
 * @returns {Promise<object>} - Deletion result with count
 */
async function deleteOldNotifications(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} notifications older than ${daysOld} days`);
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate.toISOString()
    };
  } catch (error) {
    console.error('❌ Error deleting old notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get notification statistics
 * @returns {Promise<object>} - Statistics about notifications
 */
async function getNotificationStats() {
  try {
    const totalCount = await Notification.countDocuments();
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const readCount = await Notification.countDocuments({ isRead: true });
    
    // Get oldest and newest notifications
    const oldestNotification = await Notification.findOne().sort({ createdAt: 1 });
    const newestNotification = await Notification.findOne().sort({ createdAt: -1 });
    
    // Count by type
    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    return {
      total: totalCount,
      unread: unreadCount,
      read: readCount,
      oldest: oldestNotification?.createdAt || null,
      newest: newestNotification?.createdAt || null,
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    return {
      error: error.message
    };
  }
}

/**
 * Manual cleanup trigger (for testing/admin use)
 * @param {number} daysOld - Number of days to keep
 * @returns {Promise<object>} - Cleanup result
 */
async function runManualCleanup(daysOld = 30) {
  console.log(`🧹 Running manual notification cleanup (keeping last ${daysOld} days)...`);
  
  const statsBefore = await getNotificationStats();
  console.log('📊 Stats before cleanup:', statsBefore);
  
  const result = await deleteOldNotifications(daysOld);
  
  const statsAfter = await getNotificationStats();
  console.log('📊 Stats after cleanup:', statsAfter);
  
  return {
    ...result,
    statsBefore,
    statsAfter
  };
}

/**
 * Start automatic notification cleanup
 * Runs every 24 hours to clean up old notifications
 */
function startAutomaticCleanup() {
  // Run cleanup every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Running scheduled notification cleanup...');
    await deleteOldNotifications(30); // Keep 30 days
  });
  
  console.log('✅ Automatic notification cleanup scheduled (runs daily at 2 AM)');
}

module.exports = {
  deleteOldNotifications,
  getNotificationStats,
  runManualCleanup,
  startAutomaticCleanup
};
