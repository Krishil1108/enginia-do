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

async function createEnginiaOwners() {
    try {
        console.log('🚀 Creating Enginia owners...');

        // Generate 6-digit numeric passwords
        const vaishalPassword = Math.floor(100000 + Math.random() * 900000).toString();
        const niraliPassword = Math.floor(100000 + Math.random() * 900000).toString();

        const owners = [
            {
                username: 'vaishal',
                email: 'vaishal@enginia.com',
                password: vaishalPassword,
                role: 'Admin',
                team: 'Management',
                name: 'Vaishal'
            },
            {
                username: 'nirali',
                email: 'nirali@enginia.com', 
                password: niraliPassword,
                role: 'Admin',
                team: 'Management',
                name: 'Nirali'
            }
        ];

        console.log('\n📋 Owner Credentials:');
        console.log('====================');

        for (const owner of owners) {
            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [{ username: owner.username }, { email: owner.email }]
            });

            if (existingUser) {
                console.log(`⚠️  User ${owner.username} already exists. Updating...`);
                
                // Update existing user
                const hashedPassword = await bcrypt.hash(owner.password, 12);
                await User.findByIdAndUpdate(existingUser._id, {
                    password: hashedPassword,
                    role: owner.role,
                    team: owner.team,
                    name: owner.name,
                    position: 'Owner'
                });
                
                console.log(`✅ Updated: ${owner.username}`);
                console.log(`   Email: ${owner.email}`);
                console.log(`   Password: ${owner.password}`);
                console.log(`   Role: ${owner.role}`);
            } else {
                // Create new user
                const hashedPassword = await bcrypt.hash(owner.password, 12);
                
                const newUser = new User({
                    username: owner.username,
                    email: owner.email,
                    password: hashedPassword,
                    role: owner.role,
                    team: owner.team,
                    name: owner.name,
                    position: 'Owner'
                });

                await newUser.save();
                console.log(`✅ Created: ${owner.username}`);
                console.log(`   Email: ${owner.email}`);
                console.log(`   Password: ${owner.password}`);
                console.log(`   Role: ${owner.role}`);
            }
            console.log('');
        }

        console.log('🎉 Enginia owners created successfully!');
        console.log('\n⚠️  Important: Save these passwords securely!');
        
    } catch (error) {
        console.error('❌ Error creating owners:', error);
    } finally {
        mongoose.connection.close();
    }
}

createEnginiaOwners();