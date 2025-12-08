const mongoose = require('mongoose');

const externalUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
externalUserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
externalUserSchema.index({ createdBy: 1 });
externalUserSchema.index({ name: 1, createdBy: 1 });

module.exports = mongoose.model('ExternalUser', externalUserSchema);