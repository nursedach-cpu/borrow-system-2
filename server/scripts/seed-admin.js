require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ตั้งค่า SEED_ADMIN_EMAIL และ SEED_ADMIN_PASSWORD ใน .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin ${email} มีอยู่แล้ว`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name: 'Admin',
    email,
    password: hashed,
    role: 'admin',
  });

  console.log(`สร้าง admin ${email} สำเร็จ`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
