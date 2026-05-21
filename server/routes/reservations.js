const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const Reservation = require('../models/Reservation');
const Item = require('../models/Item');
const BorrowRecord = require('../models/BorrowRecord');
const {
  ROLES,
  ITEM_STATUS,
  BORROW_STATUS,
  RESERVATION_TYPE,
  RESERVATION_STATUS,
} = require('../constants');

const router = express.Router();

// --- Helpers ---

function parseDate(value, fieldName) {
  if (!value) throw new ApiError(400, `กรุณาระบุ ${fieldName}`);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new ApiError(400, `${fieldName} ไม่ถูกต้อง`);
  return d;
}

// Detect overlap between [aStart, aEnd] and [bStart, bEnd]
function dateRangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// --- POST /api/reservations/queue ---
// Reserve a spot in line to borrow an item that's currently borrowed.
router.post(
  '/queue',
  auth,
  asyncHandler(async (req, res) => {
    const { itemId, note } = req.body;
    if (!itemId) throw new ApiError(400, 'กรุณาระบุ itemId');

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted) throw new ApiError(404, 'ไม่พบรายการ');
    if (item.status === ITEM_STATUS.AVAILABLE) {
      throw new ApiError(400, 'ของชิ้นนี้ว่างอยู่ ยืมได้เลย ไม่ต้องจองคิว');
    }

    // Prevent the same user from queueing the same item twice.
    const existing = await Reservation.findOne({
      item: itemId,
      user: req.user._id,
      type: RESERVATION_TYPE.QUEUE,
      status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED] },
    });
    if (existing) throw new ApiError(400, 'คุณจองคิวรายการนี้ไว้แล้ว');

    const reservation = await Reservation.create({
      item: itemId,
      user: req.user._id,
      type: RESERVATION_TYPE.QUEUE,
      status: RESERVATION_STATUS.APPROVED, // queue requires no admin approval; FIFO
      note,
    });

    res.status(201).json(reservation);
  })
);

// --- POST /api/reservations/extension ---
// Borrower asks admin to extend their current borrow's dueDate.
router.post(
  '/extension',
  auth,
  asyncHandler(async (req, res) => {
    const { borrowRecordId, newDueDate, note } = req.body;
    if (!borrowRecordId) throw new ApiError(400, 'กรุณาระบุ borrowRecordId');
    const due = parseDate(newDueDate, 'วันที่กำหนดคืนใหม่');

    const record = await BorrowRecord.findById(borrowRecordId);
    if (!record) throw new ApiError(404, 'ไม่พบรายการยืม');
    if (record.borrower.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'คุณไม่ใช่ผู้ยืมรายการนี้');
    }
    if (record.status !== BORROW_STATUS.APPROVED) {
      throw new ApiError(400, 'ขอขยายเวลาได้เฉพาะรายการที่ยืมอยู่');
    }
    if (record.dueDate && due <= record.dueDate) {
      throw new ApiError(400, 'วันคืนใหม่ต้องอยู่หลังวันคืนเดิม');
    }

    // Prevent duplicate pending extension requests on the same borrow.
    const existing = await Reservation.findOne({
      relatedBorrow: borrowRecordId,
      type: RESERVATION_TYPE.EXTENSION,
      status: RESERVATION_STATUS.PENDING,
    });
    if (existing) throw new ApiError(400, 'คุณมีคำขอขยายเวลารายการนี้รออนุมัติอยู่');

    const reservation = await Reservation.create({
      item: record.item,
      user: req.user._id,
      type: RESERVATION_TYPE.EXTENSION,
      status: RESERVATION_STATUS.PENDING,
      relatedBorrow: borrowRecordId,
      newDueDate: due,
      note,
    });

    res.status(201).json(reservation);
  })
);

// --- POST /api/reservations/schedule ---
// Reserve an item for a specific future date range.
router.post(
  '/schedule',
  auth,
  asyncHandler(async (req, res) => {
    const { itemId, startDate, endDate, note } = req.body;
    if (!itemId) throw new ApiError(400, 'กรุณาระบุ itemId');
    const start = parseDate(startDate, 'วันที่เริ่ม');
    const end = parseDate(endDate, 'วันที่สิ้นสุด');

    if (start >= end) throw new ApiError(400, 'วันที่สิ้นสุดต้องอยู่หลังวันที่เริ่ม');
    if (start < new Date(Date.now() - 60 * 1000)) {
      throw new ApiError(400, 'วันที่เริ่มต้องเป็นอนาคต');
    }

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted) throw new ApiError(404, 'ไม่พบรายการ');

    // Check conflict with other approved/pending schedule reservations.
    const conflicts = await Reservation.find({
      item: itemId,
      type: RESERVATION_TYPE.SCHEDULE,
      status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED] },
    });
    const overlap = conflicts.find((r) =>
      dateRangesOverlap(start, end, r.startDate, r.endDate)
    );
    if (overlap) {
      throw new ApiError(400, 'ช่วงเวลานี้มีคนจองแล้ว กรุณาเลือกช่วงอื่น');
    }

    const reservation = await Reservation.create({
      item: itemId,
      user: req.user._id,
      type: RESERVATION_TYPE.SCHEDULE,
      status: RESERVATION_STATUS.PENDING,
      startDate: start,
      endDate: end,
      note,
    });

    res.status(201).json(reservation);
  })
);

// --- GET /api/reservations/my ---
// Logged-in user's reservations across all types.
router.get(
  '/my',
  auth,
  asyncHandler(async (req, res) => {
    const records = await Reservation.find({ user: req.user._id })
      .populate('item', 'name qrCode status imageUrl')
      .populate('relatedBorrow', 'dueDate status')
      .sort({ createdAt: -1 });

    // For queue items, attach position (1-based) so the UI can show "คุณเป็นคิวที่ N".
    const result = await Promise.all(
      records.map(async (r) => {
        const obj = r.toObject();
        if (r.type === RESERVATION_TYPE.QUEUE && r.status === RESERVATION_STATUS.APPROVED) {
          const ahead = await Reservation.countDocuments({
            item: r.item._id,
            type: RESERVATION_TYPE.QUEUE,
            status: RESERVATION_STATUS.APPROVED,
            createdAt: { $lt: r.createdAt },
          });
          obj.queuePosition = ahead + 1;
        }
        return obj;
      })
    );

    res.json(result);
  })
);

// --- GET /api/reservations ---  (admin: list all, with filters)
router.get(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.itemId) filter.item = req.query.itemId;

    const records = await Reservation.find(filter)
      .populate('item', 'name qrCode status imageUrl')
      .populate('user', 'name email department')
      .populate('relatedBorrow', 'dueDate status')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(records);
  })
);

// --- DELETE /api/reservations/:id ---
// Cancel own reservation (admin can cancel any).
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) throw new ApiError(404, 'ไม่พบการจอง');

    const isOwner = reservation.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== ROLES.ADMIN) {
      throw new ApiError(403, 'ไม่มีสิทธิ์');
    }

    if (
      ![RESERVATION_STATUS.PENDING, RESERVATION_STATUS.APPROVED].includes(reservation.status)
    ) {
      throw new ApiError(400, 'การจองนี้ไม่สามารถยกเลิกได้แล้ว');
    }

    reservation.status = RESERVATION_STATUS.CANCELLED;
    await reservation.save();
    res.json(reservation);
  })
);

// --- PUT /api/reservations/:id/approve ---  (admin)
// For extension: applies newDueDate to the BorrowRecord.
// For schedule: marks reservation approved (will be acted on when startDate arrives).
// For queue: queue is auto-approved on creation; this endpoint is a no-op for queue.
router.put(
  '/:id/approve',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) throw new ApiError(404, 'ไม่พบการจอง');
    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new ApiError(400, 'การจองนี้ไม่ได้อยู่ในสถานะรออนุมัติ');
    }

    if (reservation.type === RESERVATION_TYPE.EXTENSION) {
      // Apply the extension immediately by updating BorrowRecord.dueDate.
      const record = await BorrowRecord.findById(reservation.relatedBorrow);
      if (!record || record.status !== BORROW_STATUS.APPROVED) {
        throw new ApiError(400, 'รายการยืมไม่ได้อยู่ในสถานะใช้งานได้');
      }
      record.dueDate = reservation.newDueDate;
      await record.save();
      reservation.status = RESERVATION_STATUS.FULFILLED;
    } else {
      reservation.status = RESERVATION_STATUS.APPROVED;
    }

    reservation.approvedBy = req.user._id;
    await reservation.save();
    res.json(reservation);
  })
);

// --- PUT /api/reservations/:id/reject ---  (admin)
router.put(
  '/:id/reject',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) throw new ApiError(404, 'ไม่พบการจอง');
    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new ApiError(400, 'การจองนี้ไม่ได้อยู่ในสถานะรออนุมัติ');
    }

    reservation.status = RESERVATION_STATUS.REJECTED;
    reservation.rejectedReason = req.body.reason || '';
    reservation.approvedBy = req.user._id;
    await reservation.save();
    res.json(reservation);
  })
);

// --- GET /api/reservations/item/:itemId/queue --- public-ish (auth required)
// Show queue length for an item — used by Scanner page to display "มี N คนรอ".
router.get(
  '/item/:itemId/queue',
  auth,
  asyncHandler(async (req, res) => {
    const count = await Reservation.countDocuments({
      item: req.params.itemId,
      type: RESERVATION_TYPE.QUEUE,
      status: RESERVATION_STATUS.APPROVED,
    });
    res.json({ count });
  })
);

module.exports = router;
