const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Default error
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
  
    // PostgreSQL errors
    if (err.code === '23505') {
      // Unique violation
      status = 409;
      message = 'Resource already exists';
      
      if (err.detail.includes('username')) {
        message = 'Username already taken';
      } else if (err.detail.includes('email')) {
        message = 'Email already registered';
      }
    }
  
    if (err.code === '23503') {
      // Foreign key violation
      status = 400;
      message = 'Invalid reference';
    }
    if (err.code === '22P02') {
      status = 400;
      message = 'Invalid ID format';
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