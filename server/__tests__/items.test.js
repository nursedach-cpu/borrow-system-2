const request = require('supertest');
const { setupTestDb, teardownTestDb, clearCollections, getApp } = require('./setup');

let app, adminToken, borrowerToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  await setupTestDb();
  app = getApp();
});

beforeEach(async () => {
  await clearCollections();

  const bcrypt = require('bcryptjs');
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');

  const adminUser = await User.create({
    name: 'Admin', email: 'admin@test.com',
    password: await bcrypt.hash('pass123', 10), role: 'admin',
  });
  adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);

  const borrowerUser = await User.create({
    name: 'Borrower', email: 'borrower@test.com',
    password: await bcrypt.hash('pass123', 10), role: 'borrower',
  });
  borrowerToken = jwt.sign({ userId: borrowerUser._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await teardownTestDb();
});

describe('POST /api/items', () => {
  it('admin creates item with auto QR', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Projector Epson', category: 'Electronics' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Projector Epson');
    expect(res.body.qrCode).toBeDefined();
    expect(res.body.status).toBe('available');
  });

  it('borrower cannot create item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ name: 'Laptop' });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/items', () => {
  it('lists items excluding deleted', async () => {
    await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Item A' });
    const created = await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Item B' });

    await request(app).delete(`/api/items/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app).get('/api/items')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Item A');
  });

  it('filters by status', async () => {
    await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Available Item' });

    const res = await request(app).get('/api/items?status=borrowed')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.length).toBe(0);
  });
});

describe('PUT /api/items/:id', () => {
  it('admin updates item', async () => {
    const created = await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Old Name' });

    const res = await request(app)
      .put(`/api/items/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Name', status: 'maintenance' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.status).toBe('maintenance');
  });
});

describe('DELETE /api/items/:id', () => {
  it('soft deletes item', async () => {
    const created = await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'To Delete' });

    const res = await request(app)
      .delete(`/api/items/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const list = await request(app).get('/api/items')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(list.body.length).toBe(0);
  });

  it('blocks delete of borrowed item', async () => {
    const Item = require('../models/Item');
    const created = await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Borrowed Item' });

    await Item.findByIdAndUpdate(created.body._id, { status: 'borrowed' });

    const res = await request(app)
      .delete(`/api/items/${created.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/items/qr/:qrCode', () => {
  it('finds item by QR code', async () => {
    const created = await request(app).post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'QR Item' });

    const res = await request(app)
      .get(`/api/items/qr/${created.body.qrCode}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('QR Item');
  });

  it('returns 404 for unknown QR', async () => {
    const res = await request(app)
      .get('/api/items/qr/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
