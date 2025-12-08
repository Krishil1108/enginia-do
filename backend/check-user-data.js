const mongoose = require('mongoose');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Connection error:', err));

async function checkUsers() {
    try {
        console.log('🔍 Checking user data in database...\n');
        
        const users = await User.find({ 
            username: { $in: ['vaishal', 'nirali'] } 
        });
        
        users.forEach(user => {
            console.log(`👤 User: ${user.name} (${user.username})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Department: ${user.department}`);
            console.log(`   Position: ${user.position}`);
            console.log(`   Email: ${user.email}`);
            console.log('');
        });
        
        if (users.length === 0) {
            console.log('❌ No users found!');
        }
        
    } catch (error) {
        console.error('❌ Error checking users:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkUsers();