const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the 10MB limit'
        }
      });
    }
  
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'INVALID_FILE_TYPE',
          message: err.message
        }
      });
    }
  
    res.status(err.status || 500).json({
      status: 'error',
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  };
  
  module.exports = errorHandler;