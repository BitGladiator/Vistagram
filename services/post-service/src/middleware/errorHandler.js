const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
  
    // PostgreSQL errors
    if (err.code === '23505') {
      status = 409;
      message = 'Resource already exists';
    }
  
    if (err.code === '23503') {
      status = 400;
      message = 'Invalid reference';
    }
  
    if (err.code === '23502') {
      status = 400;
      message = 'Required field missing';
    }
  
    res.status(status).json({
      status: 'error',
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: req.id || 'unknown'
      }
    });
  };
  
  module.exports = errorHandler;