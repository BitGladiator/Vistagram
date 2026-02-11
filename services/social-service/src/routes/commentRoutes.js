const express = require('express');
const router = express.Router();
const {
  createComment,
  getPostComments,
  getCommentReplies,
  deleteComment
} = require('../controllers/commentController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/:post_id', createComment); // POST /api/v1/posts/:post_id/comments
router.get('/:post_id', getPostComments); // GET /api/v1/posts/:post_id/comments
router.get('/:comment_id/replies', getCommentReplies); // GET /api/v1/comments/:comment_id/replies
router.delete('/:comment_id', deleteComment); // DELETE /api/v1/comments/:comment_id

module.exports = router;