import React from 'react';

// ── Internal spinner ──────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <span style={{
      width: size, height: size,
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'default', size = 'md', disabled, loading, onClick, type = 'button', style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font)', fontWeight: 700,
    border: '1px solid',
    borderRadius: 9999,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'background 0.15s, opacity 0.15s',
    outline: 'none',
    whiteSpace: 'nowrap',
    ...sizeMap[size],
    ...variantMap[variant],
    ...style,
  };
  return (
    <button type={type} style={base} disabled={disabled || loading} onClick={onClick}>
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

const sizeMap = {
  sm: { fontSize: 14, padding: '6px 16px', height: 32 },
  md: { fontSize: 15, padding: '8px 20px', height: 36 },
  lg: { fontSize: 17, padding: '14px 28px', height: 52 },
};

const variantMap = {
  default: { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text)' },
  primary: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' },
  outline: { background: 'transparent', borderColor: 'var(--text)', color: 'var(--text)' },
  danger:  { background: 'transparent', borderColor: 'var(--danger)', color: 'var(--danger)' },
  ghost:   { background: 'transparent', border: 'none', color: 'var(--muted)' },
};

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, id, error, ...props }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', fontSize: 12, fontWeight: 500,
          color: error ? 'var(--danger)' : 'var(--muted)',
          marginBottom: 4,
        }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          width: '100%',
          background: 'transparent',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 4,
          color: 'var(--text)',
          fontFamily: 'var(--font)',
          fontSize: 16,
          padding: '10px 12px',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
        {...props}
      />
      {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, id, error, maxLength, ...props }) {
  const len = props.value?.length || 0;
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', fontSize: 12, fontWeight: 500,
          color: 'var(--muted)', marginBottom: 4,
        }}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        maxLength={maxLength}
        style={{
          width: '100%', resize: 'none',
          background: 'transparent',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 4, color: 'var(--text)',
          fontFamily: 'var(--font)', fontSize: 16,
          padding: '10px 12px', outline: 'none', lineHeight: 1.5,
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
        {...props}
      />
      {maxLength && (
        <div style={{
          textAlign: 'right', fontSize: 12, marginTop: 4,
          color: len > maxLength * 0.9 ? 'var(--danger)' : 'var(--muted)',
        }}>
          {len}/{maxLength}
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(91,112,131,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '12px 0 20px',
        width: 600, maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 16px 12px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          <button onClick={onClose} className="tw-icon-btn" style={{ fontSize: 18, padding: 8 }}>
            ✕
          </button>
          <span style={{ fontWeight: 800, fontSize: 20 }}>{title}</span>
        </div>
        <div style={{ padding: '0 16px' }}>
          {children}
          {footer && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? 'var(--danger)' : t.type === 'info' ? 'var(--accent)' : 'var(--success)',
          borderRadius: 8, padding: '12px 20px',
          fontSize: 14, fontWeight: 500,
          color: '#fff',
          animation: 'slideUp 0.2s ease',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          whiteSpace: 'nowrap',
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#6366f1', '#4f46e5', '#818cf8', '#3730a3', '#a5b4fc', '#4338ca'];

export function Avatar({ user, size = 40 }) {
  const str = user?.name || user?.username || user?.email || 'U';
  const letter = str[0].toUpperCase();
  const color = AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.floor(size * 0.42), fontWeight: 700, color: '#fff',
      flexShrink: 0, userSelect: 'none',
    }}>
      {letter}
    </div>
  );
}

// ── TweetCard ─────────────────────────────────────────────────────────────────
export function TweetCard({ post, currentUser, onEdit, onDelete }) {
  const isOwn = !!(onEdit || onDelete);

  const authorName = post.author?.name
    || (currentUser && post.user_id === currentUser.id ? (currentUser.name || currentUser.username) : null)
    || `User ${post.user_id || post.userId || '?'}`;

  const authorHandle = post.author?.username
    || (currentUser && post.user_id === currentUser.id ? currentUser.username : null)
    || `user${post.user_id || '?'}`;

  const avatarUser = post.author
    || (currentUser && post.user_id === currentUser.id ? currentUser : { username: authorHandle });

  return (
    <article className="tw-tweet" style={{
      display: 'flex', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
    }}>
      <Avatar user={avatarUser} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{authorName}</span>
          <span style={{ color: 'var(--muted)', fontSize: 15 }}>@{authorHandle}</span>
          {isOwn && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
              {onEdit && (
                <button
                  className="tw-icon-btn"
                  onClick={e => { e.stopPropagation(); onEdit(); }}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="tw-icon-btn danger"
                  onClick={e => { e.stopPropagation(); onDelete(); }}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title (bold if present) */}
        {post.title && (
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{post.title}</p>
        )}

        {/* Body */}
        <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5, wordBreak: 'break-word' }}>
          {post.content || post.body || ''}
        </p>

        {/* Action bar (decorative) */}
        <div style={{ display: 'flex', gap: 0, marginTop: 10, marginLeft: -8 }}>
          <button className="tw-icon-btn">💬 <span>0</span></button>
          <button className="tw-icon-btn green">🔁 <span>0</span></button>
          <button className="tw-icon-btn pink">🤍 <span>0</span></button>
          <button className="tw-icon-btn">📤</button>
        </div>
      </div>
    </article>
  );
}

// ── TweetComposer ─────────────────────────────────────────────────────────────
export function TweetComposer({ user, onSubmit, loading }) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  function handleSubmit() {
    if (!content.trim() && !title.trim()) return;
    onSubmit(title.trim(), content.trim());
    setTitle('');
    setContent('');
  }

  const charCount = content.length;
  const nearLimit = charCount > 252;

  return (
    <div style={{
      display: 'flex', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
    }}>
      <Avatar user={user} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)',
            padding: '4px 0', marginBottom: 2, fontWeight: 600,
          }}
        />
        <textarea
          placeholder="What's happening?"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={280}
          rows={3}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 20, fontFamily: 'var(--font)',
            resize: 'none', lineHeight: 1.5,
          }}
        />
        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: nearLimit ? 'var(--danger)' : 'var(--muted)' }}>
            {charCount > 0 ? `${charCount}/280` : ''}
          </span>
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={handleSubmit}
            disabled={!content.trim() && !title.trim()}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', message, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)' }}>
      <div style={{ fontSize: 44, marginBottom: '1rem' }}>{icon}</div>
      <p style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{message}</p>
      {sub && <p style={{ fontSize: 15 }}>{sub}</p>}
    </div>
  );
}

// ── Card (used in Profile / Users stats) ──────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}
