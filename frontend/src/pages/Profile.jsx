import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI, postAPI, socialAPI } from "../services/api";
import PostModal from "../components/PostModal";

const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const GridIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? "#262626" : "none"}
    stroke="#262626"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const TaggedIcon = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#262626" : "#8e8e8e"}
    strokeWidth="1.5"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#262626"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="white"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="white"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const Avatar = ({ username, size = 80 }) => {
  const colors = [
    "#f09433",
    "#e6683c",
    "#dc2743",
    "#cc2366",
    "#bc1888",
    "#8a3ab9",
    "#4c68d7",
  ];
  const color = colors[username?.charCodeAt(0) % colors.length] || "#ccc";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`,
        padding: 3,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.38,
          fontWeight: "600",
          color: "#fff",
          border: "3px solid #fff",
        }}
      >
        {username?.slice(0, 1).toUpperCase()}
      </div>
    </div>
  );
};

const StatItem = ({ value, label }) => (
  <div style={{ textAlign: "center", flex: 1 }}>
    <div style={{ fontSize: 18, fontWeight: "600", color: "#262626" }}>
      {Number(value || 0).toLocaleString()}
    </div>
    <div style={{ fontSize: 14, color: "#262626" }}>{label}</div>
  </div>
);

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

const PostGridItem = ({ post, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const gradient =
    gradients[post.post_id?.charCodeAt(0) % gradients.length] || gradients[0];

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        cursor: "pointer",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: post.media_url ? "none" : gradient,
          backgroundColor: "#efefef",
        }}
      >
        {post.media_url && (
          <img
            src={post.media_url}
            alt="post"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#fff",
            }}
          >
            <HeartIcon />
            <span style={{ fontWeight: "600", fontSize: 16, color: "#fff" }}>
              {post.like_count || 0}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CommentIcon />
            <span style={{ fontWeight: "600", fontSize: 16, color: "#fff" }}>
              {post.comment_count || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const Skeleton = ({ width, height, borderRadius = 4 }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background:
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }}
  />
);

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

  // Determine whose profile to show
  const profileId = userId || currentUser?.user_id;
  const isOwnProfile = profileId === currentUser?.user_id;

  useEffect(() => {
    if (!profileId) return;
    loadProfile();
    loadPosts();
  }, [profileId, location.state?.refresh]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile(profileId);
      const profileData = res.data?.data?.user || res.data?.user;
      setProfile(profileData);
      setStats((s) => ({
        ...s,
        followers: profileData?.followers_count || 0,
        following: profileData?.following_count || 0,
      }));
      setFollowing(profileData?.is_following || false);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await postAPI.getUserPosts(profileId);
      const postsData = res.data?.data?.posts || res.data?.posts || [];
      setPosts(postsData);
      const total = res.data?.data?.pagination?.total ?? postsData.length;
      setStats((s) => ({ ...s, posts: total }));
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setStats((s) => ({
      ...s,
      followers: wasFollowing ? s.followers - 1 : s.followers + 1,
    }));
    try {
      if (wasFollowing) {
        await socialAPI.unfollow(profileId);
      } else {
        await socialAPI.follow(profileId);
      }
    } catch {
      setFollowing(wasFollowing);
      setStats((s) => ({
        ...s,
        followers: wasFollowing ? s.followers + 1 : s.followers - 1,
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
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
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <BackIcon />
          </button>
          <h1
            style={{
              fontFamily: "'Billabong', 'Dancing Script', cursive, serif",
              fontSize: 28,
              fontWeight: "400",
              color: "#262626",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Vistagram
          </h1>
          {isOwnProfile ? (
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <SettingsIcon />
            </button>
          ) : (
            <div style={{ width: 32 }} />
          )}
        </div>
      </div>

      <div style={{ maxWidth: 935, margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 80,
            padding: "40px 0 24px",
          }}
        >
          {loading ? (
            <Skeleton width={150} height={150} borderRadius="50%" />
          ) : (
            <Avatar
              username={profile?.username || currentUser?.username}
              size={150}
            />
          )}

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {loading ? (
                <Skeleton width={150} height={28} />
              ) : (
                <h2
                  style={{ fontSize: 28, fontWeight: "300", color: "#262626" }}
                >
                  {profile?.username || currentUser?.username}
                </h2>
              )}

              {isOwnProfile ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => navigate("/accounts/edit")}
                    style={styles.outlineBtn}
                  >
                    Edit profile
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      ...styles.outlineBtn,
                      color: "#ed4956",
                      borderColor: "#ed4956",
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    style={{
                      ...styles.followBtn,
                      backgroundColor: following ? "#fff" : "#0095f6",
                      color: following ? "#262626" : "#fff",
                      border: following ? "1px solid #dbdbdb" : "none",
                    }}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                  <button style={styles.outlineBtn}>Message</button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 40, marginBottom: 20 }}>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <Skeleton key={i} width={80} height={40} />
                ))
              ) : (
                <>
                  <div>
                    <span style={styles.statNum}>{stats.posts}</span>
                    <span style={styles.statLabel}> posts</span>
                  </div>
                  <div style={{ cursor: "pointer" }}>
                    <span style={styles.statNum}>
                      {stats.followers.toLocaleString()}
                    </span>
                    <span style={styles.statLabel}> followers</span>
                  </div>
                  <div style={{ cursor: "pointer" }}>
                    <span style={styles.statNum}>
                      {stats.following.toLocaleString()}
                    </span>
                    <span style={styles.statLabel}> following</span>
                  </div>
                </>
              )}
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width={200} height={16} />
                <Skeleton width={150} height={16} />
              </div>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#262626",
                    marginBottom: 4,
                  }}
                >
                  {profile?.full_name || currentUser?.full_name}
                </p>
                {profile?.bio && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#262626",
                      lineHeight: "18px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {profile.bio}
                  </p>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 14,
                      color: "#00376b",
                      fontWeight: "600",
                    }}
                  >
                    {profile.website}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "none",
            borderTop: "1px solid #dbdbdb",
            borderBottom: "1px solid #dbdbdb",
            padding: "12px 0",
            marginBottom: 8,
          }}
        >
          <StatItem value={stats.posts} label="posts" />
          <StatItem value={stats.followers} label="followers" />
          <StatItem value={stats.following} label="following" />
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid #dbdbdb",
            marginTop: 8,
          }}
        >
          <button
            onClick={() => setActiveTab("grid")}
            style={{
              ...styles.tab,
              borderTop:
                activeTab === "grid"
                  ? "1px solid #262626"
                  : "1px solid transparent",
              color: activeTab === "grid" ? "#262626" : "#8e8e8e",
            }}
          >
            <GridIcon active={activeTab === "grid"} />
            <span>POSTS</span>
          </button>
          <button
            onClick={() => setActiveTab("tagged")}
            style={{
              ...styles.tab,
              borderTop:
                activeTab === "tagged"
                  ? "1px solid #262626"
                  : "1px solid transparent",
              color: activeTab === "tagged" ? "#262626" : "#8e8e8e",
            }}
          >
            <TaggedIcon active={activeTab === "tagged"} />
            <span>TAGGED</span>
          </button>
        </div>

        {activeTab === "grid" && (
          <>
            {postsLoading ? (
              <div style={styles.grid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ aspectRatio: "1" }}>
                    <Skeleton width="100%" height="100%" borderRadius={0} />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📷</div>
                {isOwnProfile ? (
                  <>
                    <h3 style={styles.emptyTitle}>Share Photos</h3>
                    <p style={styles.emptyText}>
                      When you share photos, they will appear on your profile.
                    </p>
                    <button
                      onClick={() => navigate("/create")}
                      style={styles.shareFirstBtn}
                    >
                      Share your first photo
                    </button>
                  </>
                ) : (
                  <>
                    <h3 style={styles.emptyTitle}>No Posts Yet</h3>
                    <p style={styles.emptyText}>
                      When they share photos, you'll see them here.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div style={styles.grid}>
                {posts.map((post) => (
                  <PostGridItem
                    key={post.post_id}
                    post={post}
                    onClick={() => setSelectedPostId(post.post_id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "tagged" && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏷️</div>
            <h3 style={styles.emptyTitle}>Photos of you</h3>
            <p style={styles.emptyText}>
              When people tag you in photos, they'll appear here.
            </p>
          </div>
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
  outlineBtn: {
    padding: "7px 16px",
    backgroundColor: "#fff",
    border: "1px solid #dbdbdb",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    cursor: "pointer",
  },
  followBtn: {
    padding: "7px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
  },
  statNum: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  statLabel: {
    fontSize: 16,
    color: "#262626",
  },
  tab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "16px 0",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: "1px",
    marginTop: -1,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 3,
    marginTop: 3,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    gap: 12,
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 64,
    width: 96,
    height: 96,
    border: "3px solid #262626",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#262626",
  },
  emptyText: {
    fontSize: 14,
    color: "#262626",
    maxWidth: 280,
  },
  shareFirstBtn: {
    background: "none",
    border: "none",
    color: "#0095f6",
    fontWeight: "600",
    fontSize: 14,
    cursor: "pointer",
    marginTop: 8,
  },
};
