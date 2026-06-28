import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/UI';

export default function AuthPage({ onSuccess, toast }) {
  const { signin, signup } = useAuth();
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', age: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setForm({ name: '', age: '', username: '', email: '', password: '', confirmPassword: '' });
  }

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Required';
    if (!form.password) errs.password = 'Required';
    if (mode === 'signup') {
      if (!form.name.trim()) errs.name = 'Required';
      if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1)
        errs.age = 'Enter a valid age';
      if (!form.email.trim()) errs.email = 'Required';
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(form.name, form.age, form.username, form.email, form.password);
        toast.success('Account created! Sign in now.');
        switchMode('signin');
      } else {
        await signin(form.username, form.password);
        toast.success('Welcome back!');
        onSuccess();
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem',
        borderRight: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-2px' }}>
          APEX
        </div>
        <p style={{ fontSize: 28, fontWeight: 700, marginTop: 32, color: 'var(--text)', textAlign: 'center', maxWidth: 360 }}>
          Happening now
        </p>
        <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 8, textAlign: 'center', maxWidth: 300 }}>
          Join the conversation on Apex.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '3rem 4rem',
        maxWidth: 600,
      }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', marginBottom: 32, letterSpacing: '-1px' }}>
          APEX
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 28, color: 'var(--text)' }}>
          {mode === 'signup' ? 'Create your account' : 'Sign in to Apex'}
        </h1>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {mode === 'signup' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input
                label="Full name"
                id="auth-name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={set('name')}
                onKeyDown={onKeyDown}
                error={errors.name}
                autoFocus
              />
              <Input
                label="Age"
                id="auth-age"
                type="number"
                placeholder="25"
                value={form.age}
                onChange={set('age')}
                onKeyDown={onKeyDown}
                error={errors.age}
                min={1}
              />
            </div>
          )}

          <Input
            label="Username"
            id="auth-username"
            placeholder="your_username"
            value={form.username}
            onChange={set('username')}
            onKeyDown={onKeyDown}
            error={errors.username}
            autoFocus={mode === 'signin'}
          />

          {mode === 'signup' && (
            <Input
              label="Email"
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              onKeyDown={onKeyDown}
              error={errors.email}
            />
          )}

          <Input
            label="Password"
            id="auth-password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            onKeyDown={onKeyDown}
            error={errors.password}
          />

          {mode === 'signup' && (
            <Input
              label="Confirm password"
              id="auth-confirm"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              onKeyDown={onKeyDown}
              error={errors.confirmPassword}
            />
          )}

          {mode === 'signup' && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Password must be 8+ characters with uppercase, lowercase, number, and special character.
            </p>
          )}

          <Button
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4, fontSize: 16 }}
          >
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </Button>

          <div style={{
            borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 20,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <span
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                {mode === 'signup' ? 'Sign in' : 'Sign up'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
