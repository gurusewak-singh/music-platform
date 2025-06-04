// server/routes/adminRoutes.js
const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUserByAdmin,
    verifyArtist,
    deleteUserByAdmin,
    deletePlaylistByAdmin // Optional
} = require('../controllers/adminController');

const { protect, isAdmin } = require('../middleware/authMiddleware'); // isAdmin checks req.user.role === 'admin'

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect);
router.use(isAdmin); // This middleware will be applied to all subsequent routes in this router

router.route('/users')
    .get(getAllUsers);      // GET /api/admin/users

router.route('/users/:id')
    .get(getUserById)          // GET /api/admin/users/:id
    .put(updateUserByAdmin)    // PUT /api/admin/users/:id
    .delete(deleteUserByAdmin); // DELETE /api/admin/users/:id

router.route('/users/:id/verify-artist')
    .put(verifyArtist);     // PUT /api/admin/users/:id/verify-artist

// Optional admin route for deleting any playlist
// router.route('/playlists/:playlistId').delete(deletePlaylistByAdmin);

module.exports = router;