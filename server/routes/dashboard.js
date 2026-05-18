const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const Item = require('../models/Item');
const BorrowRecord = require('../models/BorrowRecord');

const router = express.Router();

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [totalItems, available, borrowed, maintenance, pendingRequests, overdueItems] =
      await Promise.all([
        Item.countDocuments({ isDeleted: false }),
        Item.countDocuments({ isDeleted: false, status: 'available' }),
        Item.countDocuments({ isDeleted: false, status: 'borrowed' }),
        Item.countDocuments({ isDeleted: false, status: 'maintenance' }),
        BorrowRecord.countDocuments({ status: 'pending' }),
        BorrowRecord.countDocuments({
          status: 'approved',
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
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
