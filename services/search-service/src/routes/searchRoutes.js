const express = require('express');
const router = express.Router();
const {
  searchAll,
  searchUsers,
  searchHashtags,
  searchPosts,
  autocomplete,
  getTrending
} = require('../controllers/searchController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

// Main search endpoints
router.get('/', searchAll);
router.get('/users', searchUsers);
router.get('/hashtags', searchHashtags);
router.get('/posts', searchPosts);

// Utility endpoints
router.get('/autocomplete', autocomplete);
router.get('/trending', getTrending);

module.exports = router;