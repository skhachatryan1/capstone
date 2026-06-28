import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupDatabase, closeDatabase, clearTables, TEST_USER } from '../helpers.js';

beforeAll(async () => { await setupDatabase(); });
afterAll(async () => { await closeDatabase(); });
beforeEach(async () => { await clearTables(); });

// ── Signup ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/signup', () => {
  it('creates a user and returns ok: true', async () => {
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects a duplicate username', async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
    const res = await request(app).post('/api/auth/signup').send({
      ...TEST_USER, username: 'differentuser',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a request with missing required fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({ username: 'only' });
    expect(res.status).toBe(400);
  });

  it('rejects a weak password (no uppercase)', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      ...TEST_USER, password: 'weakpass#1',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a weak password (no special character)', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      ...TEST_USER, password: 'WeakPass1',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      ...TEST_USER, password: 'Sh#1',
    });
    expect(res.status).toBe(400);
  });
});

// ── Signin ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/signin', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
  });

  it('returns accessToken and refreshToken on success', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      username: TEST_USER.username,
      password: TEST_USER.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      username: TEST_USER.username,
      password: 'Wrong#1234',
    });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown username', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      username: 'nobody',
      password: TEST_USER.password,
    });
    expect(res.status).toBe(404);
  });

  it('rejects a request with missing fields', async () => {
    const res = await request(app).post('/api/auth/signin').send({ username: TEST_USER.username });
    expect(res.status).toBe(400);
  });

  it('locks the account after 3 failed attempts', async () => {
    const bad = { username: TEST_USER.username, password: 'Wrong#1234' };
    await request(app).post('/api/auth/signin').send(bad);
    await request(app).post('/api/auth/signin').send(bad);
    await request(app).post('/api/auth/signin').send(bad);
    const res = await request(app).post('/api/auth/signin').send(bad);
    expect(res.status).toBe(403);
  });
});

// ── Token refresh ─────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('issues a new token pair', async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
    const { body: { refreshToken } } = await request(app)
      .post('/api/auth/signin')
      .send({ username: TEST_USER.username, password: TEST_USER.password });

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it('invalidates the old refresh token after rotation', async () => {
    await request(app).post('/api/auth/signup').send(TEST_USER);
    const { body: { refreshToken } } = await request(app)
      .post('/api/auth/signin')
      .send({ username: TEST_USER.username, password: TEST_USER.password });

    await request(app).post('/api/auth/refresh').send({ refreshToken });

    // Using the original (now rotated-out) token must fail
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
  });

  it('rejects a bogus refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'bogus.token.here' });
    expect(res.status).toBe(401);
  });
});
