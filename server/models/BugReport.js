const mongoose = require('mongoose');

// User-submitted bug / suggestion reports.
// Lifecycle: open → in_progress → resolved → closed
//                  ↘ won't_fix
const bugReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ['ui', 'functionality', 'performance', 'data', 'suggestion', 'other'],
      default: 'other',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'wont_fix'],
      default: 'open',
    },

    // Context captured at submission time — helps admin reproduce the bug.
    pageUrl: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    screenshotUrl: { type: String },

    // Admin response
    adminNote: { type: String, trim: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

bugReportSchema.index({ reporter: 1, createdAt: -1 });
bugReportSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('BugReport', bugReportSchema);
