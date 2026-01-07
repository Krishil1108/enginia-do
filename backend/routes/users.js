const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const { requestingUser } = req.query;
    let filter = { isActive: true };
    
    if (requestingUser) {
      // Check if requesting user is demo user
      const user = await User.findOne({ username: requestingUser });
      if (user && user.isDemo) {
        filter.isDemo = true; // Demo users only see other demo users
      } else {
        filter.isDemo = { $ne: true }; // Regular users don't see demo users
      }
    }
    
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, isActive: true });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register/Create user (Admin only in production)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, role, department } = req.body;
    
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      password: hashedPassword,
      name,
      email,
      role: role || 'Employee',
      department: department || '',
      isActive: true
    });
    
    const newUser = await user.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save FCM token for push notifications
router.post('/fcm-token', async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;
    
    if (!userId || !fcmToken) {
      return res.status(400).json({ 
        message: 'userId and fcmToken are required' 
      });
    }
    
    // Find user by either _id or username
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findOne({ username: userId });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update FCM token
    user.fcmToken = fcmToken;
    await user.save();
    
    console.log(`✅ FCM token saved for user: ${user.username}`);
    
    res.json({ 
      message: 'FCM token saved successfully',
      success: true 
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
