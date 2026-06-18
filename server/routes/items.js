const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { upload, getPublicUrl } = require('../config/upload');
const Item = require('../models/Item');
const { ITEM_STATUS, DEPARTMENTS } = require('../constants');

const router = express.Router();

const VALID_DEPT_CODES = DEPARTMENTS.map((d) => d.code);

// Build the department filter applied to Item queries:
//  - Super admin (no managed dept): see all
//  - Department admin: only items where ownerDepartment matches their dept + shared (null) items
//  - Borrower: see all (cross-department borrowing is free)
function deptFilter(user) {
  if (user.role === 'admin' && user.department) {
    return { $or: [{ ownerDepartment: user.department }, { ownerDepartment: null }] };
  }
  return {};
}

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter = { isDeleted: false, ...deptFilter(req.user) };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dept) {
      // explicit dept filter from UI
      filter.ownerDepartment = req.query.dept === 'general' ? null : req.query.dept;
    }
    const items = await Item.find(filter)
      .populate({ path: 'currentBorrow', populate: { path: 'borrower', select: 'name email department' } })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(items);
  })
);

router.post(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { name, description, category, ownerDepartment } = req.body;
    if (!name) throw new ApiError(400, 'กรุณาระบุชื่อของ');
    if (ownerDepartment && !VALID_DEPT_CODES.includes(ownerDepartment)) {
      throw new ApiError(400, 'แผนกที่ระบุไม่ถูกต้อง');
    }
    // Department admins can only create items for their own department
    if (req.user.department && ownerDepartment && ownerDepartment !== req.user.department) {
      throw new ApiError(403, 'คุณเพิ่มอุปกรณ์ได้เฉพาะแผนกของคุณ');
    }
    const finalOwnerDept = req.user.department && !ownerDepartment ? req.user.department : (ownerDepartment || null);

    const item = await Item.create({
      name,
      description,
      category,
      ownerDepartment: finalOwnerDept,
      qrCode: uuidv4(),
      createdBy: req.user._id,
    });
    res.status(201).json(item);
  })
);

router.put(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { name, description, category, status, ownerDepartment } = req.body;
    if (ownerDepartment !== undefined && ownerDepartment !== null && !VALID_DEPT_CODES.includes(ownerDepartment)) {
      throw new ApiError(400, 'แผนกที่ระบุไม่ถูกต้อง');
    }
    const update = { name, description, category, status };
    if (ownerDepartment !== undefined) update.ownerDepartment = ownerDepartment || null;

    const existing = await Item.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'ไม่พบรายการ');
    // Dept admin can only edit items that belong to them or shared items
    if (req.user.department && existing.ownerDepartment && existing.ownerDepartment !== req.user.department) {
      throw new ApiError(403, 'คุณแก้ไขได้เฉพาะอุปกรณ์ของแผนกคุณ');
    }

    const item = await Item.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.json(item);
  })
);

router.delete(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) throw new ApiError(404, 'ไม่พบรายการ');
    if (req.user.department && item.ownerDepartment && item.ownerDepartment !== req.user.department) {
      throw new ApiError(403, 'คุณลบได้เฉพาะอุปกรณ์ของแผนกคุณ');
    }
    if (item.status === ITEM_STATUS.BORROWED) {
      throw new ApiError(400, 'ไม่สามารถลบของที่ถูกยืมอยู่ กรุณารับคืนก่อน');
    }
    item.isDeleted = true;
    await item.save();
    res.json({ message: 'ลบเรียบร้อย' });
  })
);

router.get(
  '/qr/:qrCode',
  auth,
  asyncHandler(async (req, res) => {
    const item = await Item.findOne({ qrCode: req.params.qrCode, isDeleted: false }).populate('currentBorrow');
    if (!item) throw new ApiError(404, 'ไม่พบของชิ้นนี้ในระบบ');
    res.json(item);
  })
);

router.post(
  '/:id/image',
  auth,
  adminOnly,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'กรุณาเลือกไฟล์รูปภาพ');
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { imageUrl: getPublicUrl(req.file) },
      { new: true }
    );
    if (!item) throw new ApiError(404, 'ไม่พบรายการ');
    res.json(item);
  })
);

router.get(
  '/:id/qr',
  auth,
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) throw new ApiError(404, 'ไม่พบรายการ');
    const png = await QRCode.toBuffer(item.qrCode, { type: 'png', width: 300 });
    res.set('Content-Type', 'image/png');
    res.send(png);
  })
);

// Expose the master list of departments to the client.
router.get('/_meta/departments', auth, (req, res) => {
  res.json(DEPARTMENTS);
});

module.exports = router;
