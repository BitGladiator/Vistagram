const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/:user_id', getProfile);

module.exports = router;