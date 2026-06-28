import React, { useEffect, useState } from 'react';
import { postsApi } from '../api/client.js';
import { TweetCard, TweetComposer, Modal, Input, Textarea, Button, Empty } from '../components/UI';

export default function MyPostsPage({ toast, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [modal, setModal] = useState(null);     // null | post object (edit)
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  async function load() {
    setLoading(true);
    try {
      const data = await postsApi.getMine();
      setPosts(Array.isArray(data) ? data : data.posts || data.data || []);
    } catch (e) {
      if (!e.message.includes('not found')) toast.error(e.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCompose(title, content) {
    if (!content && !title) return;
    setComposing(true);
    try {
      await postsApi.create(title, content);
      toast.success('Post published!');
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setComposing(false);
    }
  }

  function openEdit(post) {
    setForm({ title: post.title || '', content: post.content || '' });
    setModal(post);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await postsApi.patchById(modal.id, { title: form.title, content: form.content });
      toast.success('Post updated!');
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await postsApi.deleteById(id);
      toast.success('Post deleted.');
      setPosts(p => p.filter(x => x.id !== id));
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      {/* Compose */}
      <TweetComposer user={currentUser} onSubmit={handleCompose} loading={composing} />

      {/* Feed */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite', margin: '0 auto',
          }} />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <Empty
          icon="✏️"
          message="You haven't posted yet"
          sub="Share your first thought above!"
        />
      )}

      {!loading && posts.map(post => (
        <TweetCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onEdit={() => openEdit(post)}
          onDelete={() => handleDelete(post.id)}
        />
      ))}

      {/* Edit modal */}
      {modal && (
        <Modal
          title="Edit post"
          onClose={() => setModal(null)}
          footer={
            <>
              <Button onClick={() => setModal(null)}>Cancel</Button>
              <Button variant="primary" loading={saving} onClick={handleSave}>
                Save changes
              </Button>
            </>
          }
        >
          <Input
            label="Title"
            id="edit-title"
            placeholder="Post title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Content"
            id="edit-content"
            placeholder="What's on your mind?"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            maxLength={280}
            rows={5}
          />
        </Modal>
      )}
    </div>
  );
}
