import React, { useEffect, useState } from 'react';
import { usersApi, postsApi } from '../api/client.js';
import { Avatar, Empty } from '../components/UI';

function StatBox({ label, value }) {
  return (
    <div style={{
      flex: 1, padding: '16px 20px',
      borderRight: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function UsersPage({ toast }) {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.getAll().catch(() => []),
      postsApi.getAll().catch(() => []),
      postsApi.getMine().catch(() => []),
    ]).then(([u, p, mp]) => {
      setUsers(Array.isArray(u) ? u : u.users || []);
      setPosts(Array.isArray(p) ? p : p.posts || []);
      setMyPosts(Array.isArray(mp) ? mp : mp.posts || []);
    }).catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite', margin: '0 auto',
        }} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats strip */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: 0,
      }}>
        <StatBox label="Members" value={users.length} />
        <StatBox label="Total posts" value={posts.length} />
        <div style={{ flex: 1, padding: '16px 20px' }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{myPosts.length}</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>My posts</div>
        </div>
      </div>

      {/* User list */}
      {users.length === 0 && (
        <Empty icon="👥" message="No users found" sub="Be the first to sign up!" />
      )}

      {users.map(u => (
        <div key={u.id} className="tw-user-row" style={{ borderBottom: '1px solid var(--border)' }}>
          <Avatar user={u} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name || u.username || 'User'}</div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>@{u.username}</div>
            {u.email && (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</div>
            )}
          </div>
          <button style={{
            background: 'var(--text)', color: 'var(--bg)',
            border: 'none', borderRadius: 9999,
            padding: '7px 18px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
            fontFamily: 'var(--font)',
          }}>
            Follow
          </button>
        </div>
      ))}
    </div>
  );
}
