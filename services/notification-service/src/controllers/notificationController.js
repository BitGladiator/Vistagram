const { query } = require('../config/database');
const websocket = require('../config/websocket');

// Get user's notifications
const getNotifications = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await query(
      `SELECT 
        notification_id, type, from_user_id,
        post_id, comment_id, content,
        is_read, created_at, read_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    const countResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread
       FROM notifications
       WHERE user_id = $1`,
      [user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        notifications: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          unread: parseInt(countResult.rows[0].unread),
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

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const user_id = req.userId;
    const { notification_id } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET is_read = true, read_at = NOW()
       WHERE notification_id = $1 AND user_id = $2
       RETURNING notification_id`,
      [notification_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Notification marked as read'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const user_id = req.userId;

    const result = await query(
      `UPDATE notifications 
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false
       RETURNING notification_id`,
      [user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: `Marked ${result.rowCount} notifications as read`
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const user_id = req.userId;

    const result = await query(
      `SELECT COUNT(*) as unread
       FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [user_id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        unread: parseInt(result.rows[0].unread)
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get WebSocket connection status
const getConnectionStatus = async (req, res, next) => {
  try {
    const user_id = req.userId;

    res.status(200).json({
      status: 'success',
      data: {
        connected: websocket.isConnected(user_id),
        active_connections: websocket.getConnectionCount()
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
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getConnectionStatus
};