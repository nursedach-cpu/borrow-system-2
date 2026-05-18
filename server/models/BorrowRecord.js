const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned'], default: 'pending' },
  borrowDate: { type: Date },
  dueDate: { type: Date },
  returnDate: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
