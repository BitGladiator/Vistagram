const authenticateUser = (req, res, next) => {
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