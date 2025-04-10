const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentUser);
router.get('/verify', authController.verifySession);

module.exports = router; 