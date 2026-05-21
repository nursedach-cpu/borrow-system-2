const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const Item = require('../models/Item');
const BorrowRecord = require('../models/BorrowRecord');
const Reservation = require('../models/Reservation');
const {
  ITEM_STATUS,
  BORROW_STATUS,
  RESERVATION_TYPE,
  RESERVATION_STATUS,
} = require('../constants');

const router = express.Router();

router.get(
  '/stats',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [totalItems, available, borrowed, maintenance, pendingRequests, overdueItems] =
      await Promise.all([
        Item.countDocuments({ isDeleted: false }),
        Item.countDocuments({ isDeleted: false, status: ITEM_STATUS.AVAILABLE }),
        Item.countDocuments({ isDeleted: false, status: ITEM_STATUS.BORROWED }),
        Item.countDocuments({ isDeleted: false, status: ITEM_STATUS.MAINTENANCE }),
        BorrowRecord.countDocuments({ status: BORROW_STATUS.PENDING }),
        BorrowRecord.countDocuments({
          status: BORROW_STATUS.APPROVED,
          dueDate: { $lt: new Date(), $ne: null },
        }),
      ]);

    res.json({
      totalItems,
      available,
      borrowed,
      maintenance,
      pendingRequests,
      overdueItems,
    });
  })
);

// --- GET /api/dashboard/item-stats ---
// Returns one row per item with aggregated borrow + reservation data.
// Used by admin Dashboard to show "the borrow history per item" table.
//
// Query params:
//   ?sort=most|recent|alpha  (default: most)
//   ?limit=20                (default: 50)
router.get(
  '/item-stats',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const sort = req.query.sort || 'most';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    // Aggregate borrow counts per item in a single query — far cheaper than
    // running countDocuments() per item.
    const borrowAgg = await BorrowRecord.aggregate([
      {
        $group: {
          _id: '$item',
          totalBorrows: { $sum: 1 },
          activeBorrows: {
            $sum: { $cond: [{ $eq: ['$status', BORROW_STATUS.APPROVED] }, 1, 0] },
          },
          pendingBorrows: {
            $sum: { $cond: [{ $eq: ['$status', BORROW_STATUS.PENDING] }, 1, 0] },
          },
          lastBorrowDate: { $max: '$borrowDate' },
        },
      },
    ]);
    const borrowMap = new Map(borrowAgg.map((r) => [r._id.toString(), r]));

    // Aggregate queue counts per item.
    const queueAgg = await Reservation.aggregate([
      {
        $match: {
          type: RESERVATION_TYPE.QUEUE,
          status: RESERVATION_STATUS.APPROVED,
        },
      },
      { $group: { _id: '$item', queueCount: { $sum: 1 } } },
    ]);
    const queueMap = new Map(queueAgg.map((r) => [r._id.toString(), r.queueCount]));

    // Load items with current borrower populated.
    const items = await Item.find({ isDeleted: false })
      .populate({
        path: 'currentBorrow',
        populate: { path: 'borrower', select: 'name department' },
      })
      .lean();

    const rows = items.map((item) => {
      const id = item._id.toString();
      const b = borrowMap.get(id) || {};
      const queueCount = queueMap.get(id) || 0;
      return {
        _id: id,
        name: item.name,
        category: item.category || null,
        imageUrl: item.imageUrl || null,
        qrCode: item.qrCode,
        status: item.status,
        totalBorrows: b.totalBorrows || 0,
        activeBorrows: b.activeBorrows || 0,
        pendingBorrows: b.pendingBorrows || 0,
        lastBorrowDate: b.lastBorrowDate || null,
        queueCount,
        currentBorrower: item.currentBorrow
          ? {
              name: item.currentBorrow.borrower?.name,
              department: item.currentBorrow.borrower?.department,
              dueDate: item.currentBorrow.dueDate,
              borrowDate: item.currentBorrow.borrowDate,
            }
          : null,
      };
    });

    // Apply sort.
    if (sort === 'most') {
      rows.sort((a, b) => b.totalBorrows - a.totalBorrows);
    } else if (sort === 'recent') {
      rows.sort((a, b) => {
        const ad = a.lastBorrowDate ? new Date(a.lastBorrowDate).getTime() : 0;
        const bd = b.lastBorrowDate ? new Date(b.lastBorrowDate).getTime() : 0;
        return bd - ad;
      });
    } else if (sort === 'alpha') {
      rows.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    }

    res.json(rows.slice(0, limit));
  })
);

// --- GET /api/dashboard/items/:id/history ---
// Returns the full borrow history (latest first) for a single item.
router.get(
  '/items/:id/history',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const records = await BorrowRecord.find({ item: req.params.id })
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(records);
  })
);

module.exports = router;
