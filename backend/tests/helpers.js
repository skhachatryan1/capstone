import request from 'supertest';
import app from '../app.js';
import { db } from '../src/config/index.js';

export { app };

export const TEST_USER = {
  name:     'Test User',
  age:      25,
  username: 'testuser',
  email:    'test@example.com',
  password: 'Test#1234',
};

export const TEST_USER_2 = {
  name:     'Second User',
  age:      30,
  username: 'seconduser',
  email:    'second@example.com',
  password: 'Second#1234',
};

/** Drop and recreate all tables. Call once in beforeAll. */
export async function setupDatabase() {
  await db.sequelize.sync({ force: true });
}

/** Close the pool. Call once in afterAll. */
export async function closeDatabase() {
  await db.sequelize.close();
}

/** Delete all rows — posts first (FK), then users. */
export async function clearTables() {
  await db.postModel.destroy({ where: {} });
  await db.userModel.destroy({ where: {} });
}

/** Sign up then sign in; returns { accessToken, refreshToken }. */
export async function createAndSignIn(user = TEST_USER) {
  await request(app).post('/api/auth/signup').send(user);
  const res = await request(app).post('/api/auth/signin').send({
    username: user.username,
    password: user.password,
  });
  return res.body;
}

/** Helper for authenticated requests. */
export function authed(req, token) {
  return req.set('Authorization', `Bearer ${token}`);
}
