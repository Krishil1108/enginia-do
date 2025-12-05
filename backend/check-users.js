const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
});

const checkUsers = async () => {
  try {
    console.log('🔍 Checking existing users in database...\n');
    
    // Get all users
    const users = await User.find({}, 'username name role department isDemo isActive').sort({ isDemo: 1, name: 1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('👥 Found Users:');
    console.log('================');
    
    let demoUsers = [];
    let productionUsers = [];
    
    users.forEach(user => {
      const userInfo = `Username: ${user.username} | Name: ${user.name} | Role: ${user.role} | Dept: ${user.department} | Active: ${user.isActive}`;
      
      if (user.isDemo) {
        demoUsers.push(userInfo);
      } else {
        productionUsers.push(userInfo);
      }
    });
    
    if (productionUsers.length > 0) {
      console.log('\n🏢 PRODUCTION USERS:');
      productionUsers.forEach(user => console.log(`  • ${user}`));
    }
    
    if (demoUsers.length > 0) {
      console.log('\n🎬 DEMO USERS:');
      demoUsers.forEach(user => console.log(`  • ${user}`));
    }
    
    console.log('\n💡 Note: Demo users password is "demo123"');
    console.log('💡 Production user passwords are hashed - you may need to reset them');
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUsers();