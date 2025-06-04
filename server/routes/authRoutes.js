// server/routes/authRoutes.js
const express = require('express');
const {
    registerUser,
    registerArtist,
    loginUser,
    // We'll add getMe later
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // For protected routes

const router = express.Router();

router.post('/register', registerUser);
router.post('/register-artist', registerArtist);
router.post('/login', loginUser);

// Example of a protected route to get current user details
router.get('/me', protect, async (req, res) => {
    // req.user is populated by the 'protect' middleware
    if (req.user) {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } else {
        // This case should ideally be caught by protect middleware,
        // but as a fallback:
        res.status(404).json({ success: false, message: 'User not found after token verification' });
    }
});


module.exports = router;