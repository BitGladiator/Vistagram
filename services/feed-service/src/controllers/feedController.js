const { queryPosts, querySocial, queryUsers } = require('../config/database');
const redis = require('../config/redis');
const { rankPosts } = require('../services/rankingService');

const FEED_PAGE_SIZE = parseInt(process.env.FEED_PAGE_SIZE) || 20;
const CELEBRITY_THRESHOLD = parseInt(process.env.CELEBRITY_THRESHOLD) || 10000;
const CACHE_TTL = parseInt(process.env.REDIS_TTL) || 300;

// ── Helper: enrich posts with username from users DB ──────────────────────────
const enrichPostsWithUsernames = async (posts) => {
  if (!posts || posts.length === 0) return posts;
  const uniqueUserIds = [...new Set(posts.map(p => p.user_id))];
  try {
    const result = await queryUsers(
      `SELECT user_id, username FROM users WHERE user_id = ANY($1)`,
      [uniqueUserIds]
    );
    const usernameMap = {};
    result.rows.forEach(r => { usernameMap[r.user_id] = r.username; });
    return posts.map(p => ({ ...p, username: usernameMap[p.user_id] || 'user' }));
  } catch (err) {
    console.error('Failed to enrich posts with usernames:', err.message);
    // Return posts without crashing — username will be missing but feed still shows
    return posts;
  }
};

// ── Helper: enrich posts with is_liked from social DB ─────────────────────────
const enrichPostsWithLikes = async (posts, userId) => {
  if (!posts || posts.length === 0 || !userId) return posts;
  const postIds = posts.map(p => p.post_id);
  try {
    const result = await querySocial(
      `SELECT post_id FROM likes WHERE user_id = $1 AND post_id = ANY($2)`,
      [userId, postIds]
    );
    const likedPostIds = new Set(result.rows.map(r => r.post_id));
    return posts.map(p => ({
      ...p,
      is_liked: likedPostIds.has(p.post_id)
    }));
  } catch (err) {
    console.error('Failed to enrich posts with likes:', err.message);
    return posts.map(p => ({ ...p, is_liked: false }));
  }
};

// ── Helper: clear all cache for a user ───────────────────────────────────────
const clearCacheForUser = async (user_id) => {
  const keysToDelete = [
    `feed:home:${user_id}`,
    `feed:explore:${user_id}`,
  ];

  // Clear user-specific feed pages
  for (let page = 1; page <= 10; page++) {
    keysToDelete.push(`feed:user:${user_id}:${page}`);
  }

  await Promise.all(keysToDelete.map(key => redis.del(key)));

  // Clear ALL explore feeds (since new post could appear in anyone's explore feed)
  await redis.delPattern('feed:explore:*');

  console.log(`Cache cleared for user: ${user_id} (${keysToDelete.length} keys + all explore feeds)`);
};

// Get home feed for a user
const getHomeFeed = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || FEED_PAGE_SIZE;
    const offset = (page - 1) * limit;

    // Check Redis cache (only for first page)
    const cacheKey = `feed:home:${user_id}`;
    if (page === 1) {
      const cachedFeed = await redis.get(cacheKey);
      if (cachedFeed) {
        console.log(`Cache HIT for feed: ${user_id}`);
        const enrichedFeed = await enrichPostsWithLikes(cachedFeed.slice(0, limit), user_id);
        return res.status(200).json({
          status: 'success',
          data: {
            posts: enrichedFeed,
            pagination: { page, limit, has_more: cachedFeed.length > limit },
            source: 'cache'
          },
          meta: { timestamp: new Date().toISOString() }
        });
      }
    }

    console.log(`Cache MISS for feed: ${user_id}, generating...`);

    // Get users that this user follows
    const followingResult = await querySocial(
      `SELECT followee_id FROM follows WHERE follower_id = $1`,
      [user_id]
    );

    if (followingResult.rows.length === 0) {
      return getExploreFeed(req, res, next);
    }

    const followingIds = followingResult.rows.map(r => r.followee_id);

    const postsResult = await queryPosts(
      `SELECT DISTINCT ON (p.post_id)
        p.post_id, p.user_id, p.caption, p.location,
        p.like_count, p.comment_count, p.created_at,
        pm.media_url, pm.thumbnail_url, pm.media_type
       FROM posts p
       LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.order_index = 0
       WHERE p.user_id = ANY($1)
         AND p.is_deleted = false
         AND p.created_at > NOW() - INTERVAL '30 days'
       ORDER BY p.post_id, p.created_at DESC
       LIMIT 100`,
      [followingIds]
    );
    let posts = postsResult.rows;

    if (posts.length === 0) {
      return getExploreFeed(req, res, next);
    }

    const interactionResult = await querySocial(
      `SELECT COUNT(*) as total_likes FROM likes WHERE user_id = $1`,
      [user_id]
    );

    const totalInteractions = interactionResult.rows[0]?.total_likes || 0;

    let rankedPosts = rankPosts(posts, {
      totalInteractions,
      userPreferences: null
    });

    // Enrich with usernames
    rankedPosts = await enrichPostsWithUsernames(rankedPosts);

    if (page === 1) {
      await redis.set(cacheKey, rankedPosts, CACHE_TTL);
      console.log(`Cached feed for user: ${user_id} (TTL: ${CACHE_TTL}s)`);
    }

    const paginatedPosts = rankedPosts.slice(offset, offset + limit);
    const enrichedFeed = await enrichPostsWithLikes(paginatedPosts, user_id);

    res.status(200).json({
      status: 'success',
      data: {
        posts: enrichedFeed,
        pagination: {
          page, limit, total: rankedPosts.length, has_more: offset + limit < rankedPosts.length
        },
        source: 'database'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Get explore feed (for discovery)
const getExploreFeed = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || FEED_PAGE_SIZE;
    const offset = (page - 1) * limit;

    const cacheKey = `feed:explore:${user_id}`;
    if (page === 1) {
      const cachedFeed = await redis.get(cacheKey);
      if (cachedFeed) {
        const enrichedFeed = await enrichPostsWithLikes(cachedFeed.slice(0, limit), user_id);
        return res.status(200).json({
          status: 'success',
          data: {
            posts: enrichedFeed,
            pagination: { page, limit, has_more: cachedFeed.length > limit },
            source: 'cache'
          },
          meta: { timestamp: new Date().toISOString() }
        });
      }
    }

    const result = await queryPosts(
      `SELECT DISTINCT ON (p.post_id)
        p.post_id, p.user_id, p.caption, p.location,
        p.like_count, p.comment_count, p.created_at,
        pm.media_url, pm.thumbnail_url, pm.media_type
       FROM posts p
       LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.order_index = 0
       WHERE p.is_deleted = false
         AND p.created_at > NOW() - INTERVAL '30 days'
       ORDER BY p.post_id, (p.like_count + p.comment_count * 2) DESC, p.created_at DESC
       LIMIT 100`,
      []
    );

    const posts = result.rows;
    let rankedPosts = rankPosts(posts);

    // Enrich with usernames
    rankedPosts = await enrichPostsWithUsernames(rankedPosts);

    if (page === 1) {
      await redis.set(cacheKey, rankedPosts, CACHE_TTL);
    }

    const paginatedPosts = rankedPosts.slice(offset, offset + limit);
    const enrichedFeed = await enrichPostsWithLikes(paginatedPosts, user_id);

    res.status(200).json({
      status: 'success',
      data: {
        posts: enrichedFeed,
        pagination: {
          page, limit, total: rankedPosts.length, has_more: offset + limit < rankedPosts.length
        },
        source: 'database'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile feed
const getUserFeed = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || FEED_PAGE_SIZE;
    const offset = (page - 1) * limit;

    const cacheKey = `feed:user:${user_id}:${page}`;
    const cachedFeed = await redis.get(cacheKey);
    let responseData;

    if (cachedFeed) {
      responseData = { ...cachedFeed, source: 'cache' };
    } else {
      const result = await queryPosts(
        `SELECT DISTINCT ON (p.post_id)
          p.post_id, p.user_id, p.caption, p.location,
          p.like_count, p.comment_count, p.created_at,
          pm.media_url, pm.thumbnail_url, pm.media_type
         FROM posts p
         LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.order_index = 0
         WHERE p.user_id = $1 AND p.is_deleted = false
         ORDER BY p.post_id, p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [user_id, limit, offset]
      );

      const countResult = await queryPosts(
        `SELECT COUNT(*) as total FROM posts WHERE user_id = $1 AND is_deleted = false`,
        [user_id]
      );

      responseData = {
        posts: await enrichPostsWithUsernames(result.rows),
        pagination: {
          page, limit,
          total: parseInt(countResult.rows[0].total),
          has_more: offset + limit < parseInt(countResult.rows[0].total)
        },
        source: 'database'
      };

      // Cache without is_liked enrichment since this is shared
      await redis.set(cacheKey, { posts: responseData.posts, pagination: responseData.pagination }, CACHE_TTL * 2);
    }

    // Enrich with likes for the requesting user
    responseData.posts = await enrichPostsWithLikes(responseData.posts, req.userId);

    res.status(200).json({
      status: 'success',
      data: responseData,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// ── Clear cache after user creates a post ────────────────────────────────────
const clearUserCache = async (req, res, next) => {
  try {
    const user_id = req.userId;
    await clearCacheForUser(user_id);
    res.status(200).json({
      status: 'success',
      data: { message: 'Cache cleared successfully' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomeFeed,
  getExploreFeed,
  getUserFeed,
  clearUserCache,
};