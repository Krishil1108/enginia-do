const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { username } = req.query;
    let filter = {};
    
    if (username) {
      // Check if user is demo user
      const User = require('../models/User');
      const user = await User.findOne({ username });
      if (user && user.isDemo) {
        filter.isDemo = true; // Demo users only see demo projects
      } else {
        filter.isDemo = { $ne: true }; // Regular users don't see demo projects
      }
    }
    
    const projects = await Project.find(filter).sort({ name: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, notes, username } = req.body;
    
    // Check if project already exists
    const existingProject = await Project.findOne({ name: name.trim() });
    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists' });
    }

    const projectData = { 
      name: name.trim(),
      notes: notes ? notes.trim() : ''
    };

    if (notes && notes.trim() !== '') {
      projectData.notesHistory = [{
        note: notes.trim(),
        addedBy: username || 'System',
        addedAt: new Date()
      }];
    }
    
    // Check if the user creating the project is a demo user
    if (username) {
      const User = require('../models/User');
      const user = await User.findOne({ username });
      if (user && user.isDemo) {
        projectData.isDemo = true; // Mark project as demo if created by demo user
      }
    }

    const project = new Project(projectData);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a project (name & notes)
router.put('/:id', async (req, res) => {
  try {
    const { name, notes, username } = req.body;
    
    // Check if new name already exists (excluding current project)
    if (name) {
      const existingProject = await Project.findOne({ 
        name: name.trim(), 
        _id: { $ne: req.params.id } 
      });
      
      if (existingProject) {
        return res.status(400).json({ message: 'Project with this name already exists' });
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (notes !== undefined) updateFields.notes = notes.trim();

    const currentProject = await Project.findById(req.params.id);
    if (!currentProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (notes !== undefined && notes.trim() !== currentProject.notes) {
      updateFields.notesHistory = currentProject.notesHistory || [];
      updateFields.notesHistory.push({
        note: notes.trim(),
        addedBy: username || 'System',
        addedAt: new Date()
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a note to a project
router.post('/:id/notes', async (req, res) => {
  try {
    const { note, addedBy } = req.body;
    if (!note || note.trim() === '') {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.notes = note.trim();
    if (!project.notesHistory) {
      project.notesHistory = [];
    }
    project.notesHistory.push({
      note: note.trim(),
      addedBy: addedBy || 'User',
      addedAt: new Date()
    });

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
