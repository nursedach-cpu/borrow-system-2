const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

// Aggressive limiter for auth endpoints (login/register) — prevents brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest, // Disabled in tests to avoid false failures
  message: { error: 'ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาที' },
});

// Lighter limiter for general API — catches scraping / DoS attempts.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่' },
});

module.exports = { authLimiter, apiLimiter };
