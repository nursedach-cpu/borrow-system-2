const request = require('supertest');
const { setupTestDb, teardownTestDb, clearCollections, getApp } = require('./setup');

let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  await setupTestDb();
  app = getApp();
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await teardownTestDb();
});

describe('POST /api/auth/register', () => {
  it('registers a new borrower', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user.role).toBe('borrower');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('forces role to borrower even if admin is sent', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', email: 'hack@test.com', password: 'password123', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('borrower');
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User1', email: 'dup@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User2', email: 'dup@test.com', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-name@test.com' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@test.com', password: 'password123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user with valid token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Me User', email: 'me@test.com', password: 'password123' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Me User');
    expect(res.body.password).toBeUndefined();
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
