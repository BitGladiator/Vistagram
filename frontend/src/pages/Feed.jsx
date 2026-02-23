import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postAPI, socialAPI, storiesAPI } from "../services/api";
import PostModal from "../components/PostModal";
import CreateStory from "../components/CreateStory";
import StoriesViewer from "../components/StoriesViewer";
const HomeIcon = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "#262626" : "none"}
    stroke="#262626"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ExploreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const HeartIcon = ({ filled, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#ed4956" : "none"}
    stroke={filled ? "#ed4956" : "#262626"}
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const ShareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const SaveIcon = ({ filled }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "#262626" : "none"}
    stroke="#262626"
    strokeWidth="2"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Avatar = ({ username, size = 32, hasStory = false }) => {
  const colors = [
    "#f09433",
    "#e6683c",
    "#dc2743",
    "#cc2366",
    "#bc1888",
    "#8a3ab9",
    "#4c68d7",
    "#cd486b",
  ];
  const color = colors[username?.charCodeAt(0) % colors.length] || "#ccc";
  const initials = username?.slice(0, 1).toUpperCase() || "?";

  return (
    <div
      style={{
        width: size + (hasStory ? 4 : 0),
        height: size + (hasStory ? 4 : 0),
        borderRadius: "50%",
        background: hasStory
          ? "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
          : "transparent",
        padding: hasStory ? 2 : 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
          fontWeight: "600",
          color: "#fff",
          border: hasStory ? "2px solid #fff" : "none",
        }}
      >
        {initials}
      </div>
    </div>
  );
};

const StoryItem = ({ username, isOwn = false, onClick }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      minWidth: 66,
    }}
    onClick={onClick}
  >
    <div style={{ position: "relative" }}>
      <Avatar username={username} size={56} hasStory={!isOwn} />
      {isOwn && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: "#0095f6",
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          +
        </div>
      )}
    </div>
    <span
      style={{
        fontSize: 12,
        color: "#262626",
        maxWidth: 66,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      {isOwn ? "Your story" : username}
    </span>
  </div>
);

const PostCard = ({ post, onLike, onPostClick }) => {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [saved, setSaved] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [doubleHeartVisible, setDoubleHeartVisible] = useState(false);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) {
        await socialAPI.unlike(post.post_id);
      } else {
        await socialAPI.like(post.post_id);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleDoubleClick = () => {
    if (!liked) {
      handleLike();
      setDoubleHeartVisible(true);
      setTimeout(() => setDoubleHeartVisible(false), 1000);
    }
  };

  const gradients = [
    "linear-gradient(135deg, #f5af19, #f12711)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    "linear-gradient(135deg, #ffecd2, #fcb69f)",
    "linear-gradient(135deg, #ff9a9e, #fecfef)",
    "linear-gradient(135deg, #667eea, #764ba2)",
  ];
  const gradient =
    gradients[post.post_id?.charCodeAt(0) % gradients.length] || gradients[0];

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #dbdbdb",
        marginBottom: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 4px 8px 12px",
          gap: 10,
        }}
      >
        <Avatar username={post.username || "user"} size={32} hasStory />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#262626",
              cursor: "pointer",
            }}
          >
            {post.username || "user"}
          </div>
          {post.location && (
            <div style={{ fontSize: 12, color: "#262626" }}>
              {post.location}
            </div>
          )}
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
          }}
        >
          <MoreIcon />
        </button>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onDoubleClick={handleDoubleClick}
        onClick={() => onPostClick?.(post.post_id)}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {post.media_url ? (
            <img
              src={post.media_url}
              alt="post"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.8)",
                padding: 20,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 14, fontWeight: "500" }}>
                {post.username}
              </div>
            </div>
          )}
        </div>

        {doubleHeartVisible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "heartPop 1s ease forwards",
              pointerEvents: "none",
            }}
          >
            <HeartIcon filled size={80} />
          </div>
        )}
      </div>

      <div style={{ padding: "6px 12px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 4,
          }}
        >
          <button
            onClick={handleLike}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 6px 6px 0",
              transform: isLiking ? "scale(0.85)" : "scale(1)",
              transition: "transform 0.1s",
            }}
          >
            <HeartIcon filled={liked} />
          </button>

          <button
            onClick={() => setShowComment(!showComment)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
            }}
          >
            <CommentIcon />
          </button>

          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
            }}
          >
            <ShareIcon />
          </button>

          <button
            onClick={() => setSaved(!saved)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              marginLeft: "auto",
            }}
          >
            <SaveIcon filled={saved} />
          </button>
        </div>

        {likeCount > 0 && (
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#262626",
              marginBottom: 4,
            }}
          >
            {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
          </div>
        )}

        {post.caption && (
          <div
            style={{
              fontSize: 14,
              color: "#262626",
              marginBottom: 4,
              lineHeight: "18px",
            }}
          >
            <span style={{ fontWeight: "600", marginRight: 6 }}>
              {post.username}
            </span>
            {post.caption}
          </div>
        )}

        {post.comment_count > 0 && (
          <div
            style={{
              fontSize: 14,
              color: "#8e8e8e",
              marginBottom: 4,
              cursor: "pointer",
            }}
          >
            View all {post.comment_count} comments
          </div>
        )}

        <div
          style={{
            fontSize: 10,
            color: "#8e8e8e",
            textTransform: "uppercase",
            letterSpacing: "0.2px",
            marginBottom: 8,
          }}
        >
          {timeAgo(post.created_at)}
        </div>
      </div>

      {showComment && (
        <div
          style={{
            borderTop: "1px solid #dbdbdb",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "#262626",
              backgroundColor: "transparent",
            }}
          />
          {comment && (
            <button
              style={{
                background: "none",
                border: "none",
                color: "#0095f6",
                fontWeight: "600",
                fontSize: 14,
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  await socialAPI.comment(post.post_id, { content: comment });
                  setComment("");
                  setShowComment(false);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Post
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const SuggestedUser = ({ username, subtitle }) => {
  const [following, setFollowing] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <Avatar username={username} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: "#262626",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {username}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#8e8e8e",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </div>
      </div>
      <button
        onClick={() => setFollowing(!following)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: following ? "#262626" : "#0095f6",
          fontSize: 13,
          fontWeight: "600",
          flexShrink: 0,
        }}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [stories, setStories] = useState([]);
  const [showStoriesViewer, setShowStoriesViewer] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [selectedStoryUser, setSelectedStoryUser] = useState(0);

  const storyUsers = [
    "bob",
    "charlie",
    "diana",
    "eve",
    "frank",
    "grace",
    "henry",
  ];
  const suggestedUsers = [
    { username: "photography_lover", subtitle: "Suggested for you" },
    { username: "travel_diary", subtitle: "Follows you" },
    { username: "food_vibes", subtitle: "Suggested for you" },
    { username: "street_art_daily", subtitle: "New to Vistagram" },
    { username: "nature_snaps", subtitle: "Suggested for you" },
  ];

  const loadPosts = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await postAPI.getFeed({ page: pageNum + 1, limit: 10 });
      const newPosts = res.data?.data?.posts || res.data?.posts || [];
      if (pageNum === 0) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setHasMore(newPosts.length === 10);
    } catch (err) {
      setError("Failed to load feed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  const loadStories = useCallback(async () => {
    try {
      const res = await storiesAPI.getFeed();
      setStories(res.data?.data?.stories || []);
    } catch (err) {
      console.error("Failed to load stories:", err);
    }
  }, []);

  useEffect(() => {
    loadPosts(0);
    loadStories();
  }, [loadPosts, loadStories]);

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <style>{`
        @keyframes heartPop {
          0% { opacity: 0; transform: scale(0.5); }
          15% { opacity: 1; transform: scale(1.2); }
          30% { transform: scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "#fff",
          borderBottom: "1px solid #dbdbdb",
          height: 60,
        }}
      >
        <div
          style={{
            maxWidth: 935,
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
              fontSize: 28,
              fontWeight: "400",
              color: "#262626",
              cursor: "pointer",
            }}
          >
            Vistagram
          </h1>

          <button
            onClick={() => navigate("/search")}
            style={{
              flex: 1,
              maxWidth: 268,
              margin: "0 32px",
              backgroundColor: "#efefef",
              borderRadius: 8,
              padding: "7px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            <SearchIcon />
            <span
              style={{
                fontSize: 14,
                color: "#8e8e8e",
              }}
            >
              Search
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <HomeIcon filled />
            </button>
            <button
              onClick={() => navigate("/explore")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <ExploreIcon />
            </button>
            <button
              onClick={() => navigate("/create")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <PlusIcon />
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <HeartIcon />
            </button>
            <button
              onClick={() => navigate("/profile")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
              title="Profile"
            >
              <Avatar username={user?.username} size={24} />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 935,
          margin: "0 auto",
          display: "flex",
          gap: 28,
          padding: "24px 20px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, maxWidth: 614, minWidth: 0 }}>
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #dbdbdb",
              borderRadius: 3,
              padding: "16px 0",
              marginBottom: 24,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                padding: "0 16px",
                width: "max-content",
              }}
            >
              <StoryItem
                username={user?.username}
                isOwn
                onClick={() => setShowCreateStory(true)}
              />
              {stories.map((storyGroup, idx) => (
                <StoryItem
                  key={storyGroup.user_id}
                  username={storyGroup.username}
                  onClick={() => {
                    setSelectedStoryUser(idx);
                    setShowStoriesViewer(true);
                  }}
                />
              ))}
            </div>
          </div>

          {loading && posts.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #dbdbdb",
                  borderRadius: 3,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    className="shimmer"
                    style={{ width: 32, height: 32, borderRadius: "50%" }}
                  />
                  <div
                    className="shimmer"
                    style={{ width: 120, height: 14, borderRadius: 4 }}
                  />
                </div>
                <div
                  className="shimmer"
                  style={{ width: "100%", paddingBottom: "100%" }}
                />
                <div style={{ padding: 12 }}>
                  <div
                    className="shimmer"
                    style={{
                      width: 80,
                      height: 14,
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    className="shimmer"
                    style={{ width: "60%", height: 14, borderRadius: 4 }}
                  />
                </div>
              </div>
            ))
          ) : error ? (
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #dbdbdb",
                borderRadius: 3,
                padding: 40,
                textAlign: "center",
              }}
            >
              <p style={{ color: "#8e8e8e", marginBottom: 16 }}>{error}</p>
              <button
                onClick={() => loadPosts(0)}
                style={{
                  backgroundColor: "#0095f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #dbdbdb",
                borderRadius: 3,
                padding: 60,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📸</div>
              <h3 style={{ color: "#262626", marginBottom: 8 }}>
                No posts yet
              </h3>
              <p style={{ color: "#8e8e8e", fontSize: 14 }}>
                Follow people to see their posts here
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <div key={post.post_id} style={{ marginBottom: 24 }}>
                  <PostCard
                    post={post}
                    onPostClick={(postId) => setSelectedPostId(postId)}
                  />
                </div>
              ))}

              {hasMore && (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <button
                    onClick={() => {
                      setPage((p) => p + 1);
                      loadPosts(page + 1);
                    }}
                    disabled={loading}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#0095f6",
                      fontWeight: "600",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ width: 293, flexShrink: 0, position: "sticky", top: 84 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <Avatar username={user?.username} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#262626",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.username}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#8e8e8e",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.full_name}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                color: "#0095f6",
                fontSize: 12,
                fontWeight: "600",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Log out
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: "600", color: "#8e8e8e" }}>
              Suggested for you
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                fontWeight: "600",
                color: "#262626",
                cursor: "pointer",
              }}
            >
              See All
            </button>
          </div>

          {suggestedUsers.map((u) => (
            <SuggestedUser
              key={u.username}
              username={u.username}
              subtitle={u.subtitle}
            />
          ))}

          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 11, color: "#c7c7c7", lineHeight: "16px" }}>
              About · Help · Press · API · Jobs · Privacy · Terms · Locations ·
              Top Accounts · Hashtags · Language
            </p>
            <p style={{ fontSize: 11, color: "#c7c7c7", marginTop: 8 }}>
              © 2026 VISTAGRAM
            </p>
          </div>
        </div>
      </div>

      {/* Modals rendered at root level so position:fixed works correctly */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
      {showStoriesViewer && (
        <StoriesViewer
          stories={stories}
          initialUserIndex={selectedStoryUser}
          onClose={() => setShowStoriesViewer(false)}
        />
      )}
      {showCreateStory && (
        <CreateStory
          onClose={() => setShowCreateStory(false)}
          onSuccess={() => {
            loadStories();
          }}
        />
      )}
    </div>
  );
}
