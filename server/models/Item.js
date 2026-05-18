const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, trim: true },
  qrCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'borrowed', 'maintenance'], default: 'available' },
  imageUrl: { type: String },
  currentBorrow: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
