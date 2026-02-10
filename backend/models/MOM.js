const mongoose = require('mongoose');

const momSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  attendees: [{
    name: {
      type: String,
      required: true
    }
  }],
  discussionPoints: [{
    type: String
  }],
  rawContent: {
    type: String,
    required: true
  },
  processedContent: {
    type: String,
    required: true
  },
  images: [{
    data: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 300
    }
  }],
  generatedDocPath: {
    type: String
  },
  generatedPdfPath: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
momSchema.index({ task: 1, createdAt: -1 });
momSchema.index({ companyName: 1 });
momSchema.index({ visitDate: -1 });

// Virtual for formatted visit date
momSchema.virtual('formattedVisitDate').get(function() {
  if (this.visitDate) {
    return this.visitDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return '';
});

// Ensure virtuals are included in JSON
momSchema.set('toJSON', { virtuals: true });
momSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MOM', momSchema);
