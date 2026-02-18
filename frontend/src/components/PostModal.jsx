import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI, socialAPI } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const HeartIcon = ({ filled, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#ed4956' : 'none'} stroke={filled ? '#ed4956' : '#262626'} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const SaveIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#262626' : 'none'} stroke="#262626" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
);

const EmojiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

// ── Avatar ────────────────────────────────────────────────────────────────────

const Avatar = ({ username, size = 32 }) => {
  const colors = ['#f09433','#e6683c','#dc2743','#cc2366','#bc1888','#8a3ab9','#4c68d7'];
  const color = colors[username?.charCodeAt(0) % colors.length] || '#ccc';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: '600', color: '#fff', flexShrink: 0,
    }}>
      {username?.slice(0, 1).toUpperCase()}
    </div>
  );
};

// ── Comment Item ──────────────────────────────────────────────────────────────

const CommentItem = ({ comment }) => {
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  return (
    <div style={styles.comment}>
      <Avatar username={comment.username} size={32} />
      <div style={{ flex: 1 }}>
        <p style={styles.commentText}>
          <span style={styles.commentUsername}>{comment.username}</span>
          {' '}{comment.content}
        </p>
        <div style={styles.commentMeta}>
          <span>{timeAgo(comment.created_at)}</span>
          {comment.like_count > 0 && (
            <span>{comment.like_count} {comment.like_count === 1 ? 'like' : 'likes'}</span>
          )}
          <span style={{ cursor: 'pointer' }}>Reply</span>
        </div>
      </div>
      <button style={styles.commentLikeBtn}>
        <HeartIcon filled={false} size={12} />
      </button>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function PostModal({ postId, onClose }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await postAPI.getPost(postId);
      const postData = res.data?.data?.post || res.data?.post;
      setPost(postData);
      setLiked(postData.is_liked || false);
      setLikeCount(postData.like_count || 0);
      // Mock comments for now - replace with real API call
      setComments([]);
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      if (wasLiked) await socialAPI.unlike(postId);
      else await socialAPI.like(postId);
    } catch {
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await socialAPI.comment(postId, { content: newComment.trim() });
      setNewComment('');
      loadPost(); // Reload to get new comment
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const gradients = [
    'linear-gradient(135deg, #f5af19, #f12711)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
  ];
  const gradient = gradients[postId?.charCodeAt(0) % gradients.length] || gradients[0];

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (loading) {
    return (
      <div style={styles.backdrop} onClick={handleBackdropClick}>
        <div style={styles.modal}>
          <div style={{ ...styles.leftPanel, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#fff', fontSize: 14 }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      {/* Close button */}
      <button onClick={onClose} style={styles.closeBtn}>
        <CloseIcon />
      </button>

      {/* Modal */}
      <div style={styles.modal}>
        {/* Left: Image */}
        <div style={styles.leftPanel}>
          {post.media?.[0]?.media_url || post.media_url ? (
            <img
              src={post.media?.[0]?.media_url || post.media_url}
              alt="post"
              style={styles.image}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ ...styles.imagePlaceholder, background: gradient }}>
              <span style={{ fontSize: 64, opacity: 0.5 }}>📸</span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div style={styles.rightPanel}>
          {/* Header */}
          <div style={styles.header}>
            <Avatar username={post.username || user?.username} size={32} />
            <div style={{ flex: 1 }}>
              <div style={styles.headerUsername}>{post.username || user?.username}</div>
              {post.location && <div style={styles.headerLocation}>{post.location}</div>}
            </div>
            <button style={styles.moreBtn}><MoreIcon /></button>
          </div>

          {/* Comments section */}
          <div style={styles.commentsSection}>
            {/* Caption as first comment */}
            {post.caption && (
              <div style={styles.comment}>
                <Avatar username={post.username || user?.username} size={32} />
                <div style={{ flex: 1 }}>
                  <p style={styles.commentText}>
                    <span style={styles.commentUsername}>{post.username || user?.username}</span>
                    {' '}{post.caption}
                  </p>
                  <div style={styles.commentMeta}>
                    <span>{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            {comments.length === 0 && !post.caption && (
              <div style={styles.noComments}>
                <h3 style={{ fontSize: 22, fontWeight: '600', color: '#262626', marginBottom: 8 }}>
                  No comments yet.
                </h3>
                <p style={{ fontSize: 14, color: '#8e8e8e' }}>
                  Start the conversation.
                </p>
              </div>
            )}
            {comments.map(comment => (
              <CommentItem key={comment.comment_id} comment={comment} />
            ))}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <div style={styles.actionButtons}>
              <button onClick={handleLike} style={styles.actionBtn}>
                <HeartIcon filled={liked} />
              </button>
              <button style={styles.actionBtn}><CommentIcon /></button>
              <button style={styles.actionBtn}><ShareIcon /></button>
              <button onClick={() => setSaved(!saved)} style={{ ...styles.actionBtn, marginLeft: 'auto' }}>
                <SaveIcon filled={saved} />
              </button>
            </div>

            {/* Like count */}
            {likeCount > 0 && (
              <div style={styles.likes}>
                {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
              </div>
            )}

            {/* Timestamp */}
            <div style={styles.timestamp}>
              {timeAgo(post.created_at).toUpperCase()}
            </div>
          </div>

          {/* Comment input */}
          <form onSubmit={handleComment} style={styles.commentForm}>
            <button type="button" style={styles.emojiBtn}><EmojiIcon /></button>
            <input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={styles.commentInput}
            />
            {newComment.trim() && (
              <button type="submit" style={styles.postBtn}>Post</button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  closeBtn: {
    position: 'fixed', top: 20, right: 20, zIndex: 1001,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 8, display: 'flex', opacity: 0.9,
  },
  modal: {
    display: 'flex', maxWidth: 1200, width: '100%',
    maxHeight: '90vh', backgroundColor: '#fff',
    borderRadius: 4, overflow: 'hidden',
  },
  leftPanel: {
    flex: '0 0 60%', backgroundColor: '#000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  image: {
    maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain',
  },
  imagePlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  rightPanel: {
    flex: '0 0 40%', display: 'flex', flexDirection: 'column',
    maxWidth: 500,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: 14, borderBottom: '1px solid #efefef',
  },
  headerUsername: {
    fontSize: 14, fontWeight: '600', color: '#262626',
  },
  headerLocation: {
    fontSize: 12, color: '#262626',
  },
  moreBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 8,
  },
  commentsSection: {
    flex: 1, overflowY: 'auto', padding: 16,
  },
  comment: {
    display: 'flex', gap: 12, marginBottom: 16,
  },
  commentText: {
    fontSize: 14, lineHeight: '18px', color: '#262626', margin: 0,
  },
  commentUsername: {
    fontWeight: '600',
  },
  commentMeta: {
    display: 'flex', gap: 12, marginTop: 8,
    fontSize: 12, color: '#8e8e8e',
  },
  commentLikeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  },
  noComments: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
  },
  actions: {
    padding: '6px 16px 8px', borderTop: '1px solid #efefef',
  },
  actionButtons: {
    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8,
  },
  actionBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 8,
  },
  likes: {
    fontSize: 14, fontWeight: '600', color: '#262626', marginBottom: 8,
  },
  timestamp: {
    fontSize: 10, color: '#8e8e8e', letterSpacing: '0.2px',
  },
  commentForm: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 16px', borderTop: '1px solid #efefef', minHeight: 56,
  },
  emojiBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 8,
  },
  commentInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: 14, color: '#262626',
  },
  postBtn: {
    background: 'none', border: 'none',
    color: '#0095f6', fontWeight: '600', fontSize: 14,
    cursor: 'pointer', padding: '8px 0',
  },
};