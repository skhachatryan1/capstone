import React, { useState } from 'react';
import { usersApi } from '../api/client.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { Avatar, Button, Input, Card } from '../components/UI';

const METHOD_STYLE = {
  GET:    { background: 'rgba(0,186,124,0.15)',  color: '#00ba7c' },
  POST:   { background: 'rgba(29,155,240,0.15)', color: '#1d9bf0' },
  PATCH:  { background: 'rgba(255,122,0,0.15)',  color: '#ff7a00' },
  PUT:    { background: 'rgba(120,86,255,0.15)', color: '#7856ff' },
  DELETE: { background: 'rgba(244,33,46,0.15)',  color: '#f4212e' },
};

const ENDPOINTS = [
  ['GET',    'GET /posts/',          'Public feed'],
  ['GET',    'GET /posts/me',        'Your posts'],
  ['POST',   'POST /posts/me',       'Create post'],
  ['PATCH',  'PATCH /posts/me/:id',  'Partial update'],
  ['PUT',    'PUT /posts/me/:id',    'Full replace'],
  ['DELETE', 'DELETE /posts/me/:id', 'Delete post'],
  ['GET',    'GET /users/',          'All users'],
  ['GET',    'GET /users/me',        'Your profile'],
  ['PATCH',  'PATCH /users/me',      'Update profile'],
  ['PUT',    'PUT /users/me',        'Replace profile'],
  ['DELETE', 'DELETE /users/me',     'Delete account'],
  ['GET',    'GET /health',          'Health check (no auth)'],
];

export default function ProfilePage({ toast }) {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab] = useState('edit');
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    name: user?.name || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handlePatch() {
    const payload = {};
    if (form.username) payload.username = form.username;
    if (form.email) payload.email = form.email;
    if (form.name) payload.name = form.name;
    if (Object.keys(payload).length === 0) { toast.error('Fill in at least one field'); return; }
    setSaving(true);
    try {
      await usersApi.patchMe(payload);
      updateUser(payload);
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await usersApi.deleteMe();
      toast.success('Account deleted.');
      logout();
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Cover banner */}
      <div style={{
        height: 130,
        background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
      }} />

      {/* Avatar + names */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginTop: -46, marginBottom: 12,
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            border: '4px solid var(--bg)',
            overflow: 'hidden', flexShrink: 0,
          }}>
            <Avatar user={user} size={80} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTab('edit')}
          >
            Edit profile
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>
            {user?.name || user?.username || 'User'}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 15 }}>
            @{user?.username || user?.email}
          </div>
          {user?.email && (
            <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
              ✉ {user.email}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
        {[['edit', 'Edit'], ['api', 'API Docs']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              color: tab === key ? 'var(--text)' : 'var(--muted)',
              fontSize: 15, fontWeight: tab === key ? 700 : 400,
              padding: '16px 0', fontFamily: 'var(--font)',
              borderBottom: `2px solid ${tab === key ? 'var(--accent)' : 'transparent'}`,
              transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Edit profile */}
      {tab === 'edit' && (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input
              label="Name"
              id="p-name"
              value={form.name}
              onChange={set('name')}
              placeholder={user?.name || ''}
            />
            <Input
              label="Username"
              id="p-username"
              value={form.username}
              onChange={set('username')}
              placeholder={user?.username || ''}
            />
          </div>
          <Input
            label="Email"
            id="p-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder={user?.email || ''}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button variant="primary" loading={saving} onClick={handlePatch}>
              Save changes
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete account
            </Button>
          </div>
        </div>
      )}

      {/* Tab: API Docs */}
      {tab === 'api' && (
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            Base URL: <code style={{ color: 'var(--accent)' }}>http://localhost:5001/api</code>
            &nbsp;· Requires <code style={{ color: 'var(--accent)' }}>Authorization: Bearer &lt;token&gt;</code> unless noted.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ENDPOINTS.map(([method, path, desc]) => (
              <div key={path} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 12px',
                background: 'var(--surface)', borderRadius: 8,
                fontFamily: 'monospace', fontSize: 13,
              }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 5, fontWeight: 700, fontSize: 12,
                  ...METHOD_STYLE[method],
                }}>
                  {method}
                </span>
                <span style={{ flex: 1 }}>{path}</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
