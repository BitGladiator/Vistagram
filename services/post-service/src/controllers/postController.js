const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create a new post
const createPost = async (req, res, next) => {
  try {
    const { caption, location } = req.body;
    const user_id = req.userId; // From auth middleware

    // Validation
    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Caption is required'
        }
      });
    }

    if (caption.length > 2200) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Caption must be 2200 characters or less'
        }
      });
    }

    // Create post
    const post_id = uuidv4();
    const result = await query(
      `INSERT INTO posts (post_id, user_id, caption, location, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING post_id, user_id, caption, location, like_count, comment_count, created_at`,
      [post_id, user_id, caption, location || null]
    );

    const post = result.rows[0];

    // TODO: Publish event to message queue (for feed service)
    // TODO: Extract hashtags from caption

    res.status(201).json({
      status: 'success',
      data: {
        post: post
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single post by ID
const getPost = async (req, res, next) => {
  try {
    const { post_id } = req.params;

    const result = await query(
      `SELECT post_id, user_id, caption, location, like_count, comment_count, 
              view_count, is_archived, created_at, updated_at
       FROM posts 
       WHERE post_id = $1 
       AND is_deleted = false`,
      [post_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    const post = result.rows[0];

    // Get post media (if any)
    const mediaResult = await query(
      `SELECT media_id, media_type, media_url, thumbnail_url, width, height, order_index
       FROM post_media
       WHERE post_id = $1
       ORDER BY order_index ASC`,
      [post_id]
    );

    post.media = mediaResult.rows;

    res.status(200).json({
      status: 'success',
      data: {
        post: post
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all posts by a user
const getUserPosts = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT post_id, user_id, caption, location, like_count, comment_count,
              created_at
       FROM posts 
       WHERE user_id = $1 AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM posts WHERE user_id = $1 AND is_deleted = false`,
      [user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        posts: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: limit,
          offset: offset,
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

// Update a post
const updatePost = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const { caption, location } = req.body;
    const user_id = req.userId;

    // Check if post exists and belongs to user
    const checkResult = await query(
      `SELECT user_id FROM posts WHERE post_id = $1 AND is_deleted = false`,
      [post_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit your own posts'
        }
      });
    }

    // Update post
    const result = await query(
      `UPDATE posts 
       SET caption = COALESCE($1, caption),
           location = COALESCE($2, location),
           updated_at = NOW()
       WHERE post_id = $3
       RETURNING post_id, user_id, caption, location, updated_at`,
      [caption, location, post_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        post: result.rows[0]
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a post (soft delete)
const deletePost = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const user_id = req.userId;

    // Check if post exists and belongs to user
    const checkResult = await query(
      `SELECT user_id FROM posts WHERE post_id = $1 AND is_deleted = false`,
      [post_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own posts'
        }
      });
    }

    // Soft delete
    await query(
      `UPDATE posts 
       SET is_deleted = true, deleted_at = NOW()
       WHERE post_id = $1`,
      [post_id]
    );

    // TODO: Publish event to remove from feeds

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Post deleted successfully'
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
  createPost,
  getPost,
  getUserPosts,
  updatePost,
  deletePost
};