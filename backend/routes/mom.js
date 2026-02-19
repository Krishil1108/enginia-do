const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const MOM = require('../models/MOM');
const Task = require('../models/Task');
const textProcessingService = require('../services/textProcessingService');
const wordTemplatePdfService = require('../services/wordTemplatePdfService');

const normalizeAttendees = (attendees = []) =>
  attendees
    .map((attendee) => (typeof attendee === 'string' ? { name: attendee } : attendee))
    .filter((attendee) => attendee && attendee.name);

const normalizeImages = (images = []) =>
  images
    .map((image) => (typeof image === 'string' ? { data: image } : image))
    .filter((image) => image && image.data);

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
    console.log('📝 Received MOM save request');
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

    console.log('📊 Payload validation:', {
      taskId: !!taskId,
      companyName: !!companyName,
      visitDate: !!visitDate,
      location: !!location,
      rawContent: !!rawContent,
      processedContent: !!processedContent,
      createdBy: !!createdBy,
      attendeesCount: attendees?.length || 0,
      imagesCount: images?.length || 0
    });

    // Validation
    if (!taskId || !companyName || !visitDate || !location || !rawContent || !processedContent || !createdBy) {
      console.error('❌ Missing required fields:', {
        taskId: !taskId,
        companyName: !companyName,
        visitDate: !visitDate,
        location: !location,
        rawContent: !rawContent,
        processedContent: !processedContent,
        createdBy: !createdBy
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['taskId', 'companyName', 'visitDate', 'location', 'rawContent', 'processedContent', 'createdBy']
      });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      console.error('❌ Task not found:', taskId);
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log('✅ Task found:', task.title);

    // Parse visit date - handle various formats
    let parsedDate;
    try {
      // Try ISO format first (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
        parsedDate = new Date(visitDate + 'T00:00:00.000Z');
      } 
      // Try DD/MM/YYYY format
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(visitDate)) {
        const [day, month, year] = visitDate.split('/');
        parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`);
      }
      // Fallback to Date parsing
      else {
        parsedDate = new Date(visitDate);
      }
      
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      console.log(`📅 Parsed visit date: ${visitDate} -> ${parsedDate.toISOString()}`);
    } catch (dateError) {
      console.error('❌ Date parsing error:', dateError);
      return res.status(400).json({ 
        error: 'Invalid date format',
        details: `Could not parse date: ${visitDate}`
      });
    }

    // Extract discussion points
    const discussionPoints = textProcessingService.extractDiscussionPoints(processedContent);
    console.log(`📋 Extracted ${discussionPoints.length} discussion points`);

    const normalizedAttendees = normalizeAttendees(attendees);
    const normalizedImages = normalizeImages(images);

    console.log(`👥 Normalized ${normalizedAttendees.length} attendees`);
    console.log(`🖼️  Normalized ${normalizedImages.length} images`);

    // Create MOM
    const mom = new MOM({
      task: taskId,
      companyName,
      visitDate: parsedDate,
      location,
      attendees: normalizedAttendees,
      discussionPoints,
      rawContent,
      processedContent,
      images: normalizedImages,
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
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to save MOM',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/mom/generate-docx-from-template
 * Generate Word/PDF document from template
 */
router.post('/generate-docx-from-template', async (req, res) => {
  try {
    console.log('📄 Received document generation request');
    const { momId } = req.body;

    if (!momId) {
      console.error('❌ MOM ID missing in request');
      return res.status(400).json({ error: 'MOM ID is required' });
    }

    console.log('📄 Generating document for MOM:', momId);

    // Check if template exists
    if (!wordTemplatePdfService.templateExists()) {
      console.error('❌ Template not found');
      return res.status(400).json({ 
        error: 'Template not found',
        message: 'Please create backend/templates/mom-template.docx before generating documents'
      });
    }

    console.log('✅ Template found');

    // Fetch MOM with task populated
    const mom = await MOM.findById(momId).populate('task', 'title');
    if (!mom) {
      console.error('❌ MOM not found:', momId);
      return res.status(404).json({ error: 'MOM not found' });
    }

    console.log('✅ MOM found:', mom.companyName);

    // Prepare data for template
    const templateData = {
      meetingTitle: mom.task?.title || mom.companyName, // {meetingTitle}
      meetingDate: mom.formattedVisitDate || new Date(mom.visitDate).toLocaleDateString(), // {meetingDate}
      meetingLocation: mom.location, // {meetingLocation}
      documentTitle: 'Minutes of Meeting', // {documentTitle}
      attendees: mom.attendees, // {#attendees}{name}{/attendees}
      rawContent: mom.rawContent,
      processedContent: mom.processedContent,
      images: mom.images,
      // Legacy fields for backward compatibility
      projectName: mom.task?.title || mom.companyName,
      companyName: mom.companyName,
      dateOfVisit: mom.formattedVisitDate || new Date(mom.visitDate).toLocaleDateString(),
      visitDate: mom.formattedVisitDate || new Date(mom.visitDate).toLocaleDateString(),
      siteLocation: mom.location,
      location: mom.location
    };

    console.log('📋 Template data prepared with', mom.attendees.length, 'attendees and', mom.images.length, 'images');

    // Generate documents
    const timestamp = Date.now();
    const fileName = `MOM_${mom.companyName.replace(/\s+/g, '_')}_${timestamp}`;
    
    console.log('🔨 Generating document:', fileName);
    const { docPath, pdfPath } = await wordTemplatePdfService.generateDocuments(templateData, fileName);

    console.log('✅ Document generated:', docPath);

    // Update MOM with file paths
    mom.generatedDocPath = docPath;
    if (pdfPath) {
      mom.generatedPdfPath = pdfPath;
    }
    await mom.save();

    // Send the docx file as download
    if (!fs.existsSync(docPath)) {
      console.error('❌ Generated document file not found:', docPath);
      return res.status(404).json({ error: 'Generated document file not found' });
    }

    console.log('📤 Sending document to client');

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(docPath);
    fileStream.pipe(res);
    
    // Clean up temp file after sending (optional)
    fileStream.on('end', () => {
      console.log('🗑️  Cleaning up temp files');
      fs.unlinkSync(docPath);
      if (pdfPath && fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    });

    fileStream.on('error', (streamError) => {
      console.error('❌ File stream error:', streamError);
    });
  } catch (error) {
    console.error('❌ Document generation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate documents',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
