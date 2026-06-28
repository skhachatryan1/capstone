const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const STORAGE_KEY = 'apex_refresh';

let accessToken = null;
let refreshToken = localStorage.getItem(STORAGE_KEY) || null;

export function setTokens(access, refresh) {
  accessToken = access;
  if (refresh) {
    refreshToken = refresh;
    localStorage.setItem(STORAGE_KEY, refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredRefreshToken() {
  return refreshToken;
}

async function tryRefresh() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data.accessToken) {
      accessToken = data.accessToken;
      if (data.refreshToken) refreshToken = data.refreshToken;
      return true;
    }
  } catch {}
  return false;
}

async function request(method, path, body = null, auth = true, retry = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const ok = await tryRefresh();
    if (ok) return request(method, path, body, auth, false);
    throw new Error('Session expired. Please sign in again.');
  }

  const contentType = res.headers.get('content-type');
  const data = contentType?.includes('json') ? await res.json() : {};

  if (!res.ok) {
    throw new Error(data.message || data.error || `Error ${res.status}`);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (name, age, username, email, password) =>
    request('POST', '/auth/signup', { name, age: Number(age), username, email, password }, false),

  signin: (username, password) =>
    request('POST', '/auth/signin', { username, password }, false),

  refresh: () =>
    request('POST', '/auth/refresh', { refreshToken }, false),
};

// ── Posts ─────────────────────────────────────────────────────────────────────

export const postsApi = {
  getAll: () =>
    request('GET', '/posts/'),

  getMine: () =>
    request('GET', '/posts/me'),

  create: (title, content) =>
    request('POST', '/posts/me', { title, content }),

  deleteById: (id) =>
    request('DELETE', `/posts/me/${id}`),

  patchById: (id, fields) =>
    request('PATCH', `/posts/me/${id}`, fields),

  putById: (id, title, content) =>
    request('PUT', `/posts/me/${id}`, { title, content }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () =>
    request('GET', '/users/'),

  getMe: () =>
    request('GET', '/users/me'),

  deleteMe: () =>
    request('DELETE', '/users/me'),

  patchMe: (fields) =>
    request('PATCH', '/users/me', fields),

  putMe: (username, email, password) =>
    request('PUT', '/users/me', { username, email, password }),
};
