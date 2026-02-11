// Simple auth middleware
// In production, this would verify JWT tokens
// For now, we'll just check if user_id is provided

const authenticateUser = (req, res, next) => {
    // In a real app, you'd extract user_id from JWT token
    // For now, we'll accept it from headers for testing
    const userId = req.headers['x-user-id'];
  
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'UNAUTHORIZED',
          message: 'User ID required in x-user-id header'
        }
      });
    }
  
    req.userId = userId;
    next();
  };
  
  module.exports = { authenticateUser };