const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  notesHistory: [{
    note: { type: String, required: true },
    addedBy: { type: String, default: 'System' },
    addedAt: { type: Date, default: Date.now }
  }],
  isDemo: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
