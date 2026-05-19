const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const BorrowRecord = require('../models/BorrowRecord');
const Item = require('../models/Item');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `borrow-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', auth, async (req, res) => {
  try {
    const { itemId, dueDate, note } = req.body;

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted) {
      return res.status(404).json({ error: 'ไม่พบรายการ' });
    }
    if (item.status !== 'available') {
      return res.status(400).json({ error: 'ของชิ้นนี้ไม่ว่าง' });
    }

    const existing = await BorrowRecord.findOne({
      item: itemId,
      borrower: req.user._id,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ error: 'คุณมีคำขอยืมรายการนี้รออนุมัติอยู่แล้ว' });
    }

    const record = await BorrowRecord.create({
      item: itemId,
      borrower: req.user._id,
      dueDate: dueDate || undefined,
      note,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const records = await BorrowRecord.find({ borrower: req.user._id })
      .populate('item', 'name qrCode status imageUrl')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const records = await BorrowRecord.find(filter)
      .populate('item', 'name qrCode status imageUrl')
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.put('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record || record.status !== 'pending') {
      return res.status(400).json({ error: 'ไม่พบคำขอ หรือคำขอไม่ได้อยู่ในสถานะรออนุมัติ' });
    }

    record.status = 'approved';
    record.borrowDate = new Date();
    record.approvedBy = req.user._id;
    if (req.body.dueDate) {
      record.dueDate = new Date(req.body.dueDate);
    }
    await record.save();

    await Item.findByIdAndUpdate(record.item, {
      status: 'borrowed',
      currentBorrow: record._id,
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.put('/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record || record.status !== 'pending') {
      return res.status(400).json({ error: 'ไม่พบคำขอ หรือคำขอไม่ได้อยู่ในสถานะรออนุมัติ' });
    }

    record.status = 'rejected';
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.put('/:id/return', auth, adminOnly, async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record || record.status !== 'approved') {
      return res.status(400).json({ error: 'ไม่พบคำขอ หรือคำขอไม่ได้อยู่ในสถานะยืมอยู่' });
    }

    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    await Item.findByIdAndUpdate(record.item, {
      status: 'available',
      currentBorrow: null,
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/:id/borrow-image', auth, upload.single('image'), async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'ไม่พบรายการ' });
    if (record.borrower.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
    }
    record.borrowImage = `/uploads/${req.file.filename}`;
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/:id/return-image', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'ไม่พบรายการ' });
    record.returnImage = `/uploads/${req.file.filename}`;
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
