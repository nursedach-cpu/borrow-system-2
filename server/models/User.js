const mongoose = require('mongoose');
const { WEIGHT } = require('../constants');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'borrower'], default: 'borrower' },
  department: { type: String, trim: true },
  phone: { type: String, trim: true },
  weightLimit: { type: Number, default: WEIGHT.DEFAULT_LIMIT, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
