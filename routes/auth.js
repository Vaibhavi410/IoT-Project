const express = require('express');
const router = express.Router();
const {
  register,
  login,
  firebaseLogin,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseLogin);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/update', authenticate, updateProfile);

module.exports = router;
