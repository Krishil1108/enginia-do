const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: {
    myTasks: {
      type: Boolean,
      default: true
    },
    allTasks: {
      type: Boolean,
      default: false
    },
    assignedByMe: {
      type: Boolean,
      default: false
    },
    associateTasks: {
      type: Boolean,
      default: false
    },
    externalTasks: {
      type: Boolean,
      default: false
    },
    confidentialTasks: {
      type: Boolean,
      default: false
    },
    adminReports: {
      type: Boolean,
      default: false
    },
    adminPanel: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);