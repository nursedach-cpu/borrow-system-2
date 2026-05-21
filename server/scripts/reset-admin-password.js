// Resets the admin account's password to whatever is in SEED_ADMIN_PASSWORD.
// Use this if you forgot the admin password or the hash got out of sync.
//
//   cd server
//   node scripts/reset-admin-password.js
//
// Optionally set a different password on the fly:
//   $env:NEW_PASSWORD = 'mynewpass'; node scripts/reset-admin-password.js

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@company.com';
  const password =
    process.env.NEW_PASSWORD ||
    process.env.SEED_ADMIN_PASSWORD ||
    'admin123';

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI ไม่ได้ตั้งไว้ใน .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`ไม่พบ admin ${email} ใน database`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.password = await bcrypt.hash(password, 10);
  user.role = 'admin'; // ensure admin role
  await user.save();

  console.log('✅ รีเซ็ตรหัสผ่านเรียบร้อย');
  console.log(`   อีเมล: ${email}`);
  console.log(`   รหัสผ่านใหม่: ${password}`);
  console.log('');
  console.log('ลองเข้าสู่ระบบที่ http://localhost:5173 ได้เลย');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('ผิดพลาด:', err.message);
  process.exit(1);
});
