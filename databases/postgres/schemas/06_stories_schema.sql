-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  story_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT DEFAULT 5,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  is_deleted BOOLEAN DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Story views table (who viewed which story)
CREATE TABLE IF NOT EXISTS story_views (
  view_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (story_id) REFERENCES stories(story_id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE(story_id, viewer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);