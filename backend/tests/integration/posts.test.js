import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, setupDatabase, closeDatabase, clearTables, createAndSignIn, authed, TEST_USER, TEST_USER_2 } from '../helpers.js';

let token;

beforeAll(async () => { await setupDatabase(); });
afterAll(async () => { await closeDatabase(); });
beforeEach(async () => {
  await clearTables();
  const auth = await createAndSignIn();
  token = auth.accessToken;
});

async function createPost(accessToken, data = { title: 'Hello', content: 'World' }) {
  return request(app)
    .post('/api/posts/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(data);
}

async function getMyPosts(accessToken) {
  return request(app)
    .get('/api/posts/me')
    .set('Authorization', `Bearer ${accessToken}`);
}

// ── Create ────────────────────────────────────────────────────────────────────

describe('POST /api/posts/me', () => {
  it('creates a post and returns ok: true', async () => {
    const res = await createPost(token);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/posts/me').send({ title: 'Hi', content: 'There' });
    expect(res.status).toBe(401);
  });

  it('rejects a request with a missing content field', async () => {
    const res = await request(app)
      .post('/api/posts/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Only title' });
    expect(res.status).toBe(400);
  });
});

// ── Read all ──────────────────────────────────────────────────────────────────

describe('GET /api/posts/', () => {
  it('returns all posts as an array', async () => {
    await createPost(token);
    const res = await request(app)
      .get('/api/posts/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 404 when no posts exist', async () => {
    const res = await request(app)
      .get('/api/posts/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/posts/');
    expect(res.status).toBe(401);
  });
});

// ── Read mine ─────────────────────────────────────────────────────────────────

describe('GET /api/posts/me', () => {
  it("returns only the current user's posts", async () => {
    await createPost(token, { title: 'Mine', content: 'My content' });

    // Second user creates a post — should NOT appear in first user's /me
    const auth2 = await createAndSignIn(TEST_USER_2);
    await createPost(auth2.accessToken, { title: 'Theirs', content: 'Not mine' });

    const res = await getMyPosts(token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Mine');
  });

  it('returns 404 when the user has no posts', async () => {
    const res = await getMyPosts(token);
    expect(res.status).toBe(404);
  });
});

// ── Patch ─────────────────────────────────────────────────────────────────────

describe('PATCH /api/posts/me/:id', () => {
  it('updates specified fields', async () => {
    await createPost(token);
    const { body: [post] } = await getMyPosts(token);

    const res = await request(app)
      .patch(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
    expect(res.body.content).toBe('World'); // unchanged
  });

  it("returns 404 when trying to patch another user's post", async () => {
    const auth2 = await createAndSignIn(TEST_USER_2);
    await createPost(auth2.accessToken);
    const { body: [post] } = await getMyPosts(auth2.accessToken);

    const res = await request(app)
      .patch(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`) // different user
      .send({ title: 'Stolen' });

    expect(res.status).toBe(404);
  });

  it('ignores attempts to change user_id', async () => {
    await createPost(token);
    const { body: [post] } = await getMyPosts(token);

    const res = await request(app)
      .patch(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: 9999, title: 'Changed' });

    expect(res.status).toBe(200);
    expect(res.body.user_id).not.toBe(9999);
  });
});

// ── Put ───────────────────────────────────────────────────────────────────────

describe('PUT /api/posts/me/:id', () => {
  it('fully replaces title and content', async () => {
    await createPost(token);
    const { body: [post] } = await getMyPosts(token);

    const res = await request(app)
      .put(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New title', content: 'New content' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New title');
    expect(res.body.content).toBe('New content');
  });

  it('rejects a PUT with missing content', async () => {
    await createPost(token);
    const { body: [post] } = await getMyPosts(token);

    const res = await request(app)
      .put(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Only title' });

    expect(res.status).toBe(500); // service throws on missing required field
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe('DELETE /api/posts/me/:id', () => {
  it('deletes a post and returns ok: true', async () => {
    await createPost(token);
    const { body: [post] } = await getMyPosts(token);

    const res = await request(app)
      .delete(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('post no longer appears after deletion', async () => {
    await createPost(token);
    const { body: [post] } = await getMyPosts(token);
    await request(app).delete(`/api/posts/me/${post.id}`).set('Authorization', `Bearer ${token}`);

    const res = await getMyPosts(token);
    expect(res.status).toBe(404); // no posts left
  });

  it("returns 404 when deleting another user's post", async () => {
    const auth2 = await createAndSignIn(TEST_USER_2);
    await createPost(auth2.accessToken);
    const { body: [post] } = await getMyPosts(auth2.accessToken);

    const res = await request(app)
      .delete(`/api/posts/me/${post.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
