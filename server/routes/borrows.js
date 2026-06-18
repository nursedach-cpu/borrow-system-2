const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { upload, getPublicUrl } = require('../config/upload');
const BorrowRecord = require('../models/BorrowRecord');
const Item = require('../models/Item');
const Reservation = require('../models/Reservation');
const {
  ROLES,
  ITEM_STATUS,
  BORROW_STATUS,
  RESERVATION_TYPE,
  RESERVATION_STATUS,
} = require('../constants');

const router = express.Router();

// Dept-scoped admins may only act on records of items they own (or shared items).
// Returns the record once authorized, otherwise throws.
async function loadAuthorizedRecord(id, user) {
  const record = await BorrowRecord.findById(id).populate('item', 'ownerDepartment');
  if (!record) return null;
  if (user.department && record.item) {
    const itemDept = record.item.ownerDepartment;
    if (itemDept && itemDept !== user.department) {
      throw new ApiError(403, 'คุณจัดการได้เฉพาะคำขอของแผนกคุณ');
    }
  }
  return record;
}

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { itemId, dueDate, note } = req.body;

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted) {
      throw new ApiError(404, 'ไม่พบรายการ');
    }
    if (item.status !== ITEM_STATUS.AVAILABLE) {
      throw new ApiError(400, 'ของชิ้นนี้ไม่ว่าง');
    }

    const existing = await BorrowRecord.findOne({
      item: itemId,
      borrower: req.user._id,
      status: BORROW_STATUS.PENDING,
    });
    if (existing) {
      throw new ApiError(400, 'คุณมีคำขอยืมรายการนี้รออนุมัติอยู่แล้ว');
    }

    const record = await BorrowRecord.create({
      item: itemId,
      borrower: req.user._id,
      dueDate: dueDate || undefined,
      note,
    });

    res.status(201).json(record);
  })
);

router.get(
  '/my',
  auth,
  asyncHandler(async (req, res) => {
    const records = await BorrowRecord.find({ borrower: req.user._id })
      .populate('item', 'name qrCode status imageUrl')
      .sort({ createdAt: -1 });
    res.json(records);
  })
);

router.get(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    // Dept-scoped admin only sees borrows of items owned by their dept
    // (we include shared / no-department items too, since they touch everyone).
    if (req.user.department) {
      const Item = require('../models/Item');
      const scopedItemIds = await Item.find({
        $or: [{ ownerDepartment: req.user.department }, { ownerDepartment: null }],
      }).distinct('_id');
      filter.item = { $in: scopedItemIds };
    }

    const records = await BorrowRecord.find(filter)
      .populate('item', 'name qrCode status imageUrl ownerDepartment')
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(records);
  })
);

router.put(
  '/:id/approve',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const record = await loadAuthorizedRecord(req.params.id, req.user);
    if (!record || record.status !== BORROW_STATUS.PENDING) {
      throw new ApiError(400, 'ไม่พบคำขอ หรือคำขอไม่ได้อยู่ในสถานะรออนุมัติ');
    }

    record.status = BORROW_STATUS.APPROVED;
    record.borrowDate = new Date();
    record.approvedBy = req.user._id;
    if (req.body.dueDate) {
      record.dueDate = new Date(req.body.dueDate);
    }
    await record.save();

    // record.item is populated (loadAuthorizedRecord); use its _id explicitly.
    const itemId = record.item._id || record.item;
    await Item.findByIdAndUpdate(itemId, {
      status: ITEM_STATUS.BORROWED,
      currentBorrow: record._id,
    });

    res.json(record);
  })
);

router.put(
  '/:id/reject',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const record = await loadAuthorizedRecord(req.params.id, req.user);
    if (!record || record.status !== BORROW_STATUS.PENDING) {
      throw new ApiError(400, 'ไม่พบคำขอ หรือคำขอไม่ได้อยู่ในสถานะรออนุมัติ');
    }

    record.status = BORROW_STATUS.REJECTED;
    await record.save();

    res.json(record);
  })
);

router.put(
  '/:id/return',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const record = await loadAuthorizedRecord(req.params.id, req.user);
    if (!record || record.status !== BORROW_STATUS.APPROVED) {
      throw new ApiError(400, 'ไม่พบคำขอ หรือคำขอไม่ได้อยู่ในสถานะยืมอยู่');
    }

    record.status = BORROW_STATUS.RETURNED;
    record.returnDate = new Date();
    await record.save();

    const itemId = record.item._id || record.item;
    await Item.findByIdAndUpdate(itemId, {
      status: ITEM_STATUS.AVAILABLE,
      currentBorrow: null,
    });

    // When item returns, promote the first person in the queue.
    // We mark them fulfilled so the borrower UI can show "ถึงคิวคุณแล้ว"
    // and they can then submit a normal borrow request.
    const nextInQueue = await Reservation.findOne({
      item: itemId,
      type: RESERVATION_TYPE.QUEUE,
      status: RESERVATION_STATUS.APPROVED,
    }).sort({ createdAt: 1 });
    if (nextInQueue) {
      nextInQueue.status = RESERVATION_STATUS.FULFILLED;
      await nextInQueue.save();
    }

    res.json(record);
  })
);

router.post(
  '/:id/borrow-image',
  auth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'กรุณาเลือกไฟล์รูปภาพ');
    }
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) throw new ApiError(404, 'ไม่พบรายการ');
    if (record.borrower.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      throw new ApiError(403, 'ไม่มีสิทธิ์');
    }
    record.borrowImage = getPublicUrl(req.file);
    await record.save();
    res.json(record);
  })
);

router.post(
  '/:id/return-image',
  auth,
  adminOnly,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'กรุณาเลือกไฟล์รูปภาพ');
    }
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) throw new ApiError(404, 'ไม่พบรายการ');
    record.returnImage = getPublicUrl(req.file);
    await record.save();
    res.json(record);
  })
);

module.exports = router;
