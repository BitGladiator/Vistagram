import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchAPI, postAPI } from '../services/api';
import PostModal from '../components/PostModal';



const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);


const gradients = [
  'linear-gradient(135deg, #f5af19, #f12711)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #ff9a9e, #fecfef)',
  'linear-gradient(135deg, #667eea, #764ba2)',
];

const GridItem = ({ post, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const gradient = gradients[post.post_id?.charCodeAt(0) % gradients.length] || gradients[0];

  return (
    <div
      style={{ position: 'relative', aspectRatio: '1', cursor: 'pointer', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <div style={{
        width: '100%', height: '100%',
        background: post.media_url ? 'none' : gradient,
        backgroundColor: '#efefef',
      }}>
        {post.media_url ? (
          <img
            src={post.media_url}
            alt="post"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, opacity: 0.5,
          }}>
            📸
          </div>
        )}
      </div>


      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HeartIcon />
            <span style={{ fontWeight: '700', fontSize: 16, color: '#fff' }}>
              {post.like_count || 0}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CommentIcon />
            <span style={{ fontWeight: '700', fontSize: 16, color: '#fff' }}>
              {post.comment_count || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};



const GridSkeleton = () => (
  <div style={styles.grid}>
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
      <div
        key={i}
        style={{
          aspectRatio: '1',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    ))}
  </div>
);



export default function Hashtag() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [hashtagInfo, setHashtagInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    loadHashtag();
  }, [tag]);

  const loadHashtag = async () => {
    try {
      setLoading(true);

      // Use search only for hashtag metadata (post count etc.)
      try {
        const searchRes = await searchAPI.search(tag);
        const data = searchRes.data?.data || searchRes.data || {};
        const hashtagData = data.hashtags?.find(h => h.tag === tag);
        setHashtagInfo(hashtagData || { tag, post_count: 0 });
      } catch {
        setHashtagInfo({ tag, post_count: 0 });
      }

      // Always fetch posts from explore feed — search index lacks media_url
      const exploreRes = await postAPI.getExploreFeed({ limit: 50 });
      const allPosts = exploreRes.data?.data?.posts || [];
      const filteredPosts = allPosts.filter(p =>
        p.caption?.toLowerCase().includes(`#${tag.toLowerCase()}`)
      );
      setPosts(filteredPosts);

    } catch (err) {
      console.error('Failed to load hashtag:', err);
      setHashtagInfo({ tag, post_count: 0 });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>


      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#fff', borderBottom: '1px solid #dbdbdb', height: 60,
      }}>
        <div style={{
          maxWidth: 935, margin: '0 auto', height: '100%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 20px',
        }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <BackIcon />
          </button>
          <h1
            style={{
              fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
              fontSize: 28, fontWeight: '400', color: '#262626', cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            Vistagram
          </h1>
          <div style={{ width: 32 }} />
        </div>
      </div>


      <div style={{ maxWidth: 935, margin: '0 auto', padding: '0 20px' }}>


        <div style={styles.header}>

          <div style={styles.hashIcon}>
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5">
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
              <line x1="10" y1="3" x2="8" y2="21" />
              <line x1="16" y1="3" x2="14" y2="21" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={styles.hashtagTitle}>#{tag}</h2>
            {hashtagInfo && (
              <p style={styles.postCount}>
                {hashtagInfo.post_count?.toLocaleString() || 0} posts
              </p>
            )}
          </div>

          <button style={styles.followBtn}>Follow</button>
        </div>


        <div style={styles.sectionLabel}>
          <div style={styles.labelDash} />
          <span style={styles.labelText}>TOP POSTS</span>
          <div style={styles.labelDash} />
        </div>


        {loading ? (
          <GridSkeleton />
        ) : posts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
            <h3 style={styles.emptyTitle}>No posts yet</h3>
            <p style={styles.emptyText}>
              When people tag their posts with #{tag}, they'll appear here.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {posts.map(post => (
              <GridItem
                key={post.post_id}
                post={post}
                onClick={() => setSelectedPostId(post.post_id)}
              />
            ))}
          </div>
        )}


        {posts.length > 0 && (
          <>
            <div style={{ ...styles.sectionLabel, marginTop: 24 }}>
              <div style={styles.labelDash} />
              <span style={styles.labelText}>MOST RECENT</span>
              <div style={styles.labelDash} />
            </div>

            <div style={styles.grid}>
              {posts.map(post => (
                <GridItem
                  key={`recent-${post.post_id}`}
                  post={post}
                  onClick={() => setSelectedPostId(post.post_id)}
                />
              ))}
            </div>
          </>
        )}
      </div>


      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}



const styles = {
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 4, display: 'flex', alignItems: 'center',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 28,
    padding: '32px 0 16px',
  },
  hashIcon: {
    width: 96, height: 96, borderRadius: '50%',
    border: '2px solid #dbdbdb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  hashtagTitle: {
    fontSize: 28, fontWeight: '300', color: '#262626',
    marginBottom: 4,
  },
  postCount: {
    fontSize: 16, color: '#262626',
  },
  followBtn: {
    padding: '7px 24px',
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
  },
  sectionLabel: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '24px 0 16px',
  },
  labelDash: {
    flex: 1, height: 1, backgroundColor: '#dbdbdb',
  },
  labelText: {
    fontSize: 13, fontWeight: '600', color: '#8e8e8e',
    letterSpacing: '0.2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 3,
  },
  emptyState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 22, fontWeight: '300', color: '#262626', marginBottom: 8,
  },
  emptyText: {
    fontSize: 14, color: '#8e8e8e', maxWidth: 300,
  },
};