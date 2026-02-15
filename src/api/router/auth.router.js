const router = require('express').Router();
const authController = require('../controller/auth.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;

