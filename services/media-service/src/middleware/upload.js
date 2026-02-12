const multer = require('multer');

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

// Use memory storage (we'll process then upload to MinIO)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
  }
};

// Multer config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

module.exports = upload;