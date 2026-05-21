const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Cache last-verified User docs in-memory for a short window so we don't
// hit MongoDB on every authenticated request. Trade-off: role changes
// take up to CACHE_TTL_MS to propagate. That's acceptable for this app.
// Disabled during tests so deleted users don't linger across cases.
const CACHE_TTL_MS = process.env.NODE_ENV === 'test' ? 0 : 30 * 1000;
const userCache = new Map(); // key: userId → { user, expiresAt }

function getCached(userId) {
  if (CACHE_TTL_MS === 0) return null;
  const entry = userCache.get(userId);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    userCache.delete(userId);
    return null;
  }
  return entry.user;
}

function setCached(userId, user) {
  if (CACHE_TTL_MS === 0) return;
  userCache.set(userId, { user, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    let user = getCached(payload.userId);
    if (!user) {
      user = await User.findById(payload.userId).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'ไม่พบผู้ใช้' });
      }
      setCached(payload.userId, user);
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

module.exports = auth;
