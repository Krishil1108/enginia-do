const mongoose = require('mongoose');
require('dotenv').config();
const Role = require('./models/Role');

async function createDefaultRoles() {
    try {
        console.log('🎯 Creating default roles for Enginia To-Do...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enginia-to-do');
        console.log('✅ MongoDB connected');

        // Define default roles
        const defaultRoles = [
            {
                name: 'Salesman',
                description: 'Sales team members with limited access to tasks and basic features',
                permissions: {
                    dashboard: true,
                    tasks: true,
                    projects: false,
                    users: false,
                    associates: false,
                    notifications: true,
                    reports: false,
                    settings: false,
                    analytics: false,
                    calendar: true
                }
            },
            {
                name: 'Marketing Team',
                description: 'Marketing team with access to projects and analytics',
                permissions: {
                    dashboard: true,
                    tasks: true,
                    projects: true,
                    users: false,
                    associates: false,
                    notifications: true,
                    reports: true,
                    settings: false,
                    analytics: true,
                    calendar: true
                }
            },
            {
                name: 'Support Agent',
                description: 'Customer support agents with basic access',
                permissions: {
                    dashboard: true,
                    tasks: true,
                    projects: false,
                    users: false,
                    associates: false,
                    notifications: true,
                    reports: false,
                    settings: false,
                    analytics: false,
                    calendar: true
                }
            },
            {
                name: 'Project Manager',
                description: 'Project managers with access to projects and team oversight',
                permissions: {
                    dashboard: true,
                    tasks: true,
                    projects: true,
                    users: false,
                    associates: true,
                    notifications: true,
                    reports: true,
                    settings: false,
                    analytics: true,
                    calendar: true
                }
            }
        ];

        console.log('📋 Creating default roles...');

        for (const roleData of defaultRoles) {
            // Check if role already exists
            const existingRole = await Role.findOne({ name: roleData.name });
            
            if (existingRole) {
                console.log(`⚠️  Role "${roleData.name}" already exists. Skipping...`);
                continue;
            }

            // Create new role
            const role = new Role(roleData);
            await role.save();
            console.log(`✅ Created role: ${roleData.name}`);
        }

        console.log('\n🎉 Default roles created successfully!');
        console.log('\n📖 Role Usage Instructions:');
        console.log('1. Login as owner (vaishal) to access Admin Panel');
        console.log('2. Go to Role & Permission Management to view/edit roles');
        console.log('3. Go to User Management to assign roles to users');
        console.log('4. Each role controls which pages users can see and access');
        console.log('\nRoles created:');
        defaultRoles.forEach(role => {
            const permissionCount = Object.values(role.permissions).filter(Boolean).length;
            console.log(`- ${role.name}: ${permissionCount}/10 permissions`);
        });

    } catch (error) {
        console.error('❌ Error creating default roles:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
        process.exit();
    }
}

createDefaultRoles();