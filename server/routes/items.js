const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { upload, getPublicUrl } = require('../config/upload');
const Item = require('../models/Item');
const { ITEM_STATUS } = require('../constants');

const router = express.Router();

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter = { isDeleted: false };
    if (req.query.status) {
      filter.status = req.query.status;
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
    const { name, description, category } = req.body;
    if (!name) {
      throw new ApiError(400, 'กรุณาระบุชื่อของ');
    }

    const item = await Item.create({
      name,
      description,
      category,
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
    const { name, description, category, status } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, category, status },
      { new: true, runValidators: true }
    );
    if (!item) {
      throw new ApiError(404, 'ไม่พบรายการ');
    }
    res.json(item);
  })
);

router.delete(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) {
      throw new ApiError(404, 'ไม่พบรายการ');
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
    const item = await Item.findOne({ qrCode: req.params.qrCode, isDeleted: false })
      .populate('currentBorrow');
    if (!item) {
      throw new ApiError(404, 'ไม่พบของชิ้นนี้ในระบบ');
    }
    res.json(item);
  })
);

router.post(
  '/:id/image',
  auth,
  adminOnly,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'กรุณาเลือกไฟล์รูปภาพ');
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { imageUrl: getPublicUrl(req.file) },
      { new: true }
    );
    if (!item) {
      throw new ApiError(404, 'ไม่พบรายการ');
    }
    res.json(item);
  })
);

router.get(
  '/:id/qr',
  auth,
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) {
      throw new ApiError(404, 'ไม่พบรายการ');
    }
    const png = await QRCode.toBuffer(item.qrCode, { type: 'png', width: 300 });
    res.set('Content-Type', 'image/png');
    res.send(png);
  })
);

module.exports = router;
