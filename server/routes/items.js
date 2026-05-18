const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const Item = require('../models/Item');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', auth, async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const items = await Item.find(filter)
      .populate({ path: 'currentBorrow', populate: { path: 'borrower', select: 'name email department' } })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อของ' });
    }

    const item = await Item.create({
      name,
      description,
      category,
      qrCode: uuidv4(),
      createdBy: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, category, status } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, category, status },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการ' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการ' });
    }
    if (item.status === 'borrowed') {
      return res.status(400).json({ error: 'ไม่สามารถลบของที่ถูกยืมอยู่ กรุณารับคืนก่อน' });
    }
    item.isDeleted = true;
    await item.save();
    res.json({ message: 'ลบเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.get('/qr/:qrCode', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ qrCode: req.params.qrCode, isDeleted: false })
      .populate('currentBorrow');
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบของชิ้นนี้ในระบบ' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/:id/image', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'กรุณาเลือกไฟล์รูปภาพ' });
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { imageUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการ' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.get('/:id/qr', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'ไม่พบรายการ' });
    }
    const png = await QRCode.toBuffer(item.qrCode, { type: 'png', width: 300 });
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
