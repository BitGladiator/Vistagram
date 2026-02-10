-- Connect to posts database
\c vistagram_posts;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at timestamp (needed in this database)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Posts table
CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, 
    caption TEXT,
    location VARCHAR(200),
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);


-- Post media table (supports multiple images/videos per post)
CREATE TABLE post_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    original_url VARCHAR(500),
    feed_url VARCHAR(500),
    width INTEGER,
    height INTEGER,
    file_size BIGINT,
    duration INTEGER,  -- for videos (in seconds)
    order_index INTEGER DEFAULT 0,  -- for multiple images in one post
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_dimensions CHECK (width > 0 AND height > 0)
);

-- Hashtags table
CREATE TABLE hashtags (
    hashtag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag VARCHAR(100) UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tag_format CHECK (tag ~* '^[a-z0-9_]+$')
);

-- Post-Hashtag relationship (many-to-many)
CREATE TABLE post_hashtags (
    post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES hashtags(hashtag_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, hashtag_id)
);

-- Post mentions (tagging users in posts)
CREATE TABLE post_mentions (
    post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL,  -- References users.user_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, mentioned_user_id)
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_deleted ON posts(is_deleted, created_at DESC);
CREATE INDEX idx_post_media_post_id ON post_media(post_id, order_index);
CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_post_count ON hashtags(post_count DESC);
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);
CREATE INDEX idx_post_mentions_user ON post_mentions(mentioned_user_id);

-- Trigger to update post updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE posts IS 'User posts with captions and metadata';
COMMENT ON TABLE post_media IS 'Media files associated with posts';
COMMENT ON TABLE hashtags IS 'Unique hashtags used across platform';
COMMENT ON TABLE post_hashtags IS 'Mapping of hashtags to posts';