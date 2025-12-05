const mongoose = require('mongoose');
require('dotenv').config();

// Import models (assuming they exist)
const Task = require('./models/Task');
const Project = require('./models/Project');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
});

const createDemoData = async () => {
  try {
    console.log('🎬 Creating demo data...');

    // Remove only existing demo data (not production data)
    const deletedTasks = await Task.deleteMany({ isDemo: true });
    const deletedProjects = await Project.deleteMany({ isDemo: true });
    console.log(`🗑️  Removed existing demo data: ${deletedTasks.deletedCount} tasks, ${deletedProjects.deletedCount} projects`);

    // Create demo projects
    const demoProjects = [
      { name: 'Demo Website Project', isDemo: true },
      { name: 'Demo Mobile App', isDemo: true },
      { name: 'Demo Marketing Campaign', isDemo: true }
    ];

    for (const projectData of demoProjects) {
      const project = new Project(projectData);
      await project.save();
      console.log(`📁 Created demo project: ${projectData.name}`);
    }

    // Create demo tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const demoTasks = [
      {
        project: 'Demo Website Project',
        title: 'Design Homepage Layout',
        description: 'Create wireframes and mockups for the new homepage design',
        priority: 'High',
        severity: 'Major',
        inDate: today,
        outDate: nextWeek,
        assignedBy: 'demo.admin',
        assignedTo: 'demo.user',
        status: 'In Progress',
        isDemo: true
      },
      {
        project: 'Demo Website Project',
        title: 'Setup Database Schema',
        description: 'Configure MongoDB collections and relationships',
        priority: 'Medium',
        severity: 'Major',
        inDate: today,
        outDate: tomorrow,
        assignedBy: 'demo.manager',
        assignedTo: 'demo.user',
        status: 'Pending',
        isDemo: true
      },
      {
        project: 'Demo Mobile App',
        title: 'Create User Authentication',
        description: 'Implement login and registration functionality',
        priority: 'High',
        severity: 'Critical',
        inDate: today,
        outDate: nextWeek,
        assignedBy: 'demo.admin',
        assignedTo: 'demo.manager',
        status: 'Completed',
        completedAt: today,
        isDemo: true
      },
      {
        project: 'Demo Marketing Campaign',
        title: 'Social Media Strategy',
        description: 'Develop comprehensive social media marketing plan',
        priority: 'Medium',
        severity: 'Minor',
        inDate: today,
        outDate: nextWeek,
        assignedBy: 'demo.manager',
        assignedTo: 'demo.user',
        status: 'Pending',
        isDemo: true
      }
    ];

    for (const taskData of demoTasks) {
      const task = new Task(taskData);
      await task.save();
      console.log(`✅ Created demo task: ${taskData.title}`);
    }

    console.log('🎉 Demo data created successfully!');
    console.log('\n📊 Demo Data Summary:');
    console.log('• 3 Demo Projects');
    console.log('• 4 Demo Tasks (1 Completed, 1 In Progress, 2 Pending)');
    console.log('• All data is isolated for demo users only');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createDemoData();