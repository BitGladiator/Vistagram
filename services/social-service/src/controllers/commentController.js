const { query } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');
const { v4: uuidv4 } = require('uuid');

// Create a comment
const createComment = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { post_id } = req.params;
    const { content, parent_comment_id } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Comment content is required'
        }
      });
    }

    if (content.length > 2200) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Comment must be 2200 characters or less'
        }
      });
    }

    const comment_id = uuidv4();

    const result = await query(
      `INSERT INTO comments (comment_id, post_id, user_id, parent_comment_id, content, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING comment_id, post_id, user_id, parent_comment_id, content, created_at`,
      [comment_id, post_id, user_id, parent_comment_id || null, content]
    );

    // Publish event
    await publishEvent('post_commented', {
      comment_id,
      post_id,
      user_id,
      parent_comment_id
    });

    res.status(201).json({
      status: 'success',
      data: {
        comment: result.rows[0]
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get post comments
const getPostComments = async (req, res, next) => {
  try {
    const { post_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Get top-level comments (no parent)
    const result = await query(
      `SELECT comment_id, post_id, user_id, content, like_count, reply_count, created_at
       FROM comments
       WHERE post_id = $1 AND parent_comment_id IS NULL AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [post_id, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM comments 
       WHERE post_id = $1 AND parent_comment_id IS NULL AND is_deleted = false`,
      [post_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        comments: result.rows,
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

// Get comment replies
const getCommentReplies = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const result = await query(
      `SELECT comment_id, post_id, user_id, content, created_at
       FROM comments
       WHERE parent_comment_id = $1 AND is_deleted = false
       ORDER BY created_at ASC
       LIMIT $2`,
      [comment_id, limit]
    );

    res.status(200).json({
      status: 'success',
      data: {
        replies: result.rows
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a comment
const deleteComment = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { comment_id } = req.params;

    // Check if comment belongs to user
    const checkResult = await query(
      `SELECT user_id FROM comments WHERE comment_id = $1 AND is_deleted = false`,
      [comment_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Comment not found'
        }
      });
    }

    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments'
        }
      });
    }

    // Soft delete
    await query(
      `UPDATE comments 
       SET is_deleted = true, deleted_at = NOW()
       WHERE comment_id = $1`,
      [comment_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Comment deleted successfully'
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
  createComment,
  getPostComments,
  getCommentReplies,
  deleteComment
};