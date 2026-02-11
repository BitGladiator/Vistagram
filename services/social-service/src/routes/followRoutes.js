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

router.use(authenticateUser); // All routes require authentication

router.post('/:followee_id', followUser); // POST /api/v1/users/:followee_id/follow
router.delete('/:followee_id', unfollowUser); // DELETE /api/v1/users/:followee_id/follow
router.get('/:user_id/followers', getFollowers); // GET /api/v1/users/:user_id/followers
router.get('/:user_id/following', getFollowing); // GET /api/v1/users/:user_id/following
router.get('/:user_id/check', checkFollowing); // GET /api/v1/users/:user_id/check

module.exports = router;