const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setupTestDb, teardownTestDb, clearCollections, getApp } = require('./setup');
const User = require('../models/User');
const Item = require('../models/Item');
const { v4: uuidv4 } = require('uuid');

let app, adminToken, borrowerToken, adminId, borrowerId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  await setupTestDb();
  app = getApp();
});

beforeEach(async () => {
  await clearCollections();

  const admin = await User.create({
    name: 'Admin', email: 'admin@test.com',
    password: await bcrypt.hash('pass', 10), role: 'admin',
  });
  adminId = admin._id;
  adminToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET);

  const borrower = await User.create({
    name: 'Borrower', email: 'b@test.com',
    password: await bcrypt.hash('pass', 10), role: 'borrower',
  });
  borrowerId = borrower._id;
  borrowerToken = jwt.sign({ userId: borrower._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await teardownTestDb();
});

async function createItem(name) {
  return Item.create({
    name, qrCode: uuidv4(), createdBy: adminId,
  });
}

describe('POST /api/borrows', () => {
  it('borrower submits borrow request', async () => {
    const item = await createItem('Laptop');

    const res = await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.item).toBe(item._id.toString());
  });

  it('rejects if item is already borrowed', async () => {
    const item = await createItem('Laptop');
    item.status = 'borrowed';
    await item.save();

    const res = await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    expect(res.status).toBe(400);
  });

  it('rejects duplicate pending request', async () => {
    const item = await createItem('Laptop');

    await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    const res = await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/borrows/:id/approve', () => {
  it('admin approves request and item becomes borrowed', async () => {
    const item = await createItem('Laptop');

    const borrow = await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    const res = await request(app)
      .put(`/api/borrows/${borrow.body._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dueDate: '2026-06-01' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
    expect(res.body.borrowDate).toBeDefined();
    expect(res.body.dueDate).toBeDefined();

    const updated = await Item.findById(item._id);
    expect(updated.status).toBe('borrowed');
    expect(updated.currentBorrow.toString()).toBe(borrow.body._id);
  });
});

describe('PUT /api/borrows/:id/reject', () => {
  it('admin rejects request', async () => {
    const item = await createItem('Laptop');

    const borrow = await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    const res = await request(app)
      .put(`/api/borrows/${borrow.body._id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');

    const updated = await Item.findById(item._id);
    expect(updated.status).toBe('available');
  });
});

describe('PUT /api/borrows/:id/return', () => {
  it('admin confirms return and item becomes available', async () => {
    const item = await createItem('Laptop');

    const borrow = await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    await request(app)
      .put(`/api/borrows/${borrow.body._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app)
      .put(`/api/borrows/${borrow.body._id}/return`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('returned');
    expect(res.body.returnDate).toBeDefined();

    const updated = await Item.findById(item._id);
    expect(updated.status).toBe('available');
    expect(updated.currentBorrow).toBeNull();
  });
});

describe('GET /api/borrows', () => {
  it('admin sees all borrows', async () => {
    const item = await createItem('Laptop');

    await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    const res = await request(app)
      .get('/api/borrows')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('filters by status', async () => {
    const item = await createItem('Laptop');

    await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    const res = await request(app)
      .get('/api/borrows?status=approved')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.length).toBe(0);
  });
});

describe('GET /api/borrows/my', () => {
  it('borrower sees own borrows', async () => {
    const item = await createItem('Laptop');

    await request(app)
      .post('/api/borrows')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ itemId: item._id.toString() });

    const res = await request(app)
      .get('/api/borrows/my')
      .set('Authorization', `Bearer ${borrowerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});
