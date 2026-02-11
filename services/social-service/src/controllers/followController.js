const { query } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');

// Follow a user
const followUser = async (req, res, next) => {
  try {
    const follower_id = req.userId;
    const { followee_id } = req.params;

    // Validation
    if (follower_id === followee_id) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'You cannot follow yourself'
        }
      });
    }

    // Create follow relationship
    await query(
      `INSERT INTO follows (follower_id, followee_id, created_at) 
       VALUES ($1, $2, NOW())`,
      [follower_id, followee_id]
    );

    // Publish event for notifications and feed updates
    await publishEvent('user_followed', {
      follower_id,
      followee_id
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Successfully followed user',
        follower_id,
        followee_id
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Unfollow a user
const unfollowUser = async (req, res, next) => {
  try {
    const follower_id = req.userId;
    const { followee_id } = req.params;

    const result = await query(
      `DELETE FROM follows 
       WHERE follower_id = $1 AND followee_id = $2
       RETURNING follower_id, followee_id`,
      [follower_id, followee_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Follow relationship not found'
        }
      });
    }

    // Publish event
    await publishEvent('user_unfollowed', {
      follower_id,
      followee_id
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Successfully unfollowed user'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's followers
const getFollowers = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT follower_id, created_at
       FROM follows
       WHERE followee_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM follows WHERE followee_id = $1`,
      [user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        followers: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit,
          offset,
          has_more: offset + limit < parseInt(countResult.rows[0].total)
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's following
const getFollowing = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT followee_id, created_at
       FROM follows
       WHERE follower_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM follows WHERE follower_id = $1`,
      [user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        following: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit,
          offset,
          has_more: offset + limit < parseInt(countResult.rows[0].total)
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check if following
const checkFollowing = async (req, res, next) => {
  try {
    const follower_id = req.userId;
    const { user_id } = req.params;

    const result = await query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2`,
      [follower_id, user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        is_following: result.rows.length > 0
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing
};