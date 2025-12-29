const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Role = require('./models/Role');

async function migrateToSingleRoleSystem() {
    try {
        console.log('🔄 Migrating to single role system...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enjinia-to-do');
        console.log('✅ MongoDB connected');

        // Create a default "General User" role for existing users
        let defaultRole = await Role.findOne({ name: 'General User' });
        
        if (!defaultRole) {
            defaultRole = new Role({
                name: 'General User',
                description: 'Default role for existing users with basic access',
                permissions: {
                    myTasks: true,
                    allTasks: true,
                    assignedByMe: true,
                    associateTasks: false,
                    externalTasks: false,
                    confidentialTasks: false,
                    adminReports: false,
                    adminPanel: false,
                    settings: true
                }
            });
            await defaultRole.save();
            console.log('✅ Created default "General User" role');
        }

        // Find all users that need migration (those without a role ObjectId)
        const usersToMigrate = await User.find({
            $or: [
                { role: { $type: "string" } }, // Old string-based roles
                { role: { $exists: false } },   // Missing role field
                { role: null }                   // Null role
            ]
        });

        console.log(`📋 Found ${usersToMigrate.length} users to migrate`);

        for (const user of usersToMigrate) {
            try {
                // Assign default role to all users
                user.role = defaultRole._id;
                
                // Remove old customRole field if it exists
                if (user.customRole) {
                    user.role = user.customRole; // Use custom role if they had one
                    user.customRole = undefined;
                }
                
                await user.save();
                console.log(`✅ Migrated user: ${user.username} (${user.name})`);
            } catch (error) {
                console.error(`❌ Error migrating user ${user.username}:`, error.message);
            }
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📖 Next Steps:');
        console.log('1. All existing users now have the "General User" role');
        console.log('2. Login as vaishal to access Admin Panel');
        console.log('3. Create custom roles in Role Management');
        console.log('4. Assign appropriate roles to users in User Management');
        console.log('5. Users will see pages based on their assigned role permissions');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
        process.exit();
    }
}

migrateToSingleRoleSystem();