import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { ToastContainer, Avatar } from './components/UI';
import { usersApi } from './api/client';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import MyPostsPage from './pages/MyPostsPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';

const IconHome = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconEdit = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconProfile = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconPeople = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const NAV = [
  { key: 'feed',    label: 'Home',     icon: <IconHome /> },
  { key: 'myposts', label: 'My Posts', icon: <IconEdit /> },
  { key: 'profile', label: 'Profile',  icon: <IconProfile /> },
  { key: 'users',   label: 'People',   icon: <IconPeople /> },
];

const PAGE_TITLES = {
  feed:    'Home',
  myposts: 'My Posts',
  profile: 'Profile',
  users:   'People',
};

// ── Right sidebar ─────────────────────────────────────────────────────────────
function RightSidebar({ onNavigate }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    usersApi.getAll()
      .then(data => setUsers((Array.isArray(data) ? data : data.users || []).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Search (decorative) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted)', fontSize: 16, pointerEvents: 'none',
          }}>🔍</span>
          <input
            className="tw-search"
            placeholder="Search Apex"
            style={{ paddingLeft: 40 }}
            readOnly
          />
        </div>
      </div>

      {/* Who to follow */}
      {users.length > 0 && (
        <div className="tw-card">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 800, fontSize: 20 }}>Who to follow</span>
          </div>
          {users.map(u => (
            <div
              key={u.id}
              className="tw-user-row"
              onClick={() => onNavigate('users')}
            >
              <Avatar user={u} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.name || u.username}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>@{u.username}</div>
              </div>
              <button style={{
                background: 'var(--text)', color: 'var(--bg)',
                border: 'none', borderRadius: 9999,
                padding: '6px 16px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0,
              }}>
                Follow
              </button>
            </div>
          ))}
          <div
            className="tw-user-row"
            onClick={() => onNavigate('users')}
            style={{ color: 'var(--accent)', fontSize: 15, paddingTop: 8, paddingBottom: 16 }}
          >
            Show more
          </div>
        </div>
      )}

      {/* Footer links */}
      <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
          {['Terms', 'Privacy', 'Cookies', 'Accessibility', 'About'].map(l => (
            <span key={l} style={{ cursor: 'default' }}>{l}</span>
          ))}
        </div>
        <p style={{ marginTop: 8 }}>© 2026 Apex</p>
      </div>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const { user, loading, logout } = useAuth();
  const { toasts, toast } = useToast();
  const [view, setView] = useState('feed');

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthPage toast={toast} onSuccess={() => setView('feed')} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  const pages = {
    feed:    <FeedPage toast={toast} currentUser={user} />,
    myposts: <MyPostsPage toast={toast} currentUser={user} />,
    profile: <ProfilePage toast={toast} />,
    users:   <UsersPage toast={toast} />,
  };

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

        {/* ── Left navigation ── */}
        <nav style={{
          width: 275, flexShrink: 0,
          height: '100vh', overflowY: 'auto',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '8px 20px 20px',
        }}>
          {/* X logo */}
          <div style={{ padding: '12px 16px', marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--accent)' }}>APEX</span>
          </div>

          {/* Nav items */}
          {NAV.map(n => (
            <div
              key={n.key}
              className={`tw-nav-item${view === n.key ? ' active' : ''}`}
              onClick={() => setView(n.key)}
            >
              <span style={{ display: 'flex', color: view === n.key ? 'var(--accent)' : 'var(--text)', flexShrink: 0 }}>{n.icon}</span>
              <span style={{ fontSize: 20 }}>{n.label}</span>
            </div>
          ))}

          {/* Post button */}
          <button
            onClick={() => setView('myposts')}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 9999,
              padding: '14px 0', fontSize: 17, fontWeight: 700,
              cursor: 'pointer', marginTop: 16, marginBottom: 4,
              fontFamily: 'var(--font)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            Post
          </button>

          <div style={{ flex: 1 }} />

          {/* User info + logout */}
          <div className="tw-sidebar-user" onClick={logout} title="Click to sign out">
            <Avatar user={user} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || user.username || 'User'}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>@{user.username || user.email}</div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 18 }}>···</span>
          </div>
        </nav>

        {/* ── Center column ── */}
        <main style={{
          flex: 1, maxWidth: 600,
          height: '100vh', overflowY: 'auto',
          borderRight: '1px solid var(--border)',
        }}>
          {/* Sticky page header */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            padding: '14px 16px',
          }}>
            <h2 style={{ fontWeight: 800, fontSize: 20 }}>{PAGE_TITLES[view]}</h2>
          </div>

          {pages[view]}
        </main>

        {/* ── Right sidebar ── */}
        <aside style={{
          width: 350, flexShrink: 0,
          height: '100vh', overflowY: 'auto',
          padding: '0 16px',
        }}>
          <RightSidebar onNavigate={setView} />
        </aside>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
