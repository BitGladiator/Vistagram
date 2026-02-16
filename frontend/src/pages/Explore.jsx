import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, searchAPI } from '../services/api';



const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#262626" stroke="#262626" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ExploreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626" stroke="#262626" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
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
  'linear-gradient(135deg, #fddb92, #d1fdff)',
  'linear-gradient(135deg, #96fbc4, #f9f586)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4481eb, #04befe)',
];

const getGradient = (id) =>
  gradients[(id?.charCodeAt(0) || 0) % gradients.length];

const Avatar = ({ username, size = 24 }) => {
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



const GridItem = ({ post, span = 1 }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        gridColumn: span > 1 ? `span ${span}` : undefined,
        gridRow: span > 1 ? `span ${span}` : undefined,
        position: 'relative',
        aspectRatio: '1',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundColor: '#efefef',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
      <div style={{
        width: '100%', height: '100%',
        background: post.media_url ? 'none' : getGradient(post.post_id),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {post.media_url ? (
          <img
            src={post.media_url}
            alt="post"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: span > 1 ? 48 : 28, opacity: 0.5 }}>📸</span>
        )}
      </div>

      
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.32)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 28,
          transition: 'opacity 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HeartIcon />
            <span style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {(post.like_count || 0).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CommentIcon />
            <span style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {(post.comment_count || 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};



const GridSkeleton = () => (
  <div style={gridStyle}>
    {Array.from({ length: 12 }, (_, i) => {
      const isFeatured = i === 0 || i === 7;
      return (
        <div
          key={i}
          style={{
            gridColumn: isFeatured ? 'span 2' : undefined,
            gridRow: isFeatured ? 'span 2' : undefined,
            aspectRatio: '1',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      );
    })}
  </div>
);

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 3,
};



const SearchResults = ({ results, query, loading }) => {
  if (loading) {
    return (
      <div style={styles.searchResults}>
        {[1,2,3,4].map(i => (
          <div key={i} style={styles.searchResultItem}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
            }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                width: 120, height: 14, borderRadius: 4,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
              }} />
              <div style={{
                width: 80, height: 12, borderRadius: 4,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!query) {
    return (
      <div style={styles.searchResults}>
        <p style={styles.searchHint}>Search for people and posts</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={styles.searchResults}>
        <p style={styles.noResults}>No results for "<strong>{query}</strong>"</p>
      </div>
    );
  }

  return (
    <div style={styles.searchResults}>
      {results.map((item, i) => (
        <div key={i} style={styles.searchResultItem}>
          <Avatar username={item.username || item.value} size={44} />
          <div>
            <p style={styles.resultUsername}>{item.username || item.value}</p>
            <p style={styles.resultSubtitle}>{item.full_name || item.type || 'User'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};



export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  

  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await postAPI.getExploreFeed({ page: pageNum, limit: 12 });
      const newPosts = res.data?.data?.posts || [];

      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(res.data?.data?.pagination?.has_more || newPosts.length === 12);
    } catch (err) {
      console.error('Failed to load explore:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchAPI.autocomplete(searchQuery);
        setSearchResults(res.data?.data?.suggestions || res.data?.suggestions || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchRef.current?.blur();
    setSearchFocused(false);
  };

 

  const buildMosaicRows = (posts) => {
    const rows = [];
    let i = 0;
    let rowIndex = 0;

    while (i < posts.length) {
      const isFeaturedRow = rowIndex % 2 === 0; 

      if (isFeaturedRow) {
      
        rows.push({
          type: 'left-featured',
          featured: posts[i],
          smalls: posts.slice(i + 1, i + 3),
        });
        i += 3;
      } else {
       
        rows.push({
          type: 'right-featured',
          featured: posts[i + 2],
          smalls: posts.slice(i, i + 2),
        });
        i += 3;
      }
      rowIndex++;
    }

    return rows;
  };

  const mosaicRows = buildMosaicRows(posts);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .search-input::placeholder { color: #8e8e8e; }
      `}</style>

     
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#fff', borderBottom: '1px solid #dbdbdb', height: 60,
      }}>
        <div style={{
          maxWidth: 935, margin: '0 auto', height: '100%',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 20px', gap: 16,
        }}>
          <h1
            style={{
              fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
              fontSize: 28, fontWeight: '400', color: '#262626', cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => navigate('/')}
          >
            Vistagram
          </h1>

         
          <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#efefef', borderRadius: 8, padding: '8px 12px',
            }}>
              <SearchIcon />
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                style={{
                  flex: 1, border: 'none', background: 'none',
                  outline: 'none', fontSize: 14, color: '#262626',
                }}
              />
              {searchQuery && (
                <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <CloseIcon />
                </button>
              )}
            </div>

           
            {searchFocused && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                backgroundColor: '#fff', border: '1px solid #dbdbdb',
                borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 200, overflow: 'hidden',
              }}>
                <SearchResults
                  results={searchResults}
                  query={searchQuery}
                  loading={searchLoading}
                />
              </div>
            )}
          </div>

        
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0 }}>
            <button onClick={() => navigate('/')} style={styles.iconBtn}><HomeIcon /></button>
            <button onClick={() => navigate('/create')} style={styles.iconBtn}><PlusIcon /></button>
            <button onClick={() => navigate('/profile')} style={styles.iconBtn}>
              <Avatar username={user?.username} size={24} />
            </button>
          </div>
        </div>
      </div>

     
      <div style={{ maxWidth: 935, margin: '0 auto', padding: '24px 20px' }}>

        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: '600', color: '#262626' }}>
            Explore
          </h2>
          <span style={{ fontSize: 13, color: '#8e8e8e' }}>
            Trending in the last 48 hours
          </span>
        </div>

       
        {loading ? (
          <GridSkeleton />
        ) : posts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 22, fontWeight: '300', color: '#262626', marginBottom: 8 }}>
              Nothing to explore yet
            </h3>
            <p style={{ fontSize: 14, color: '#8e8e8e' }}>
              Posts will appear here as people share photos
            </p>
            <button
              onClick={() => navigate('/create')}
              style={{
                marginTop: 16, padding: '8px 20px',
                backgroundColor: '#0095f6', color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: '600', cursor: 'pointer',
              }}
            >
              Be the first to post!
            </button>
          </div>
        ) : (
          <>
        
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {mosaicRows.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: 3,
                    height: 312,
                  }}
                >
                  {row.type === 'left-featured' ? (
                    <>
                    
                      {row.featured && (
                        <div style={{ gridColumn: '1', gridRow: '1 / span 2' }}>
                          <GridItem post={row.featured} span={2} />
                        </div>
                      )}
                    
                      {[0,1,2,3].map(i => {
                        const post = posts[posts.indexOf(row.featured) + 1 + i];
                        return post ? (
                          <div key={i} style={{ gridColumn: i < 2 ? '2' : '3', gridRow: i % 2 === 0 ? '1' : '2' }}>
                            <GridItem post={post} />
                          </div>
                        ) : null;
                      })}
                    </>
                  ) : (
                    <>
                     
                      {[0,1,2,3].map(i => {
                        const post = posts[posts.indexOf(row.featured) - 4 + i] || row.smalls?.[i];
                        return post ? (
                          <div key={i} style={{ gridColumn: i < 2 ? '1' : '2', gridRow: i % 2 === 0 ? '1' : '2' }}>
                            <GridItem post={post} />
                          </div>
                        ) : null;
                      })}
                    
                      {row.featured && (
                        <div style={{ gridColumn: '3', gridRow: '1 / span 2' }}>
                          <GridItem post={row.featured} span={2} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

       
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '10px 32px',
                    backgroundColor: loadingMore ? '#b2dffc' : '#0095f6',
                    color: '#fff', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: '600',
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



const styles = {
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
    display: 'flex', alignItems: 'center',
  },
  searchResults: {
    maxHeight: 360, overflowY: 'auto',
  },
  searchHint: {
    padding: '20px 16px', fontSize: 14,
    color: '#8e8e8e', textAlign: 'center',
  },
  noResults: {
    padding: '20px 16px', fontSize: 14,
    color: '#262626', textAlign: 'center',
  },
  searchResultItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 16px', cursor: 'pointer',
    transition: 'background 0.1s',
  },
  resultUsername: {
    fontSize: 14, fontWeight: '600', color: '#262626',
  },
  resultSubtitle: {
    fontSize: 12, color: '#8e8e8e',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', textAlign: 'center',
  },
};