const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const borrowsRoutes = require('./routes/borrows');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const reservationsRoutes = require('./routes/reservations');
const bugReportsRoutes = require('./routes/bugReports');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

function createApp() {
  const app = express();

  // Trust the first proxy hop (Render / Vercel / nginx).
  // express-rate-limit needs this to read the real client IP from X-Forwarded-For.
  app.set('trust proxy', 1);

  // ---- CORS ----
  // CORS_ORIGIN: comma-separated allowlist, e.g.
  //   "https://borrow-system.vercel.app,http://localhost:5173"
  // If unset, default to localhost only (safe default).
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, cb) {
        // Allow requests with no Origin header (curl, server-to-server, mobile apps)
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  // ---- Logging ----
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use(express.json({ limit: '1mb' }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // ---- Public health check (no rate limit, for uptime monitors) ----
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // ---- Global API rate limit ----
  app.use('/api', apiLimiter);

  // ---- Routes ----
  app.use('/api/auth', authRoutes);
  app.use('/api/items', itemsRoutes);
  app.use('/api/borrows', borrowsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/reservations', reservationsRoutes);
  app.use('/api/bug-reports', bugReportsRoutes);

  // ---- 404 for unknown API routes ----
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'ไม่พบ endpoint นี้' });
  });

  // ---- Centralized error handler (must be last) ----
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
