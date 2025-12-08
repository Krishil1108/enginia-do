const express = require('express');
const router = express.Router();
const ExternalUser = require('../models/ExternalUser');

// GET /api/external-users - Get all external users for a user
router.get('/', async (req, res) => {
  try {
    const { createdBy } = req.query;
    
    if (!createdBy) {
      return res.status(400).json({ message: 'createdBy parameter is required' });
    }

    const externalUsers = await ExternalUser.find({ createdBy }).sort({ createdAt: -1 });
    res.json(externalUsers);
  } catch (error) {
    console.error('Error fetching external users:', error);
    res.status(500).json({ message: 'Error fetching external users', error: error.message });
  }
});

// POST /api/external-users - Create a new external user
router.post('/', async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Name and createdBy are required' });
    }

    // Check if external user already exists for this user
    const existingUser = await ExternalUser.findOne({ 
      name: name.trim(), 
      createdBy 
    });

    if (existingUser) {
      return res.status(409).json({ message: 'External user with this name already exists' });
    }

    const externalUser = new ExternalUser({
      name: name.trim(),
      createdBy
    });

    const savedUser = await externalUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating external user:', error);
    res.status(500).json({ message: 'Error creating external user', error: error.message });
  }
});

// PUT /api/external-users/:id - Update an external user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Name and createdBy are required' });
    }

    // Check if another external user with the same name exists (excluding current one)
    const existingUser = await ExternalUser.findOne({ 
      name: name.trim(), 
      createdBy,
      _id: { $ne: id }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'External user with this name already exists' });
    }

    const updatedUser = await ExternalUser.findByIdAndUpdate(
      id,
      { 
        name: name.trim(),
        createdBy,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'External user not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating external user:', error);
    res.status(500).json({ message: 'Error updating external user', error: error.message });
  }
});

// DELETE /api/external-users/:id - Delete an external user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await ExternalUser.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'External user not found' });
    }

    res.json({ message: 'External user deleted successfully' });
  } catch (error) {
    console.error('Error deleting external user:', error);
    res.status(500).json({ message: 'Error deleting external user', error: error.message });
  }
});

module.exports = router;