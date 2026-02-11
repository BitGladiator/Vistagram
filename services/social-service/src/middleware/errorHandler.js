const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
  
    // PostgreSQL errors
    if (err.code === '23505') {
      status = 409;
      message = 'Action already performed';
      
      if (err.detail.includes('follow')) {
        message = 'Already following this user';
      } else if (err.detail.includes('like')) {
        message = 'Already liked this post';
      }
    }
  
    if (err.code === '23503') {
      status = 400;
      message = 'Invalid reference';
    }
  
    if (err.code === '23514') {
      status = 400;
      message = 'Constraint violation';
      
      if (err.detail && err.detail.includes('self')) {
        message = 'Cannot perform this action on yourself';
      }
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