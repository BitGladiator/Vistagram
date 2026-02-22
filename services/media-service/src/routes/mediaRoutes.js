const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadStory,
  getUploadUrl,
  getMedia,
  getPostMedia
} = require('../controllers/mediaController');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require auth
router.use(authenticateUser);

// Upload post image
router.post('/upload', upload.single('image'), uploadImage);

// Upload story image (no post_id required)
router.post('/upload-story', upload.single('image'), uploadStory);

// Get presigned URL for direct upload
router.post('/upload-url', getUploadUrl);

// Get media
router.get('/:media_id', getMedia);
router.get('/post/:post_id', getPostMedia);

module.exports = router;