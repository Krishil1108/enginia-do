const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@taskmanagement.com',
    role: 'Admin',
    department: 'Management',
    isActive: true
  },
  {
    username: 'john',
    password: 'john123',
    name: 'John Doe',
    email: 'john@taskmanagement.com',
    role: 'Manager',
    department: 'IT',
    isActive: true
  },
  {
    username: 'jane',
    password: 'jane123',
    name: 'Jane Smith',
    email: 'jane@taskmanagement.com',
    role: 'Team Lead',
    department: 'Sales',
    isActive: true
  },
  {
    username: 'bob',
    password: 'bob123',
    name: 'Bob Wilson',
    email: 'bob@taskmanagement.com',
    role: 'Employee',
    department: 'IT',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement');
    console.log('📦 Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert demo users
    await User.insertMany(DEMO_USERS);
    console.log('✅ Added demo users:');
    DEMO_USERS.forEach(user => {
      console.log(`   - ${user.name} (${user.role}) - username: ${user.username}, password: ${user.password}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
