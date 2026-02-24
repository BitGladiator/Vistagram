const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/:user_id', getProfile);
router.put('/:user_id', authenticateToken, updateProfile); // ← Fixed: use authenticateToken

module.exports = router;