import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from '../pages/AuthPage';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const TOAST = { success: vi.fn(), error: vi.fn() };
const ON_SUCCESS = vi.fn();

function mkAuth(overrides = {}) {
  return { signin: vi.fn().mockResolvedValue({}), signup: vi.fn().mockResolvedValue({}), ...overrides };
}

function renderPage(auth = mkAuth()) {
  useAuth.mockReturnValue(auth);
  return render(<AuthPage onSuccess={ON_SUCCESS} toast={TOAST} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('AuthPage — signin mode (default)', () => {
  it('shows the "Sign in to Apex" heading', () => {
    renderPage();
    expect(screen.getByText('Sign in to Apex')).toBeInTheDocument();
  });

  it('renders username and password inputs', () => {
    renderPage();
    expect(screen.getByPlaceholderText('your_username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('does not render signup-only fields', () => {
    renderPage();
    expect(screen.queryByPlaceholderText('Jane Doe')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('you@example.com')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('25')).not.toBeInTheDocument();
  });

  it('renders the "Sign in" submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});

// ── Mode switching ─────────────────────────────────────────────────────────────

describe('AuthPage — mode switching', () => {
  it('switches to signup mode when "Sign up" link is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('shows signup-only fields after switching to signup', () => {
    renderPage();
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('25')).toBeInTheDocument();
  });

  it('renders "Create account" submit button in signup mode', () => {
    renderPage();
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('switches back to signin mode when "Sign in" link is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText('Sign up'));
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Sign in to Apex')).toBeInTheDocument();
  });

  it('clears form fields when switching modes', () => {
    renderPage();
    const usernameInput = screen.getByPlaceholderText('your_username');
    fireEvent.change(usernameInput, { target: { value: 'alice' } });

    fireEvent.click(screen.getByText('Sign up'));
    fireEvent.click(screen.getByText('Sign in'));

    expect(screen.getByPlaceholderText('your_username').value).toBe('');
  });
});

// ── Client-side validation ────────────────────────────────────────────────────

describe('AuthPage — client-side validation', () => {
  it('shows "Required" error when username is empty on submit', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    const errors = await screen.findAllByText(/Required/);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('does not call signin when fields are empty', () => {
    const auth = mkAuth();
    renderPage(auth);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(auth.signin).not.toHaveBeenCalled();
  });

  it('shows password mismatch error in signup mode', async () => {
    renderPage();
    fireEvent.click(screen.getByText('Sign up'));

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('25'), { target: { value: '25' } });
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'alice@x.com' } });

    const [passInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passInput, { target: { value: 'Password#1' } });
    fireEvent.change(confirmInput, { target: { value: 'Different#1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });
});

// ── Happy-path submission ─────────────────────────────────────────────────────

describe('AuthPage — successful signin', () => {
  it('calls signin with username and password', async () => {
    const auth = mkAuth();
    renderPage(auth);

    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass#1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(auth.signin).toHaveBeenCalledWith('alice', 'Pass#1234');
    });
  });

  it('calls onSuccess after signin', async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass#1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(ON_SUCCESS).toHaveBeenCalled());
  });
});

describe('AuthPage — successful signup', () => {
  function fillSignupForm() {
    fireEvent.click(screen.getByText('Sign up'));
    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('25'), { target: { value: '25' } });
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'alice@x.com' } });
    const [passInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passInput, { target: { value: 'Pass#1234' } });
    fireEvent.change(confirmInput, { target: { value: 'Pass#1234' } });
  }

  it('calls signup with all required fields', async () => {
    const auth = mkAuth();
    renderPage(auth);
    fillSignupForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(auth.signup).toHaveBeenCalledWith('Alice', '25', 'alice', 'alice@x.com', 'Pass#1234');
    });
  });

  it('switches back to signin after successful signup', async () => {
    renderPage();
    fillSignupForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(screen.getByText('Sign in to Apex')).toBeInTheDocument());
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('AuthPage — error handling', () => {
  it('shows a toast error when signin rejects', async () => {
    const auth = mkAuth({ signin: vi.fn().mockRejectedValue(new Error('Invalid credentials')) });
    renderPage(auth);

    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Pass#1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(TOAST.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
