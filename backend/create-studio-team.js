const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

async function createStudioTeam() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // First, verify Piyush Diwan exists and update his department
    const piyush = await User.findOne({ username: 'piyush.diwan' });
    if (!piyush) {
      console.log('❌ Piyush Diwan user not found. Please create this user first.');
      process.exit(1);
    }
    console.log('✅ Found Piyush Diwan:', piyush.name);
    
    // Update Piyush Diwan's department to Studio Team - Manager
    await User.updateOne(
      { username: 'piyush.diwan' },
      { $set: { department: 'Studio Team - Manager' } }
    );
    console.log('✅ Updated Piyush Diwan department to: Studio Team - Manager\n');

    // Studio team members to create
    const teamMembers = [
      {
        username: 'ankit',
        password: '582947',
        name: 'Ankit',
        email: 'ankit@company.com',
        role: 'Employee',
        department: 'Studio Team',
        manager: 'piyush.diwan',
        isActive: true
      },
      {
        username: 'happy',
        password: '739264',
        name: 'Happy',
        email: 'happy@company.com',
        role: 'Employee',
        department: 'Studio Team',
        manager: 'piyush.diwan',
        isActive: true
      },
      {
        username: 'darshit',
        password: '463821',
        name: 'Darshit',
        email: 'darshit@company.com',
        role: 'Employee',
        department: 'Studio Team',
        manager: 'piyush.diwan',
        isActive: true
      }
    ];

    console.log('\n👥 Creating Studio Team members...\n');

    for (const member of teamMembers) {
      // Check if user already exists
      const existing = await User.findOne({ username: member.username });
      
      if (existing) {
        console.log(`⚠️  User ${member.username} already exists - updating manager field`);
        await User.updateOne(
          { username: member.username },
          { $set: { manager: 'piyush.diwan', department: 'Studio Team' } }
        );
        console.log(`✅ Updated ${member.name} - Manager: piyush.diwan\n`);
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(member.password, 10);
        
        // Create new user
        const newUser = new User({
          ...member,
          password: hashedPassword
        });
        
        await newUser.save();
        console.log(`✅ Created: ${member.name}`);
        console.log(`   Username: ${member.username}`);
        console.log(`   Password: ${member.password}`);
        console.log(`   Manager: ${member.manager}`);
        console.log(`   Department: ${member.department}\n`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Studio Team Members Created Under Piyush Diwan:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const teamMembersList = await User.find({ manager: 'piyush.diwan' });
    teamMembersList.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} (${member.username})`);
      console.log(`   Department: ${member.department}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Status: ${member.isActive ? 'Active' : 'Inactive'}\n`);
    });

    console.log('✅ Studio team setup complete!');
    console.log('\nThese users will only see "My Tasks" and "Settings" tabs.');
    console.log('Piyush Diwan will see these 3 users in the "Assign To" dropdown when creating subtasks.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createStudioTeam();
