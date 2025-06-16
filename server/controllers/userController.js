// server/controllers/userController.js
const User = require('../models/User');

// @desc    Get public profile of a user by ID
// @route   GET /api/users/public-profile/:userId
// @access  Public
exports.getPublicUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('username artistName role isVerifiedArtist createdAt'); // Select ONLY public-safe fields

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get Public User Profile Error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'User not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};