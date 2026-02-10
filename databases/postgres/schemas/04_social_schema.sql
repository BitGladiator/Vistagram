-- Connect to social database
\c vistagram_social;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at timestamp 
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Follows table (who follows whom)
CREATE TABLE follows (
    follower_id UUID NOT NULL,  -- User who is following
    followee_id UUID NOT NULL,  -- User being followed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    CONSTRAINT no_self_follow CHECK (follower_id != followee_id)
);

-- Likes table
CREATE TABLE likes (
    like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id)
);

-- Comments table
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,  -- for replies
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT content_length CHECK (char_length(content) <= 2200)
);

-- Comment likes (separate from post likes)
CREATE TABLE comment_likes (
    user_id UUID NOT NULL,
    comment_id UUID NOT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id)
);

-- Follow requests (for private accounts)
CREATE TABLE follow_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL,
    followee_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (follower_id, followee_id)
);

-- Blocked users
CREATE TABLE blocks (
    blocker_id UUID NOT NULL,  -- User who blocked
    blocked_id UUID NOT NULL,  -- User being blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- Indexes for performance
CREATE INDEX idx_follows_follower ON follows(follower_id, created_at DESC);
CREATE INDEX idx_follows_followee ON follows(followee_id, created_at DESC);
CREATE INDEX idx_likes_user ON likes(user_id, created_at DESC);
CREATE INDEX idx_likes_post ON likes(post_id, created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id, created_at ASC);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_follow_requests_followee ON follow_requests(followee_id, status);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- Trigger to update comments updated_at
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE follows IS 'User follow relationships';
COMMENT ON TABLE likes IS 'Post likes from users';
COMMENT ON TABLE comments IS 'Comments on posts (supports nested replies)';
COMMENT ON TABLE follow_requests IS 'Pending follow requests for private accounts';
COMMENT ON TABLE blocks IS 'Blocked user relationships';