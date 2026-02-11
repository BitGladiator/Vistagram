const { query } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');
const { v4: uuidv4 } = require('uuid');

// Like a post
const likePost = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { post_id } = req.params;

    const like_id = uuidv4();

    await query(
      `INSERT INTO likes (like_id, user_id, post_id, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [like_id, user_id, post_id]
    );

    // Publish event for notifications
    await publishEvent('post_liked', {
      user_id,
      post_id,
      like_id
    });

    res.status(201).json({
      status: 'success',
      data: {
        message: 'Post liked successfully',
        like_id
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Unlike a post
const unlikePost = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { post_id } = req.params;

    const result = await query(
      `DELETE FROM likes 
       WHERE user_id = $1 AND post_id = $2
       RETURNING like_id`,
      [user_id, post_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Like not found'
        }
      });
    }

    // Publish event
    await publishEvent('post_unliked', {
      user_id,
      post_id
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Post unliked successfully'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get post likes
const getPostLikes = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT user_id, created_at
       FROM likes
       WHERE post_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [post_id, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM likes WHERE post_id = $1`,
      [post_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        likes: result.rows,
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

// Check if user liked post
const checkLiked = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { post_id } = req.params;

    const result = await query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
      [user_id, post_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        is_liked: result.rows.length > 0
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
  likePost,
  unlikePost,
  getPostLikes,
  checkLiked
};