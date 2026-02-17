const express = require('express');
const router = express.Router();
const {
  getHomeFeed,
  getExploreFeed,
  getUserFeed,
  clearUserCache
} = require('../controllers/feedController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/home', getHomeFeed);
router.get('/explore', getExploreFeed);
router.get('/user/:user_id', getUserFeed);
router.delete('/cache', authenticateUser, clearUserCache)

module.exports = router;