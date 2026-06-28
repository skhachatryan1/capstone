import React, { useEffect, useState } from 'react';
import { postsApi } from '../api/client.js';
import { TweetCard, Empty } from '../components/UI';

export default function FeedPage({ toast, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await postsApi.getAll();
      setPosts(Array.isArray(data) ? data : data.posts || data.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }} />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <Empty
          icon="🐦"
          message="Nothing here yet"
          sub="Be the first to post something!"
        />
      )}

      {!loading && posts.map(post => (
        <TweetCard key={post.id} post={post} currentUser={currentUser} />
      ))}
    </div>
  );
}
