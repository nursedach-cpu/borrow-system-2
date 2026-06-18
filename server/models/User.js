const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'borrower'], default: 'borrower' },
  // For borrowers: which department they belong to (null = outsider, no department).
  // For admins: same — non-null restricts them to manage only that department's items
  //   (department-scoped admin). null = super admin (sees everything).
  department: { type: String, trim: true, default: null },
  phone: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
