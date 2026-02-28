const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getSuggestedUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/suggested', authenticateToken, getSuggestedUsers); // Must be before /:user_id
router.get('/:user_id', getProfile);
router.put('/:user_id', authenticateToken, updateProfile);

module.exports = router;