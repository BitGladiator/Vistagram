const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
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