import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar, Button, Empty, TweetCard, TweetComposer } from '../components/UI';

// ── Avatar ────────────────────────────────────────────────────────────────────

describe('Avatar', () => {
  it('renders the first letter of username uppercased', () => {
    render(<Avatar user={{ username: 'alice' }} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('falls back to name if username is absent', () => {
    render(<Avatar user={{ name: 'Bob' }} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('falls back to U for an empty user', () => {
    render(<Avatar user={{}} />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});

// ── Button ────────────────────────────────────────────────────────────────────

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('is disabled when the loading prop is true', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});

// ── Empty ─────────────────────────────────────────────────────────────────────

describe('Empty', () => {
  it('renders the message text', () => {
    render(<Empty icon="🐦" message="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders the optional sub text', () => {
    render(<Empty icon="🐦" message="Nothing here" sub="Post something!" />);
    expect(screen.getByText('Post something!')).toBeInTheDocument();
  });
});

// ── TweetCard ─────────────────────────────────────────────────────────────────

const POST = { id: 1, title: 'Hello World', content: 'My first post', user_id: 1 };

describe('TweetCard', () => {
  it('renders the post title', () => {
    render(<TweetCard post={POST} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders the post content', () => {
    render(<TweetCard post={POST} />);
    expect(screen.getByText('My first post')).toBeInTheDocument();
  });

  it('shows Edit and Delete buttons when handlers are provided', () => {
    render(<TweetCard post={POST} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides Edit and Delete buttons when no handlers are provided', () => {
    render(<TweetCard post={POST} />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<TweetCard post={POST} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when Delete is clicked', () => {
    const onDelete = vi.fn();
    render(<TweetCard post={POST} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows author info from currentUser when user_id matches', () => {
    const user = { id: 1, name: 'Alice', username: 'alice' };
    render(<TweetCard post={POST} currentUser={user} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

// ── TweetComposer ─────────────────────────────────────────────────────────────

describe('TweetComposer', () => {
  const user = { username: 'alice' };

  it('renders the placeholder text', () => {
    render(<TweetComposer user={user} onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
  });

  it('calls onSubmit with title and content when Post is clicked', () => {
    const onSubmit = vi.fn();
    render(<TweetComposer user={user} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Title (optional)'), {
      target: { value: 'My title' },
    });
    fireEvent.change(screen.getByPlaceholderText("What's happening?"), {
      target: { value: 'My content' },
    });
    fireEvent.click(screen.getByText('Post'));

    expect(onSubmit).toHaveBeenCalledWith('My title', 'My content');
  });

  it('does not call onSubmit when both fields are empty', () => {
    const onSubmit = vi.fn();
    render(<TweetComposer user={user} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText('Post'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
