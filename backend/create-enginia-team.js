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

async function createEnginiaTeamMembers() {
    try {
        console.log('🚀 Creating Enginia team members...');

        const teamMembers = [
            {
                username: 'chintan',
                email: 'chintan@enginia.com',
                name: 'Chintan',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'gaurav',
                email: 'gaurav@enginia.com',
                name: 'Gaurav',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'pratik',
                email: 'pratik@enginia.com',
                name: 'Pratik',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'karan',
                email: 'karan@enginia.com',
                name: 'Karan',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'shivam',
                email: 'shivam@enginia.com',
                name: 'Shivam',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'deep',
                email: 'deep@enginia.com',
                name: 'Deep',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'mehul',
                email: 'mehul@enginia.com',
                name: 'Mehul',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'mihir',
                email: 'mihir@enginia.com',
                name: 'Mihir',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            },
            {
                username: 'vishal',
                email: 'vishal@enginia.com',
                name: 'Vishal',
                role: 'Employee',
                department: 'Development',
                position: 'Developer'
            }
        ];

        console.log('\n📋 Team Member Credentials:');
        console.log('============================');

        for (const member of teamMembers) {
            try {
                // Generate a 6-digit password for each member
                const password = Math.floor(100000 + Math.random() * 900000).toString();
                const hashedPassword = await bcrypt.hash(password, 12);

                // Check if user already exists
                const existingUser = await User.findOne({ username: member.username });
                if (existingUser) {
                    console.log(`⚠️  User ${member.username} already exists, skipping...`);
                    continue;
                }

                // Create new user
                const newUser = new User({
                    ...member,
                    password: hashedPassword,
                    isActive: true,
                    isDemo: false
                });

                await newUser.save();
                console.log(`✅ ${member.name} (${member.username}): ${password}`);

            } catch (userError) {
                console.error(`❌ Error creating user ${member.username}:`, userError.message);
            }
        }

        console.log('\n✅ Enginia team members creation completed!');
        console.log('\n📌 Important Notes:');
        console.log('- Save these passwords securely');
        console.log('- Users should change passwords on first login');
        console.log('- All users are set as active employees');

    } catch (error) {
        console.error('❌ Error creating team members:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔗 Database connection closed');
    }
}

// Run the function
createEnginiaTeamMembers();