const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    createStory,
    getStoriesFeed,
    getUserStories,
    markStoryViewed,
    deleteStory,
    getStoryViewers
} = require('../controllers/storiesController');

router.post('/', authenticateToken, createStory);
router.get('/feed', authenticateToken, getStoriesFeed);
router.get('/user/:user_id', authenticateToken, getUserStories);
router.post('/:story_id/view', authenticateToken, markStoryViewed);
router.delete('/:story_id', authenticateToken, deleteStory);
router.get('/:story_id/viewers', authenticateToken, getStoryViewers);

module.exports = router;
