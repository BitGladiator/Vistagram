const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getConnectionStatus
} = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/auth');
// All routes require authentication
router.use(authenticateUser);

router.get('/', getNotifications); // Get user's notifications
router.get('/unread-count', getUnreadCount); // Get unread count
router.get('/connection-status', getConnectionStatus); // Get WebSocket connection status
router.put('/:notification_id/read', markAsRead); // Mark notification as read
router.put('/read-all', markAllAsRead); // Mark all notifications as read

module.exports = router;