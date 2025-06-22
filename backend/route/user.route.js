const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  refreshToken, 
  getProfile, 
  updateProfile 
} = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
