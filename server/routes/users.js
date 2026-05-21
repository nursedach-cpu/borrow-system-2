const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');
const { ROLES } = require('../constants');

const router = express.Router();

router.get(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  })
);

router.put(
  '/:id/role',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      throw new ApiError(400, 'role ไม่ถูกต้อง');
    }

    if (req.params.id === req.user._id.toString()) {
      throw new ApiError(400, 'ไม่สามารถเปลี่ยนสิทธิ์ตัวเองได้');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) {
      throw new ApiError(404, 'ไม่พบผู้ใช้');
    }

    res.json(user);
  })
);

module.exports = router;
