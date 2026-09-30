const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    let filter = {};
    
    if (username) {
      // Check if user is demo user
      const User = require('../models/User');
      const user = await User.findOne({ username });
      if (user && user.isDemo) {
        filter.isDemo = true; // Demo users only see demo tasks
      } else {
        filter.isDemo = { $ne: true }; // Regular users don't see demo tasks
      }
    }
    
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    // Clean up the request body
    const taskData = { ...req.body };
    
    // Handle empty reminder field
    if (taskData.reminder === '' || taskData.reminder === null) {
      delete taskData.reminder;
    }
    
    // Check if the user creating the task is a demo user
    if (taskData.assignedBy) {
      const User = require('../models/User');
      const user = await User.findOne({ username: taskData.assignedBy });
      if (user && user.isDemo) {
        taskData.isDemo = true; // Mark task as demo if created by demo user
      }
    }
    
    if (taskData.initialNote && taskData.initialNote.trim() !== '') {
      if (!taskData.statusHistory) {
        taskData.statusHistory = [];
      }
      taskData.statusHistory.push({
        fromStatus: '',
        toStatus: 'Created',
        note: taskData.initialNote.trim(),
        changedBy: taskData.assignedBy || 'System',
        changedAt: new Date()
      });
    }

    const task = new Task(taskData);
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message, details: error.errors });
  }
});

// Add a note to task timeline history
router.post('/:id/notes', async (req, res) => {
  try {
    const { note, addedBy } = req.body;
    if (!note || note.trim() === '') {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const noteEntry = {
      fromStatus: task.status,
      toStatus: task.status,
      note: note.trim(),
      changedBy: addedBy || 'User',
      changedAt: new Date()
    };

    if (!task.statusHistory) {
      task.statusHistory = [];
    }
    task.statusHistory.push(noteEntry);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Error adding note to task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    // Clean up the request body
    const updateData = { ...req.body };
    
    // Handle empty reminder field
    if (updateData.reminder === '' || updateData.reminder === null) {
      delete updateData.reminder;
    }
    
    // Get the current task to check if status is changing
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if status is changing and track it in history
    if (updateData.status && updateData.status !== currentTask.status) {
      const statusHistoryEntry = {
        fromStatus: currentTask.status,
        toStatus: updateData.status,
        note: updateData.statusChangeNote || updateData.completionReason || updateData.overdueReason || '',
        changedBy: updateData.assignedBy || 'System', // Use assignedBy as the user making the change
        changedAt: new Date()
      };
      
      // Initialize statusHistory if it doesn't exist
      if (!updateData.statusHistory) {
        updateData.statusHistory = currentTask.statusHistory || [];
      }
      
      // Add new entry to status history
      updateData.statusHistory.push(statusHistoryEntry);
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message, details: error.errors });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
