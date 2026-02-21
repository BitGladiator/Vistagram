const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { createStory, getStoriesFeed, getUserStories, markStoryViewed, deleteStory, getStoryViewers } = require('../controllers/storiesController');
// Public routes
router.post('/register', register);
router.post('/login', login);

router.post('/stories', authenticateUser, createStory);
router.get('/stories/feed', authenticateUser, getStoriesFeed);
router.get('/stories/user/:user_id', authenticateUser, getUserStories);
router.post('/stories/:story_id/view', authenticateUser, markStoryViewed);
router.delete('/stories/:story_id', authenticateUser, deleteStory);
router.get('/stories/:story_id/viewers', authenticateUser, getStoryViewers);


// Protected routes
router.get('/:user_id', getProfile);

module.exports = router;