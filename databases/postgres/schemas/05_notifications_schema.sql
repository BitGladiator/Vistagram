-- Connect to notifications database
\c vistagram_notifications;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notifications table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,  -- Recipient of notification
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'like', 'comment', 'follow', 'mention', 
        'comment_reply', 'follow_request_accepted'
    )),
    from_user_id UUID,  -- User who triggered the notification
    post_id UUID,       -- Related post (if applicable)
    comment_id UUID,    -- Related comment (if applicable)
    content TEXT,       -- Notification message
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Push notification tokens (for mobile)
CREATE TABLE push_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    device_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20) CHECK (device_type IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, device_token)
);

-- Indexes for performance
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type, created_at DESC);
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id, is_active);

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for social interactions';
COMMENT ON TABLE push_tokens IS 'Device tokens for push notifications';