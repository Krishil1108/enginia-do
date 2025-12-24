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
    dashboard: {
      type: Boolean,
      default: true
    },
    tasks: {
      type: Boolean,
      default: true
    },
    projects: {
      type: Boolean,
      default: false
    },
    users: {
      type: Boolean,
      default: false
    },
    associates: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    reports: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    },
    calendar: {
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