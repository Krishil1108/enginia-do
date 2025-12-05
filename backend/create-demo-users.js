const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified version matching your existing schema)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'User'], default: 'User' },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  manager: { type: String, default: null },
  isDemo: { type: Boolean, default: false }, // New field to identify demo users
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
});

const createDemoUsers = async () => {
  try {
    console.log('🎬 Creating demo users...');

    // Remove only existing demo users (not production users)
    const deletedUsers = await User.deleteMany({ isDemo: true });
    console.log(`🗑️  Removed existing demo users: ${deletedUsers.deletedCount} users`);

    // Demo users data
    const demoUsers = [
      {
        name: 'Demo Admin',
        username: 'demo.admin',
        password: 'demo123',
        email: 'demo.admin@example.com',
        role: 'Admin',
        department: 'Demo Management',
        isActive: true,
        manager: null,
        isDemo: true
      },
      {
        name: 'Demo Manager',
        username: 'demo.manager',
        password: 'demo123',
        email: 'demo.manager@example.com',
        role: 'Manager',
        department: 'Demo Projects',
        isActive: true,
        manager: 'demo.admin',
        isDemo: true
      },
      {
        name: 'Demo User',
        username: 'demo.user',
        password: 'demo123',
        email: 'demo.user@example.com',
        role: 'User',
        department: 'Demo Operations',
        isActive: true,
        manager: 'demo.manager',
        isDemo: true
      }
    ];

    // Create new demo users with hashed passwords
    for (const userData of demoUsers) {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      
      const user = new User(userWithHashedPassword);
      await user.save();
      console.log(`✅ Created demo user: ${userData.name} (${userData.username})`);
    }

    console.log('🎉 Demo users created successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('1. Username: demo.admin | Password: demo123 (Admin)');
    console.log('2. Username: demo.manager | Password: demo123 (Manager)');
    console.log('3. Username: demo.user | Password: demo123 (User)');
    console.log('\n🔒 These users will only see demo data and can create new demo tasks.');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createDemoUsers();