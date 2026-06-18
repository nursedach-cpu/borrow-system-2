const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');
const { ROLES, DEPARTMENTS } = require('../constants');

const router = express.Router();

const VALID_DEPT_CODES = DEPARTMENTS.map((d) => d.code);

router.get(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = {};
    // Dept-scoped admin only sees users of their dept
    if (req.user.department) filter.department = req.user.department;
    if (req.query.dept) {
      filter.department = req.query.dept === 'none' ? null : req.query.dept;
    }
    const users = await User.find(filter, '-password').sort({ createdAt: -1 });
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
    if (!validRoles.includes(role)) throw new ApiError(400, 'role ไม่ถูกต้อง');

    if (req.params.id === req.user._id.toString()) {
      throw new ApiError(400, 'ไม่สามารถเปลี่ยนสิทธิ์ตัวเองได้');
    }
    // Only super admin (no department) can change roles, to avoid
    // dept admins promoting their own colleagues unchecked.
    if (req.user.department) throw new ApiError(403, 'เฉพาะ Super Admin เท่านั้นที่เปลี่ยนสิทธิ์ได้');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) throw new ApiError(404, 'ไม่พบผู้ใช้');

    res.json(user);
  })
);

// Super admin assigns a department to a user (for borrowers OR to scope an admin).
// Pass { department: null } to unset.
router.put(
  '/:id/department',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    if (req.user.department) throw new ApiError(403, 'เฉพาะ Super Admin เท่านั้น');
    const { department } = req.body;
    if (department !== null && department !== '' && !VALID_DEPT_CODES.includes(department)) {
      throw new ApiError(400, 'แผนกที่ระบุไม่ถูกต้อง');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { department: department || null },
      { new: true, select: '-password' }
    );
    if (!user) throw new ApiError(404, 'ไม่พบผู้ใช้');
    res.json(user);
  })
);

module.exports = router;
