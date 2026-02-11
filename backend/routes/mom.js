const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const MOM = require('../models/MOM');
const Task = require('../models/Task');
const textProcessingService = require('../services/textProcessingService');
const wordTemplatePdfService = require('../services/wordTemplatePdfService');

/**
 * POST /api/mom/process-text
 * Process and correct meeting notes text
 */
router.post('/process-text', async (req, res) => {
  try {
    const { text, useAI = true } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await textProcessingService.processText(text, useAI);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Text processing error:', error);
    res.status(500).json({ 
      error: 'Text processing failed',
      details: error.message 
    });
  }
});

/**
 * POST /api/mom/save
 * Save a new MOM record
 */
router.post('/save', async (req, res) => {
  try {
    const {
      taskId,
      companyName,
      visitDate,
      location,
      attendees,
      rawContent,
      processedContent,
      images,
      createdBy
    } = req.body;

    // Validation
    if (!taskId || !companyName || !visitDate || !location || !rawContent || !processedContent || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['taskId', 'companyName', 'visitDate', 'location', 'rawContent', 'processedContent', 'createdBy']
      });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Extract discussion points
    const discussionPoints = textProcessingService.extractDiscussionPoints(processedContent);

    // Create MOM
    const mom = new MOM({
      task: taskId,
      companyName,
      visitDate: new Date(visitDate),
      location,
      attendees: attendees || [],
      discussionPoints,
      rawContent,
      processedContent,
      images: images || [],
      createdBy
    });

    await mom.save();

    console.log(`✅ MOM saved: ${mom._id} for task ${taskId}`);

    res.status(201).json({
      success: true,
      mom,
      message: 'MOM saved successfully'
    });
  } catch (error) {
    console.error('❌ MOM save error:', error);
    res.status(500).json({ 
      error: 'Failed to save MOM',
      details: error.message 
    });
  }
});

/**
 * POST /api/mom/generate-docx-from-template
 * Generate Word/PDF document from template
 */
router.post('/generate-docx-from-template', async (req, res) => {
  try {
    const { momId } = req.body;

    if (!momId) {
      return res.status(400).json({ error: 'MOM ID is required' });
    }

    // Check if template exists
    if (!wordTemplatePdfService.templateExists()) {
      return res.status(400).json({ 
        error: 'Template not found',
        message: 'Please create backend/templates/mom-template.docx before generating documents'
      });
    }

    // Fetch MOM
    const mom = await MOM.findById(momId);
    if (!mom) {
      return res.status(404).json({ error: 'MOM not found' });
    }

    // Prepare data for template
    const templateData = {
      companyName: mom.companyName,
      visitDate: mom.formattedVisitDate || new Date(mom.visitDate).toLocaleDateString(),
      location: mom.location,
      attendees: mom.attendees,
      rawContent: mom.rawContent,
      processedContent: mom.processedContent,
      images: mom.images
    };

    // Generate documents
    const timestamp = Date.now();
    const fileName = `MOM_${mom.companyName.replace(/\s+/g, '_')}_${timestamp}`;
    
    const { docPath, pdfPath } = await wordTemplatePdfService.generateDocuments(templateData, fileName);

    // Update MOM with file paths
    mom.generatedDocPath = docPath;
    if (pdfPath) {
      mom.generatedPdfPath = pdfPath;
    }
    await mom.save();

    // Send the docx file as download
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({ error: 'Generated document file not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(docPath);
    fileStream.pipe(res);
    
    // Clean up temp file after sending (optional)
    fileStream.on('end', () => {
      fs.unlinkSync(docPath);
      if (pdfPath && fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    });
  } catch (error) {
    console.error('❌ Document generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate documents',
      details: error.message 
    });
  }
});

/**
 * GET /api/mom/history/:taskId
 * Get all MOMs for a specific task
 */
router.get('/history/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const moms = await MOM.find({ task: taskId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: moms.length,
      moms
    });
  } catch (error) {
    console.error('❌ MOM history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch MOM history',
      details: error.message 
    });
  }
});

/**
 * GET /api/mom/tasks-with-moms
 * Get all tasks that have MOMs
 */
router.get('/tasks-with-moms', async (req, res) => {
  try {
    // Get unique task IDs from MOMs
    const taskIds = await MOM.distinct('task');

    // Fetch task details
    const tasks = await Task.find({ _id: { $in: taskIds } })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });

    // Get MOM count for each task
    const tasksWithCounts = await Promise.all(
      tasks.map(async (task) => {
        const momCount = await MOM.countDocuments({ task: task._id });
        return {
          ...task.toObject(),
          momCount
        };
      })
    );

    res.json({
      success: true,
      count: tasksWithCounts.length,
      tasks: tasksWithCounts
    });
  } catch (error) {
    console.error('❌ Tasks with MOMs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      details: error.message 
    });
  }
});

/**
 * GET /api/mom/view/:momId
 * Get a specific MOM by ID
 */
router.get('/view/:momId', async (req, res) => {
  try {
    const { momId } = req.params;

    const mom = await MOM.findById(momId)
      .populate('task', 'title description')
      .populate('createdBy', 'name email');

    if (!mom) {
      return res.status(404).json({ error: 'MOM not found' });
    }

    res.json({
      success: true,
      mom
    });
  } catch (error) {
    console.error('❌ MOM view error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch MOM',
      details: error.message 
    });
  }
});

/**
 * POST /api/mom/regenerate-docx-from-template/:momId
 * Regenerate documents for an existing MOM
 */
router.post('/regenerate-docx-from-template/:momId', async (req, res) => {
  try {
    const { momId } = req.params;

    // Check if template exists
    if (!wordTemplatePdfService.templateExists()) {
      return res.status(400).json({ 
        error: 'Template not found',
        message: 'Please create backend/templates/mom-template.docx before generating documents'
      });
    }

    // Fetch MOM
    const mom = await MOM.findById(momId);
    if (!mom) {
      return res.status(404).json({ error: 'MOM not found' });
    }

    // Clean up old files if they exist
    const oldFiles = [mom.generatedDocPath, mom.generatedPdfPath].filter(Boolean);
    if (oldFiles.length > 0) {
      wordTemplatePdfService.cleanupFiles(oldFiles);
    }

    // Prepare data for template
    const templateData = {
      companyName: mom.companyName,
      visitDate: mom.formattedVisitDate || new Date(mom.visitDate).toLocaleDateString(),
      location: mom.location,
      attendees: mom.attendees,
      rawContent: mom.rawContent,
      processedContent: mom.processedContent,
      images: mom.images
    };

    // Generate new documents
    const timestamp = Date.now();
    const fileName = `MOM_${mom.companyName.replace(/\s+/g, '_')}_${timestamp}`;
    
    const { docPath, pdfPath } = await wordTemplatePdfService.generateDocuments(templateData, fileName);

    // Update MOM with new file paths
    mom.generatedDocPath = docPath;
    if (pdfPath) {
      mom.generatedPdfPath = pdfPath;
    }
    await mom.save();

    res.json({
      success: true,
      docPath,
      pdfPath,
      message: 'Documents regenerated successfully'
    });
  } catch (error) {
    console.error('❌ Document regeneration error:', error);
    res.status(500).json({ 
      error: 'Failed to regenerate documents',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/mom/:momId
 * Delete a MOM and its associated files
 */
router.delete('/:momId', async (req, res) => {
  try {
    const { momId } = req.params;

    const mom = await MOM.findById(momId);
    if (!mom) {
      return res.status(404).json({ error: 'MOM not found' });
    }

    // Clean up generated files
    const files = [mom.generatedDocPath, mom.generatedPdfPath].filter(Boolean);
    if (files.length > 0) {
      wordTemplatePdfService.cleanupFiles(files);
    }

    // Delete MOM
    await MOM.findByIdAndDelete(momId);

    console.log(`✅ MOM deleted: ${momId}`);

    res.json({
      success: true,
      message: 'MOM deleted successfully'
    });
  } catch (error) {
    console.error('❌ MOM deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete MOM',
      details: error.message 
    });
  }
});

/**
 * GET /api/mom/test
 * Test endpoint to verify MOM routes are working
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'MOM API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      processText: 'POST /api/mom/process-text',
      save: 'POST /api/mom/save',
      generateDoc: 'POST /api/mom/generate-docx-from-template',
      history: 'GET /api/mom/history/:taskId',
      tasksWithMOMs: 'GET /api/mom/tasks-with-moms',
      view: 'GET /api/mom/view/:momId',
      regenerate: 'POST /api/mom/regenerate-docx-from-template/:momId',
      delete: 'DELETE /api/mom/:momId'
    },
    templateExists: wordTemplatePdfService.templateExists()
  });
});

module.exports = router;
