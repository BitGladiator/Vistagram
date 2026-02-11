const express = require('express');
const router = express.Router();
const {
  createPost,
  getPost,
  getUserPosts,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

// Post routes
router.post('/', createPost);
router.get('/:post_id', getPost);
router.get('/user/:user_id', getUserPosts);
router.put('/:post_id', updatePost);
router.delete('/:post_id', deletePost);

module.exports = router;