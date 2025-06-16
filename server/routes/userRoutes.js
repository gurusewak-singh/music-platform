// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getPublicUserProfile } = require('../controllers/userController');

// @route   GET /api/users/public-profile/:userId
// @desc    Get a user's public profile
// @access  Public
router.get('/public-profile/:userId', getPublicUserProfile);

module.exports = router;