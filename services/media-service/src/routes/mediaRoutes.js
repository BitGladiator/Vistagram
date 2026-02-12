const express = require('express');
const router = express.Router();
const {
  uploadImage,
  getUploadUrl,
  getMedia,
  getPostMedia
} = require('../controllers/mediaController');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require auth
router.use(authenticateUser);

// Upload image directly
router.post('/upload', upload.single('image'), uploadImage);

// Get presigned URL for direct upload
router.post('/upload-url', getUploadUrl);

// Get media
router.get('/:media_id', getMedia);
router.get('/post/:post_id', getPostMedia);

module.exports = router;