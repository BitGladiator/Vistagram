// Seeds PostgreSQL data into OpenSearch
require("dotenv").config({
  path: "../../services/search-service/.env",
});

const { Client } = require("@opensearch-project/opensearch");
const { Pool } = require("pg");

const opensearch = new Client({
  node: "http://localhost:9200",
});

// PostgreSQL connections
const usersPool = new Pool({
  host: "localhost",
  port: 5433,
  database: "vistagram_users",
  user: "vistagram",
  password: "vistagram123",
});

const postsPool = new Pool({
  host: "localhost",
  port: 5433,
  database: "vistagram_posts",
  user: "vistagram",
  password: "vistagram123",
});

// Seed users into OpenSearch
const seedUsers = async () => {
  console.log("Seeding users into OpenSearch...");

  const result = await usersPool.query(
    `SELECT user_id, username, full_name, bio, profile_picture_url,
              is_verified, is_private, follower_count, post_count, created_at
       FROM users WHERE is_active = true`
  );

  for (const user of result.rows) {
    await opensearch.index({
      index: "users",
      id: user.user_id,
      body: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        bio: user.bio || "",
        profile_picture_url: user.profile_picture_url || "",
        is_verified: user.is_verified,
        is_private: user.is_private,
        follower_count: user.follower_count,
        post_count: user.post_count,
        created_at: user.created_at,
      },
    });
    console.log(`Indexed user: ${user.username}`);
  }
};

// Seed posts into OpenSearch
const seedPosts = async () => {
  console.log("Seeding posts into OpenSearch...");

  const result = await postsPool.query(
    `SELECT 
        p.post_id, p.user_id, p.caption, p.location,
        p.like_count, p.comment_count, p.created_at,
        pm.media_url, pm.thumbnail_url, pm.media_type,
        ARRAY_AGG(h.tag) FILTER (WHERE h.tag IS NOT NULL) as hashtags
       FROM posts p
       LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.order_index = 0
       LEFT JOIN post_hashtags ph ON p.post_id = ph.post_id
       LEFT JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
       WHERE p.is_deleted = false
       GROUP BY p.post_id, pm.media_url, pm.thumbnail_url, pm.media_type`
  );

  for (const post of result.rows) {
    await opensearch.index({
      index: "posts",
      id: post.post_id,
      body: {
        post_id: post.post_id,
        user_id: post.user_id,
        caption: post.caption || "",
        location: post.location || "",
        hashtags: post.hashtags || [],
        like_count: post.like_count,
        comment_count: post.comment_count,
        media_url: post.media_url || "",
        thumbnail_url: post.thumbnail_url || "",
        media_type: post.media_type || "image",
        is_deleted: false,
        created_at: post.created_at,
      },
    });
    console.log(`Indexed post: ${post.post_id}`);
  }
};

// Seed hashtags into OpenSearch
const seedHashtags = async () => {
  console.log("Seeding hashtags into OpenSearch...");

  const result = await postsPool.query(
    `SELECT hashtag_id, tag, post_count, created_at FROM hashtags`
  );

  for (const hashtag of result.rows) {
    await opensearch.index({
      index: "hashtags",
      id: hashtag.hashtag_id,
      body: {
        hashtag_id: hashtag.hashtag_id,
        tag: hashtag.tag,
        post_count: hashtag.post_count,
        created_at: hashtag.created_at,
      },
    });
    console.log(`Indexed hashtag: #${hashtag.tag}`);
  }
};

// Run seeder
const seed = async () => {
  try {
    console.log("Starting OpenSearch seeder...\n");

    await seedUsers();
    console.log("");

    await seedPosts();
    console.log("");

    await seedHashtags();
    console.log("");

    console.log("OpenSearch seeding complete!");
    console.log("");
    console.log("Test search:");
    console.log("  curl http://localhost:9200/users/_search?q=alice");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();
