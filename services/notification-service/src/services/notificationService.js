const { query } = require('../config/database');
const websocket = require('../config/websocket');
const { v4: uuidv4 } = require('uuid');

// Create and send a notification
const createNotification = async ({
  user_id,
  type,
  from_user_id,
  post_id = null,
  comment_id = null,
  content
}) => {
  try {
    // Save to database
    const notification_id = uuidv4();

    await query(
      `INSERT INTO notifications (
        notification_id, user_id, type, from_user_id,
        post_id, comment_id, content, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [notification_id, user_id, type, from_user_id, post_id, comment_id, content]
    );

    // Send via WebSocket if user is connected
    const notification = {
      type: 'notification',
      data: {
        notification_id,
        type,
        from_user_id,
        post_id,
        comment_id,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      }
    };

    const sent = websocket.sendToUser(user_id, notification);

    console.log(`Notification created: ${type} for user: ${user_id} (WebSocket: ${sent ? 'sent' : 'queued'})`);

    return { notification_id, sent };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Handle: User A followed User B
const handleUserFollowed = async ({ follower_id, followee_id }) => {
  await createNotification({
    user_id: followee_id,
    type: 'follow',
    from_user_id: follower_id,
    content: 'started following you'
  });
};

// Handle: User liked a post
const handlePostLiked = async ({ user_id, post_id }) => {
  try {
    // Get post owner
    // In production, I would call the Post Service API
    // For now, I'll just create the notification with available data
    await createNotification({
      user_id: user_id, // TODO: Replace with post owner's user_id
      type: 'like',
      from_user_id: user_id,
      post_id,
      content: 'liked your post'
    });
  } catch (error) {
    console.error('Error handling post liked:', error);
  }
};

// Handle: User commented on a post
const handlePostCommented = async ({ comment_id, post_id, user_id }) => {
  try {
    await createNotification({
      user_id: user_id, // TODO: Replace with post owner's user_id
      type: 'comment',
      from_user_id: user_id,
      post_id,
      comment_id,
      content: 'commented on your post'
    });
  } catch (error) {
    console.error('Error handling post commented:', error);
  }
};

// Handle: Media uploaded
const handleMediaUploaded = async ({ media_id, post_id, user_id }) => {
  console.log(`📸 Media uploaded: ${media_id} for post: ${post_id}`);
  // Could notify user that their media is ready
  // Or trigger feed update events
};

module.exports = {
  createNotification,
  handleUserFollowed,
  handlePostLiked,
  handlePostCommented,
  handleMediaUploaded
};