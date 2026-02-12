const { queryPosts, querySocial } = require('../config/database');
const redis = require('../config/redis');
const { rankPosts } = require('../services/rankingService');

const FEED_PAGE_SIZE = parseInt(process.env.FEED_PAGE_SIZE) || 20;
const CELEBRITY_THRESHOLD = parseInt(process.env.CELEBRITY_THRESHOLD) || 10000;
const CACHE_TTL = parseInt(process.env.REDIS_TTL) || 300;

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
        return res.status(200).json({
          status: 'success',
          data: {
            posts: cachedFeed.slice(0, limit),
            pagination: {
              page,
              limit,
              has_more: cachedFeed.length > limit
            },
            source: 'cache'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
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
      // User follows nobody - return explore feed
      return getExploreFeed(req, res, next);
    }

    const followingIds = followingResult.rows.map(r => r.followee_id);

    // Split into regular users and celebrities
    // For simplicity, we'll treat everyone as regular for now
    // TODO: implement celebrity threshold check

    // Fetch posts from followed users (last 7 days)
    const postsResult = await queryPosts(
      `SELECT DISTINCT ON (p.post_id)
        p.post_id, p.user_id, p.caption, p.location,
        p.like_count, p.comment_count, p.created_at,
        pm.media_url, pm.thumbnail_url, pm.media_type
       FROM posts p
       LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.order_index = 0
       WHERE p.user_id = ANY($1)
         AND p.is_deleted = false
         AND p.created_at > NOW() - INTERVAL '7 days'
       ORDER BY p.post_id, p.created_at DESC
       LIMIT 100`,
      [followingIds]
    );
    let posts = postsResult.rows;

    if (posts.length === 0) {
      // No recent posts from followed users
      return getExploreFeed(req, res, next);
    }

    // Get user's interaction data for affinity scores
    const interactionResult = await querySocial(
      `SELECT 
        l.post_id,
        p.user_id as creator_id,
        COUNT(*) as interaction_count
       FROM likes l
       JOIN (
         SELECT post_id, user_id FROM (
           SELECT $1::uuid as post_id, $1::uuid as user_id
         ) t
       ) p ON l.post_id = p.post_id
       WHERE l.user_id = $1
       GROUP BY l.post_id, p.user_id`,
      [user_id]
    );

    const totalInteractions = interactionResult.rows.length;

    // Apply ranking algorithm
    const rankedPosts = rankPosts(posts, {
      totalInteractions,
      userPreferences: null
    });

    // Cache first page
    if (page === 1) {
      await redis.set(cacheKey, rankedPosts, CACHE_TTL);
      console.log(`Cached feed for user: ${user_id} (TTL: ${CACHE_TTL}s)`);
    }

    // Paginate
    const paginatedPosts = rankedPosts.slice(offset, offset + limit);

    res.status(200).json({
      status: 'success',
      data: {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: rankedPosts.length,
          has_more: offset + limit < rankedPosts.length
        },
        source: 'database'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
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

    // Check cache
    const cacheKey = `feed:explore:${user_id}`;
    if (page === 1) {
      const cachedFeed = await redis.get(cacheKey);
      if (cachedFeed) {
        return res.status(200).json({
          status: 'success',
          data: {
            posts: cachedFeed.slice(0, limit),
            pagination: { page, limit, has_more: cachedFeed.length > limit },
            source: 'cache'
          },
          meta: { timestamp: new Date().toISOString() }
        });
      }
    }

    // Get trending posts (most liked in last 48 hours)
    const result = await queryPosts(
      `SELECT DISTINCT ON (p.post_id)
        p.post_id, p.user_id, p.caption, p.location,
        p.like_count, p.comment_count, p.created_at,
        pm.media_url, pm.thumbnail_url, pm.media_type
       FROM posts p
       LEFT JOIN post_media pm ON p.post_id = pm.post_id AND pm.order_index = 0
       WHERE p.is_deleted = false
         AND p.created_at > NOW() - INTERVAL '48 hours'
       ORDER BY p.post_id, (p.like_count + p.comment_count * 2) DESC, p.created_at DESC
       LIMIT 100`,
      []
    );

    const posts = result.rows;

    // Apply ranking
    const rankedPosts = rankPosts(posts);

    // Cache result
    if (page === 1) {
      await redis.set(cacheKey, rankedPosts, CACHE_TTL);
    }

    const paginatedPosts = rankedPosts.slice(offset, offset + limit);

    res.status(200).json({
      status: 'success',
      data: {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: rankedPosts.length,
          has_more: offset + limit < rankedPosts.length
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

    // Check cache
    const cacheKey = `feed:user:${user_id}:${page}`;
    const cachedFeed = await redis.get(cacheKey);
    if (cachedFeed) {
      return res.status(200).json({
        status: 'success',
        data: { ...cachedFeed, source: 'cache' },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    // Get user's posts ordered by newest
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

    const responseData = {
      posts: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        has_more: offset + limit < parseInt(countResult.rows[0].total)
      }
    };

    // Cache result (longer TTL for profile feeds)
    await redis.set(cacheKey, responseData, CACHE_TTL * 2);

    res.status(200).json({
      status: 'success',
      data: { ...responseData, source: 'database' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomeFeed,
  getExploreFeed,
  getUserFeed
};