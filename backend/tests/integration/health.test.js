import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, setupDatabase, closeDatabase } from '../helpers.js';

beforeAll(async () => { await setupDatabase(); });
afterAll(async () => { await closeDatabase(); });

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('reports status ok when DB is reachable', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  it('includes uptime as a number', async () => {
    const res = await request(app).get('/health');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('includes memory fields', async () => {
    const res = await request(app).get('/health');
    expect(res.body.memory).toHaveProperty('rss');
    expect(res.body.memory).toHaveProperty('heapUsed');
    expect(res.body.memory).toHaveProperty('heapTotal');
  });

  it('includes an ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(() => new Date(res.body.timestamp)).not.toThrow();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it('is accessible without a token', async () => {
    const res = await request(app).get('/health');
    expect(res.status).not.toBe(401);
  });
});
