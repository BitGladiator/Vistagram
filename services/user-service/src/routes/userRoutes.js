const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { createStory, getStoriesFeed, getUserStories, markStoryViewed, deleteStory, getStoryViewers } = require('../controllers/storiesController');
// Public routes
router.post('/register', register);
router.post('/login', login);

router.post('/stories', authenticateToken, createStory);
router.get('/stories/feed', authenticateToken, getStoriesFeed);
router.get('/stories/user/:user_id', authenticateToken, getUserStories);
router.post('/stories/:story_id/view', authenticateToken, markStoryViewed);
router.delete('/stories/:story_id', authenticateToken, deleteStory);
router.get('/stories/:story_id/viewers', authenticateToken, getStoryViewers);


// Protected routes
router.get('/:user_id', getProfile);

module.exports = router;