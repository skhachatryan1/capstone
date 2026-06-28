import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupDatabase, closeDatabase, clearTables, createAndSignIn, TEST_USER, TEST_USER_2 } from '../helpers.js';

let token;

beforeAll(async () => { await setupDatabase(); });
afterAll(async () => { await closeDatabase(); });
beforeEach(async () => {
  await clearTables();
  const auth = await createAndSignIn();
  token = auth.accessToken;
});

// ── Get all ───────────────────────────────────────────────────────────────────

describe('GET /api/users/', () => {
  it('returns an array containing the signed-in user', async () => {
    const res = await request(app)
      .get('/api/users/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/users/');
    expect(res.status).toBe(401);
  });

  it('returns multiple users when more than one exists', async () => {
    await createAndSignIn(TEST_USER_2);
    const res = await request(app)
      .get('/api/users/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Get me ────────────────────────────────────────────────────────────────────

describe('GET /api/users/me', () => {
  it('returns the authenticated user with correct username', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(TEST_USER.username);
  });

  it('does not expose the password', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.password).toBeUndefined();
  });

  it('does not expose the refreshToken', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.refreshToken).toBeUndefined();
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('rejects an expired / invalid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

// ── Patch me ──────────────────────────────────────────────────────────────────

describe('PATCH /api/users/me', () => {
  it('updates a single field without affecting others', async () => {
    await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.name).toBe('Updated Name');
    expect(res.body.username).toBe(TEST_USER.username); // unchanged
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: 'Hacker' });
    expect(res.status).toBe(401);
  });
});

// ── Delete me ─────────────────────────────────────────────────────────────────

describe('DELETE /api/users/me', () => {
  it('deletes the account and returns 200', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('makes the user no longer appear in GET /users/', async () => {
    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    // Create a second user to ensure the route doesn't 404 from being empty
    const auth2 = await createAndSignIn(TEST_USER_2);
    const res = await request(app)
      .get('/api/users/')
      .set('Authorization', `Bearer ${auth2.accessToken}`);

    const usernames = res.body.map(u => u.username);
    expect(usernames).not.toContain(TEST_USER.username);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).delete('/api/users/me');
    expect(res.status).toBe(401);
  });
});
