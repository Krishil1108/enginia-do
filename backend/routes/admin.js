const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const User = require('../models/User');

// Middleware to check if user is owner Vaishal Shah
const checkOwnerAccess = async (req, res, next) => {
  try {
    const { requestingUser } = req.query;
    if (!requestingUser) {
      return res.status(401).json({ message: 'Access denied. Owner authentication required.' });
    }

    const user = await User.findOne({ username: requestingUser });
    if (!user || user.username !== 'vaishal') {
      return res.status(403).json({ message: 'Access denied. Only owner Vaishal Shah can access this feature.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all roles
router.get('/roles', checkOwnerAccess, async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new role
router.post('/roles', checkOwnerAccess, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    const role = new Role({
      name,
      description: description || '',
      permissions: {
        myTasks: permissions?.myTasks !== false,
        allTasks: permissions?.allTasks || false,
        assignedByMe: permissions?.assignedByMe || false,
        associateTasks: permissions?.associateTasks || false,
        externalTasks: permissions?.externalTasks || false,
        confidentialTasks: permissions?.confidentialTasks || false,
        adminReports: permissions?.adminReports || false,
        adminPanel: permissions?.adminPanel || false,
        settings: permissions?.settings !== false
      }
    });

    const newRole = await role.save();
    res.status(201).json(newRole);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Role name already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update role
router.put('/roles/:id', checkOwnerAccess, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        permissions
      },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete role
router.delete('/roles/:id', checkOwnerAccess, async (req, res) => {
  try {
    // Check if any users are assigned this role
    const usersWithRole = await User.find({ customRole: req.params.id });
    if (usersWithRole.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. ${usersWithRole.length} user(s) are assigned this role.` 
      });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users with roles (for admin)
router.get('/users', checkOwnerAccess, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .populate('role', 'name permissions')
      .sort({ name: 1 });
    
    // For owner, return passwords; for others, exclude passwords
    const usersWithPasswords = users.map(user => {
      const userObj = user.toObject();
      // Owner can see all passwords
      return userObj;
    });
    
    res.json(usersWithPasswords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user with role
router.post('/users', checkOwnerAccess, async (req, res) => {
  try {
    const { username, password, name, email, role, department } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      password: hashedPassword,
      name,
      email,
      role: role,
      department: department || '',
      isActive: true
    });
    
    const newUser = await user.save();
    await newUser.populate('role', 'name permissions');
    
    const userResponse = newUser.toObject();
    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update user role
router.put('/users/:id', checkOwnerAccess, async (req, res) => {
  try {
    const { role, name, email, department, isActive, password } = req.body;
    
    const updateData = {
      role,
      name,
      email,
      department,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // If password is provided, hash it
    if (password && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('role', 'name permissions');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user permissions (for frontend to check access)
router.get('/user-permissions/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true })
      .populate('role', 'permissions');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let permissions = {
      myTasks: true,
      allTasks: false,
      assignedByMe: false,
      associateTasks: false,
      externalTasks: false,
      confidentialTasks: user.username === 'vaishal' || user.name === 'Nirali',
      adminReports: user.username === 'vaishal' || user.name === 'Nirali',
      adminPanel: user.username === 'vaishal',
      settings: true
    };

    // Use role permissions if exists
    if (user.role && user.role.permissions) {
      permissions = user.role.permissions;
      // Override owner-only permissions
      permissions.confidentialTasks = user.username === 'vaishal' || user.name === 'Nirali';
      permissions.adminReports = user.username === 'vaishal' || user.name === 'Nirali';
      permissions.adminPanel = user.username === 'vaishal';
    }

    res.json({ permissions, isOwner: user.username === 'vaishal' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;