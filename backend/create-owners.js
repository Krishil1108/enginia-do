const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'User'], default: 'User' },
  department: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  manager: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enjinia-to-do', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createOwners = async () => {
  try {
    console.log('👑 Creating owner accounts for Vaishal and Nirali...');

    // Generate 6-digit numeric passwords
    const vaishalPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const niraliPassword = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedVaishalPassword = await bcrypt.hash(vaishalPassword, salt);
    const hashedNiraliPassword = await bcrypt.hash(niraliPassword, salt);

    // Owner users data
    const ownerUsers = [
      {
        name: 'Vaishal',
        username: 'vaishal',
        password: hashedVaishalPassword,
        email: 'vaishal@enjinia.com',
        role: 'Admin',
        department: 'Owner',
        isActive: true,
        manager: null
      },
      {
        name: 'Nirali',
        username: 'nirali',
        password: hashedNiraliPassword,
        email: 'nirali@enjinia.com',
        role: 'Admin',
        department: 'Owner',
        isActive: true,
        manager: null
      }
    ];

    // Check if users already exist and remove them
    for (const userData of ownerUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        await User.deleteOne({ username: userData.username });
        console.log(`🗑️  Removed existing user: ${userData.username}`);
      }
    }

    // Create new users
    await User.insertMany(ownerUsers);

    console.log('\n🎉 Owner accounts created successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log(`👤 Vaishal:`);
    console.log(`   Username: vaishal`);
    console.log(`   Password: ${vaishalPassword}`);
    console.log(`   Email: vaishal@enjinia.com`);
    console.log(`   Role: Admin (Owner)`);
    console.log('');
    console.log(`👤 Nirali:`);
    console.log(`   Username: nirali`);
    console.log(`   Password: ${niraliPassword}`);
    console.log(`   Email: nirali@enjinia.com`);
    console.log(`   Role: Admin (Owner)`);
    console.log('='.repeat(50));
    console.log('\n✨ Both users have full admin rights and owner privileges');
    console.log('🔐 Save these passwords securely - they are randomly generated');

  } catch (error) {
    console.error('❌ Error creating owner accounts:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  createOwners();
});