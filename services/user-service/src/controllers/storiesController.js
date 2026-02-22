const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create a new story
const createStory = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { media_url, thumbnail_url, media_type = 'image', duration_seconds = 5 } = req.body;

    if (!media_url) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'media_url is required'
        }
      });
    }

    const story_id = uuidv4();
    const result = await query(
      `INSERT INTO stories (story_id, user_id, media_url, thumbnail_url, media_type, duration_seconds, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '24 hours')
       RETURNING *`,
      [story_id, user_id, media_url, thumbnail_url, media_type, duration_seconds]
    );

    res.status(201).json({
      status: 'success',
      data: { story: result.rows[0] },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Get stories from users you follow (feed)
const getStoriesFeed = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;

    // Return all active stories (own + everyone's), ordered by unviewed first
    // Note: follows table is in a separate DB (social-service), so we can't join it here.
    const result = await query(
      `SELECT 
        s.story_id, s.user_id, s.media_url, s.thumbnail_url, 
        s.media_type, s.duration_seconds, s.view_count, s.created_at, s.expires_at,
        u.username, u.full_name,
        EXISTS(SELECT 1 FROM story_views WHERE story_id = s.story_id AND viewer_id = $1) as is_viewed
       FROM stories s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.expires_at > NOW()
       AND s.is_deleted = false
       ORDER BY is_viewed ASC, s.created_at DESC`,
      [user_id]
    );

    // Group by user
    const storyMap = {};
    result.rows.forEach(story => {
      if (!storyMap[story.user_id]) {
        storyMap[story.user_id] = {
          user_id: story.user_id,
          username: story.username,
          full_name: story.full_name,
          has_unviewed: false,
          stories: []
        };
      }
      storyMap[story.user_id].stories.push(story);
      if (!story.is_viewed) {
        storyMap[story.user_id].has_unviewed = true;
      }
    });

    const stories = Object.values(storyMap);

    res.status(200).json({
      status: 'success',
      data: { stories },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};


// Get a user's stories
const getUserStories = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const viewer_id = req.user.user_id;

    const result = await query(
      `SELECT 
        s.*,
        u.username, u.full_name,
        EXISTS(SELECT 1 FROM story_views WHERE story_id = s.story_id AND viewer_id = $2) as is_viewed
       FROM stories s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.user_id = $1
       AND s.expires_at > NOW()
       AND s.is_deleted = false
       ORDER BY s.created_at ASC`,
      [user_id, viewer_id]
    );

    res.status(200).json({
      status: 'success',
      data: { stories: result.rows },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Mark story as viewed
const markStoryViewed = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const viewer_id = req.user.user_id;

    // Insert view (ignore if already viewed due to UNIQUE constraint)
    await query(
      `INSERT INTO story_views (story_id, viewer_id, viewed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (story_id, viewer_id) DO NOTHING`,
      [story_id, viewer_id]
    );

    // Update view count
    await query(
      `UPDATE stories SET view_count = view_count + 1 WHERE story_id = $1`,
      [story_id]
    );

    res.status(200).json({
      status: 'success',
      data: { message: 'Story marked as viewed' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Delete story
const deleteStory = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const user_id = req.user.user_id;

    // Check ownership
    const check = await query(
      `SELECT user_id FROM stories WHERE story_id = $1 AND is_deleted = false`,
      [story_id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' }
      });
    }

    if (check.rows[0].user_id !== user_id) {
      return res.status(403).json({
        status: 'error',
        error: { code: 'FORBIDDEN', message: 'You can only delete your own stories' }
      });
    }

    await query(
      `UPDATE stories SET is_deleted = true WHERE story_id = $1`,
      [story_id]
    );

    res.status(200).json({
      status: 'success',
      data: { message: 'Story deleted successfully' },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

// Get story viewers
const getStoryViewers = async (req, res, next) => {
  try {
    const { story_id } = req.params;
    const user_id = req.user.user_id;

    // Check ownership
    const check = await query(
      `SELECT user_id FROM stories WHERE story_id = $1`,
      [story_id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'STORY_NOT_FOUND', message: 'Story not found' }
      });
    }

    if (check.rows[0].user_id !== user_id) {
      return res.status(403).json({
        status: 'error',
        error: { code: 'FORBIDDEN', message: 'You can only view your own story viewers' }
      });
    }

    const result = await query(
      `SELECT u.user_id, u.username, u.full_name, sv.viewed_at
       FROM story_views sv
       JOIN users u ON sv.viewer_id = u.user_id
       WHERE sv.story_id = $1
       ORDER BY sv.viewed_at DESC`,
      [story_id]
    );

    res.status(200).json({
      status: 'success',
      data: { viewers: result.rows },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStory,
  getStoriesFeed,
  getUserStories,
  markStoryViewed,
  deleteStory,
  getStoryViewers
};