const express = require('express');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { upload, getPublicUrl } = require('../config/upload');
const BugReport = require('../models/BugReport');
const { ROLES, BUG_STATUS, BUG_SEVERITY, BUG_CATEGORY } = require('../constants');

const router = express.Router();

// --- POST /api/bug-reports ---
// Anyone logged-in can submit. Optional screenshot field "screenshot".
router.post(
  '/',
  auth,
  upload.single('screenshot'),
  asyncHandler(async (req, res) => {
    const { title, description, category, severity, pageUrl } = req.body;
    if (!title || !description) {
      throw new ApiError(400, 'กรุณากรอกหัวข้อและรายละเอียด');
    }

    const validCategory = Object.values(BUG_CATEGORY).includes(category) ? category : 'other';
    const validSeverity = Object.values(BUG_SEVERITY).includes(severity) ? severity : 'medium';

    const report = await BugReport.create({
      reporter: req.user._id,
      title: title.slice(0, 200),
      description: description.slice(0, 5000),
      category: validCategory,
      severity: validSeverity,
      status: BUG_STATUS.OPEN,
      pageUrl: pageUrl ? pageUrl.slice(0, 500) : undefined,
      userAgent: req.headers['user-agent']
        ? req.headers['user-agent'].slice(0, 500)
        : undefined,
      screenshotUrl: req.file ? getPublicUrl(req.file) : undefined,
    });

    res.status(201).json(report);
  })
);

// --- GET /api/bug-reports/my ---
router.get(
  '/my',
  auth,
  asyncHandler(async (req, res) => {
    const reports = await BugReport.find({ reporter: req.user._id })
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  })
);

// --- GET /api/bug-reports --- (admin)
router.get(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.category) filter.category = req.query.category;

    const reports = await BugReport.find(filter)
      .populate('reporter', 'name email department')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  })
);

// --- GET /api/bug-reports/stats --- (admin)
router.get(
  '/stats',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [open, inProgress, resolved, closed, critical] = await Promise.all([
      BugReport.countDocuments({ status: BUG_STATUS.OPEN }),
      BugReport.countDocuments({ status: BUG_STATUS.IN_PROGRESS }),
      BugReport.countDocuments({ status: BUG_STATUS.RESOLVED }),
      BugReport.countDocuments({ status: BUG_STATUS.CLOSED }),
      BugReport.countDocuments({ severity: BUG_SEVERITY.CRITICAL, status: { $in: [BUG_STATUS.OPEN, BUG_STATUS.IN_PROGRESS] } }),
    ]);
    res.json({ open, inProgress, resolved, closed, criticalUnresolved: critical });
  })
);

// --- PUT /api/bug-reports/:id/status --- (admin)
router.put(
  '/:id/status',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;
    if (!Object.values(BUG_STATUS).includes(status)) {
      throw new ApiError(400, 'สถานะไม่ถูกต้อง');
    }

    const report = await BugReport.findById(req.params.id);
    if (!report) throw new ApiError(404, 'ไม่พบรายงาน');

    report.status = status;
    if (adminNote !== undefined) report.adminNote = adminNote;

    // Stamp who resolved it the moment status flips to resolved/closed.
    if (
      (status === BUG_STATUS.RESOLVED || status === BUG_STATUS.CLOSED || status === BUG_STATUS.WONT_FIX) &&
      !report.resolvedAt
    ) {
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
    }

    await report.save();
    res.json(report);
  })
);

// --- DELETE /api/bug-reports/:id ---
// Reporter can delete their own (only while open), admin can delete any.
router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const report = await BugReport.findById(req.params.id);
    if (!report) throw new ApiError(404, 'ไม่พบรายงาน');

    const isOwner = report.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) throw new ApiError(403, 'ไม่มีสิทธิ์');

    if (isOwner && !isAdmin && report.status !== BUG_STATUS.OPEN) {
      throw new ApiError(400, 'ลบได้เฉพาะรายงานที่ยังไม่ถูกตรวจสอบ');
    }

    await BugReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบเรียบร้อย' });
  })
);

module.exports = router;
