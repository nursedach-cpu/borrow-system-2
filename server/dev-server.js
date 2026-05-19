require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const createApp = require('./app');
const User = require('./models/User');

const PORT = process.env.PORT || 3001;

async function start() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
  console.log('Connected to in-memory MongoDB');

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@company.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name: 'Admin', email, password: hashed, role: 'admin' });
    console.log(`Admin account created: ${email} / ${password}`);
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin login: ${email} / ${password}`);
  });
}

start().catch(console.error);
