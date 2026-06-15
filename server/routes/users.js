const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const { ROLES, BORROW_STATUS } = require('../constants');

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

router.put(
  '/:id/weight-limit',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { weightLimit } = req.body;
    if (weightLimit == null || isNaN(weightLimit) || Number(weightLimit) < 0) {
      throw new ApiError(400, 'weightLimit ไม่ถูกต้อง');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { weightLimit: Number(weightLimit) },
      { new: true, select: '-password' }
    );
    if (!user) {
      throw new ApiError(404, 'ไม่พบผู้ใช้');
    }
    res.json(user);
  })
);

router.get(
  '/me/weight',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id, 'weightLimit');
    const activeBorrows = await BorrowRecord.find({
      borrower: req.user._id,
      status: BORROW_STATUS.APPROVED,
    }).populate('item', 'weight');
    const currentWeight = activeBorrows.reduce((sum, b) => sum + (b.item?.weight || 0), 0);
    res.json({ weightLimit: user.weightLimit, currentWeight });
  })
);

module.exports = router;
