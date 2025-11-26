const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function updateKetulDepartment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement');
    console.log('📦 Connected to MongoDB');

    // Update Ketul Lathia's department
    const result = await User.updateOne(
      { username: 'ketul.lathia' },
      { $set: { department: 'Owner' } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Ketul Lathia department to "Owner"');
    } else {
      console.log('⚠️  No changes made. User might already have "Owner" as department or user not found.');
    }

    const user = await User.findOne({ username: 'ketul.lathia' });
    if (user) {
      console.log(`\n📋 Current user details:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Department: ${user.department}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
}

updateKetulDepartment();
