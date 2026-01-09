// Clear all FCM tokens to force re-registration
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function clearAllTokens() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enjinia-to-do');
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing all FCM tokens...');
    const result = await User.updateMany(
      { fcmToken: { $exists: true, $ne: null } },
      { $set: { fcmToken: null } }
    );

    console.log(`✅ Cleared ${result.modifiedCount} FCM tokens`);
    console.log('👥 Users will re-register tokens on next login');

    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearAllTokens();
