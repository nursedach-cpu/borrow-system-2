const mongoose = require('mongoose');

// Unified Reservation model — covers all three reservation types:
//   • queue:     "I want to borrow this item when the current borrower returns it"
//   • extension: "I want to extend my current borrowing period"
//   • schedule:  "I want to reserve this item for a specific date range in the future"
//
// Status flow:
//   pending → approved → fulfilled   (happy path)
//   pending → rejected               (admin denial)
//   pending → cancelled              (user cancellation)
//   approved → cancelled             (user changed mind after approval)
//   approved → expired               (date passed without fulfilment)
const reservationSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['queue', 'extension', 'schedule'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'fulfilled', 'expired'],
      default: 'pending',
    },

    // Used by 'schedule': the requested borrow window.
    startDate: { type: Date },
    endDate: { type: Date },

    // Used by 'extension': link to the BorrowRecord being extended + new dueDate.
    relatedBorrow: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord' },
    newDueDate: { type: Date },

    note: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Helpful indexes for the queries the routes actually run.
reservationSchema.index({ item: 1, type: 1, status: 1, createdAt: 1 });
reservationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
