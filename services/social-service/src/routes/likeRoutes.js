const express = require('express');
const router = express.Router();
const {
  likePost,
  unlikePost,
  getPostLikes,
  checkLiked
} = require('../controllers/likeController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser); // All routes require authentication

router.post('/:post_id', likePost); // POST /api/v1/posts/:post_id/like
router.delete('/:post_id', unlikePost); // DELETE /api/v1/posts/:post_id/like
router.get('/:post_id', getPostLikes); // GET /api/v1/posts/:post_id/likes
router.get('/:post_id/check', checkLiked); // GET /api/v1/posts/:post_id/check

module.exports = router;