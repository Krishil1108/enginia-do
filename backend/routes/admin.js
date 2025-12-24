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
        dashboard: permissions?.dashboard !== false,
        tasks: permissions?.tasks !== false,
        projects: permissions?.projects || false,
        users: permissions?.users || false,
        associates: permissions?.associates || false,
        notifications: permissions?.notifications !== false,
        reports: permissions?.reports || false,
        settings: permissions?.settings || false,
        analytics: permissions?.analytics || false,
        calendar: permissions?.calendar !== false
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
      .populate('customRole', 'name permissions')
      .select('-password')
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user with role
router.post('/users', checkOwnerAccess, async (req, res) => {
  try {
    const { username, password, name, email, role, customRole, department } = req.body;
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      password: hashedPassword,
      name,
      email,
      role: role || 'Employee',
      customRole: customRole || null,
      department: department || '',
      isActive: true
    });
    
    const newUser = await user.save();
    await newUser.populate('customRole', 'name permissions');
    
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

// Update user role
router.put('/users/:id', checkOwnerAccess, async (req, res) => {
  try {
    const { role, customRole, name, email, department, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
        customRole: customRole || null,
        name,
        email,
        department,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    ).populate('customRole', 'name permissions').select('-password');
    
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
      .populate('customRole', 'permissions');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let permissions = {
      dashboard: true,
      tasks: true,
      projects: user.role === 'Admin' || user.role === 'Manager',
      users: user.username === 'vaishal' || user.role === 'Admin',
      associates: user.role === 'Admin' || user.role === 'Manager',
      notifications: true,
      reports: user.role === 'Admin' || user.role === 'Manager',
      settings: user.username === 'vaishal' || user.role === 'Admin',
      analytics: user.role === 'Admin' || user.role === 'Manager',
      calendar: true
    };

    // Override with custom role permissions if exists
    if (user.customRole && user.customRole.permissions) {
      permissions = user.customRole.permissions;
    }

    res.json({ permissions, isOwner: user.username === 'vaishal' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;