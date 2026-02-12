const express = require('express');
const router = express.Router();
const {
  getHomeFeed,
  getExploreFeed,
  getUserFeed
} = require('../controllers/feedController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/home', getHomeFeed);
router.get('/explore', getExploreFeed);
router.get('/user/:user_id', getUserFeed);

module.exports = router;