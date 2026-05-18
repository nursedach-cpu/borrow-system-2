const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const borrowsRoutes = require('./routes/borrows');
const dashboardRoutes = require('./routes/dashboard');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/items', itemsRoutes);
  app.use('/api/borrows', borrowsRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  return app;
}

module.exports = createApp;
