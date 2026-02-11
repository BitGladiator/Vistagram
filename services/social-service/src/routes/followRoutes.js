const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing
} = require('../controllers/followController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/:followee_id', followUser);
router.delete('/:followee_id', unfollowUser);
router.get('/:user_id/followers', getFollowers);
router.get('/:user_id/following', getFollowing);
router.get('/:user_id/check', checkFollowing);

module.exports = router;