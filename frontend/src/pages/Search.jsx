import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchAPI } from '../services/api';


const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HashIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);


const Avatar = ({ username, size = 44 }) => {
  const colors = ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888', '#8a3ab9', '#4c68d7'];
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


const UserResult = ({ user, onClick }) => (
  <div onClick={onClick} style={styles.resultItem}>
    <Avatar username={user.username} size={44} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={styles.username}>
        {user.username}
        {user.is_verified && <span style={styles.verifiedBadge}>✓</span>}
      </div>
      <div style={styles.subtitle}>
        {user.full_name}
      </div>
    </div>
  </div>
);



const HashtagResult = ({ hashtag, onClick }) => (
  <div onClick={onClick} style={styles.resultItem}>
    <div style={styles.hashIconContainer}>
      <HashIcon />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={styles.hashtagName}>#{hashtag.tag}</div>
      <div style={styles.subtitle}>
        {hashtag.post_count?.toLocaleString() || 0} posts
      </div>
    </div>
  </div>
);

// ── Loading Skeleton ──────────────────────────────────────────────────────────

const ResultSkeleton = () => (
  <div style={styles.resultItem}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        width: '40%', height: 14, borderRadius: 4,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{
        width: '60%', height: 12, borderRadius: 4,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  </div>
);



const EmptyState = ({ query, hasSearched }) => {
  if (!hasSearched) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h3 style={styles.emptyTitle}>Search Vistagram</h3>
        <p style={styles.emptyText}>
          Search for people, hashtags and posts
        </p>
      </div>
    );
  }

  return (
    <div style={styles.emptyState}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
      <h3 style={styles.emptyTitle}>No results found</h3>
      <p style={styles.emptyText}>
        Try searching for something else
      </p>
      {query && (
        <p style={{ fontSize: 13, color: '#8e8e8e', marginTop: 4 }}>
          No results for "<strong>{query}</strong>"
        </p>
      )}
    </div>
  );
};


export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ users: [], hashtags: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);


  useEffect(() => {
    if (query.length < 2) {
      setResults({ users: [], hashtags: [] });
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await searchAPI.search(query);
        const data = res.data?.data || res.data || {};
        setResults({
          users: data.users || [],
          hashtags: data.hashtags || [],
        });
        setSearchParams({ q: query });
      } catch (err) {
        console.error('Search failed:', err);
        setResults({ users: [], hashtags: [] });
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const handleClear = () => {
    setQuery('');
    setResults({ users: [], hashtags: [] });
    setHasSearched(false);
    setSearchParams({});
    inputRef.current?.focus();
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleHashtagClick = (tag) => {
    navigate(`/hashtag/${tag}`);
  };

  const totalResults = results.users.length + results.hashtags.length;

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
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
        }}>
          <button onClick={() => navigate('/')} style={styles.backBtn}>
            <BackIcon />
          </button>

          <div style={{ flex: 1, position: 'relative' }}>
            <div style={styles.searchBar}>
              <SearchIcon />
              <input
                ref={inputRef}
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.searchInput}
              />
              {query && (
                <button onClick={handleClear} style={styles.clearBtn}>
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      <div style={{ maxWidth: 600, margin: '0 auto' }}>


        {hasSearched && totalResults > 0 && (
          <div style={styles.tabs}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                ...styles.tab,
                borderBottom: activeTab === 'all' ? '1px solid #262626' : '1px solid transparent',
                color: activeTab === 'all' ? '#262626' : '#8e8e8e',
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                ...styles.tab,
                borderBottom: activeTab === 'users' ? '1px solid #262626' : '1px solid transparent',
                color: activeTab === 'users' ? '#262626' : '#8e8e8e',
              }}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('hashtags')}
              style={{
                ...styles.tab,
                borderBottom: activeTab === 'hashtags' ? '1px solid #262626' : '1px solid transparent',
                color: activeTab === 'hashtags' ? '#262626' : '#8e8e8e',
              }}
            >
              Hashtags
            </button>
          </div>
        )}


        <div style={{ backgroundColor: '#fff' }}>
          {loading ? (

            <div>
              {[1, 2, 3, 4, 5].map(i => <ResultSkeleton key={i} />)}
            </div>
          ) : totalResults === 0 ? (

            <EmptyState query={query} hasSearched={hasSearched} />
          ) : (

            <div>

              {activeTab === 'all' && (
                <>
                  {results.users.length > 0 && (
                    <div>
                      <div style={styles.sectionHeader}>Users</div>
                      {results.users.map(user => (
                        <UserResult
                          key={user.user_id}
                          user={user}
                          onClick={() => handleUserClick(user.user_id)}
                        />
                      ))}
                    </div>
                  )}

                  {results.hashtags.length > 0 && (
                    <div>
                      <div style={styles.sectionHeader}>Hashtags</div>
                      {results.hashtags.map(hashtag => (
                        <HashtagResult
                          key={hashtag.tag}
                          hashtag={hashtag}
                          onClick={() => handleHashtagClick(hashtag.tag)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}


              {activeTab === 'users' && (
                <>
                  {results.users.length > 0 ? (
                    results.users.map(user => (
                      <UserResult
                        key={user.user_id}
                        user={user}
                        onClick={() => handleUserClick(user.user_id)}
                      />
                    ))
                  ) : (
                    <EmptyState query={query} hasSearched={true} />
                  )}
                </>
              )}


              {activeTab === 'hashtags' && (
                <>
                  {results.hashtags.length > 0 ? (
                    results.hashtags.map(hashtag => (
                      <HashtagResult
                        key={hashtag.tag}
                        hashtag={hashtag}
                        onClick={() => handleHashtagClick(hashtag.tag)}
                      />
                    ))
                  ) : (
                    <EmptyState query={query} hasSearched={true} />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



const styles = {
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 4, display: 'flex', alignItems: 'center',
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 12,
    backgroundColor: '#efefef', borderRadius: 8, padding: '8px 12px',
  },
  searchInput: {
    flex: 1, border: 'none', background: 'none', outline: 'none',
    fontSize: 16, color: '#262626', fontFamily: 'inherit',
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: 0, display: 'flex', alignItems: 'center',
  },
  tabs: {
    display: 'flex', borderBottom: '1px solid #dbdbdb',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1, background: 'none', border: 'none',
    padding: '16px 0', fontSize: 14, fontWeight: '600',
    cursor: 'pointer', transition: 'color 0.2s',
    marginBottom: -1,
  },
  sectionHeader: {
    padding: '12px 16px 8px',
    fontSize: 14, fontWeight: '600', color: '#8e8e8e',
    backgroundColor: '#fafafa',
  },
  resultItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', cursor: 'pointer',
    borderBottom: '1px solid #efefef',
    transition: 'background 0.1s',
  },
  username: {
    fontSize: 14, fontWeight: '600', color: '#262626',
    display: 'flex', alignItems: 'center', gap: 4,
  },
  verifiedBadge: {
    fontSize: 14, color: '#0095f6',
  },
  subtitle: {
    fontSize: 13, color: '#8e8e8e',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  hashIconContainer: {
    width: 44, height: 44, borderRadius: '50%',
    border: '1.5px solid #dbdbdb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  hashtagName: {
    fontSize: 14, fontWeight: '600', color: '#262626',
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