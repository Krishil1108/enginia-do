const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable not found!');
    console.log('Make sure your .env file is properly configured.');
    process.exit(1);
}

console.log('🌐 Connecting to MongoDB Atlas...');
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createAkshar() {
    try {
        console.log('🚀 Creating Akshar admin account...');

        // Generate 6-digit numeric password
        const aksharPassword = Math.floor(100000 + Math.random() * 900000).toString();

        const aksharData = {
            username: 'akshar',
            email: 'akshar@enginia.com',
            password: aksharPassword,
            role: 'Admin',
            team: 'Management',
            name: 'Akshar'
        };

        console.log('\n📋 Admin Credentials:');
        console.log('====================');

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username: aksharData.username }, { email: aksharData.email }]
        });

        if (existingUser) {
            console.log(`⚠️  User ${aksharData.username} already exists. Updating...`);
            
            // Update existing user
            const hashedPassword = await bcrypt.hash(aksharData.password, 12);
            await User.findByIdAndUpdate(existingUser._id, {
                password: hashedPassword,
                role: aksharData.role,
                team: aksharData.team,
                name: aksharData.name,
                position: 'Admin'
            });
            
            console.log(`✅ Updated: ${aksharData.username}`);
            console.log(`   Email: ${aksharData.email}`);
            console.log(`   Password: ${aksharData.password}`);
            console.log(`   Role: ${aksharData.role}`);
        } else {
            // Create new user
            const hashedPassword = await bcrypt.hash(aksharData.password, 12);
            
            const newUser = new User({
                username: aksharData.username,
                email: aksharData.email,
                password: hashedPassword,
                role: aksharData.role,
                team: aksharData.team,
                name: aksharData.name,
                position: 'Admin'
            });

            await newUser.save();
            console.log(`✅ Created: ${aksharData.username}`);
            console.log(`   Email: ${aksharData.email}`);
            console.log(`   Password: ${aksharData.password}`);
            console.log(`   Role: ${aksharData.role}`);
        }

        console.log('\n🎉 Akshar admin account created successfully!');
        console.log('\n⚠️  Important: Save this password securely!');
        
    } catch (error) {
        console.error('❌ Error creating admin account:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

// Run the script
createAkshar();
