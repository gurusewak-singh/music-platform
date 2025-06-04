// server/controllers/adminController.js
const User = require('../models/User');
const Song = require('../models/Song'); // If admin needs to manage songs directly
const Playlist = require('../models/Playlist'); // If admin needs to manage playlists

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        // Exclude passwords even if not explicitly selected out in model for admin view
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error('Get All Users Error (Admin):', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get a single user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get User By ID Error (Admin):', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'User not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update user details by ID (Admin only - e.g., role, verify artist)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUserByAdmin = async (req, res) => {
    const { role, isVerifiedArtist, artistName } = req.body; // Fields admin might change

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields if provided
        if (role && ['user', 'artist', 'admin'].includes(role)) {
            user.role = role;
        }
        if (isVerifiedArtist !== undefined) {
            user.isVerifiedArtist = isVerifiedArtist;
        }
        if (artistName !== undefined) { // Admin can set/update artist name
            user.artistName = artistName;
        }

        // Prevent admin from accidentally changing their own role from admin via this route
        if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
             return res.status(400).json({ success: false, message: 'Admins cannot change their own role from admin via this endpoint.' });
        }


        const updatedUser = await user.save();
        // Exclude password from response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;


        res.status(200).json({
            success: true,
            message: 'User updated successfully by admin',
            user: userResponse,
        });
    } catch (error) {
        console.error('Update User by Admin Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Verify an artist (Admin only) - Specific endpoint for clarity
// @route   PUT /api/admin/users/:id/verify-artist
// @access  Private (Admin)
exports.verifyArtist = async (req, res) => {
     try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'artist') {
            // Optionally, admin could also change role to 'artist' here
            // user.role = 'artist';
            // return res.status(400).json({ success: false, message: 'User is not registered as an artist. Consider changing role first.' });
        }

        user.isVerifiedArtist = true;
        // If role wasn't 'artist', admin should change it via updateUserByAdmin or here
        if (user.role !== 'artist') user.role = 'artist';

        const updatedUser = await user.save();
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Artist verified successfully',
            user: userResponse,
        });
    } catch (error) {
        console.error('Verify Artist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Delete a user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Admins cannot delete their own account.' });
        }

        // TODO: More complex logic if deleting a user:
        // - What happens to their uploaded songs? Reassign to a generic "Platform" user or delete?
        // - What happens to their playlists? Delete?
        // For now, we'll just delete the user document.

        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted successfully by admin' });
    } catch (error) {
        console.error('Delete User by Admin Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Optional: Admin can delete any song (already covered by SongController if admin is isArtistOrAdmin,
// but an explicit admin route might be cleaner for admin panel)

// Optional: Admin can delete any playlist
exports.deletePlaylistByAdmin = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId); // Assuming playlistId in params
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Delete cover image from Cloudinary if it exists
        if (playlist.cloudinaryCoverImagePublicId) {
            await cloudinary.uploader.destroy(playlist.cloudinaryCoverImagePublicId, { resource_type: 'image' });
        }
        await playlist.deleteOne();
        res.status(200).json({ success: true, message: 'Playlist deleted by admin' });
    } catch (error) {
        console.error('Admin Delete Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};