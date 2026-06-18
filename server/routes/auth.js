const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const { ApiError } = require('../middleware/errorHandler');
const { ROLES, PASSWORD, DEPARTMENTS } = require('../constants');

const VALID_DEPT_CODES = DEPARTMENTS.map((d) => d.code);

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

function assertValidEmail(email) {
  // Simple but practical email check — full RFC validation is overkill.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'รูปแบบอีเมลไม่ถูกต้อง');
  }
}

function assertStrongPassword(password) {
  if (!password || password.length < PASSWORD.MIN_LENGTH) {
    throw new ApiError(400, `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD.MIN_LENGTH} ตัวอักษร`);
  }
  // Require at least one letter and one digit — prevents "12345678" type passwords.
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError(400, 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข');
  }
}

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'กรุณากรอกชื่อ อีเมล และรหัสผ่าน');
    }
    assertValidEmail(email);
    assertStrongPassword(password);

    // Department is optional (outsiders register without one), but if provided it must be valid.
    let normalizedDept = null;
    if (department && department !== '') {
      if (!VALID_DEPT_CODES.includes(department)) {
        throw new ApiError(400, 'แผนกที่ระบุไม่ถูกต้อง');
      }
      normalizedDept = department;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(400, 'อีเมลนี้ถูกใช้งานแล้ว');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: ROLES.BORROWER,
      department: normalizedDept,
      phone,
    });

    const token = generateToken(user._id);
    res.status(201).json({ user: sanitizeUser(user), token });
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'กรุณากรอกอีเมลและรหัสผ่าน');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const token = generateToken(user._id);
    res.json({ user: sanitizeUser(user), token });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

module.exports = router;
