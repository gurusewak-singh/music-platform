// server/routes/playlistRoutes.js
const express = require('express');
const {
    searchPlaylists,
    createPlaylist,
    getMyPlaylists,
    getPlaylistById,
    updatePlaylistDetails,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    updatePlaylistCoverImage,
    getPlaylistsByUserId // Import the new controller function
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');
const { singleImageUpload } = require('../middleware/uploadMiddleware'); // For cover image

const router = express.Router();

// --- Publicly Accessible Routes ---
router.get('/search', searchPlaylists);
router.get('/user/:userId', getPlaylistsByUserId); // <-- ADD THIS NEW ROUTE HERE
// router.get('/:id', getPlaylistById); // getPlaylistById already handles public/private logic based on auth, so it can stay after protect or be moved here if purely public parts are desired without token

// All subsequent playlist routes require authentication
router.use(protect);

router.route('/')
    .post(createPlaylist);

router.route('/me')
    .get(getMyPlaylists);

router.route('/:id') // getPlaylistById here will benefit from req.user if user is logged in (for private playlists)
    .get(getPlaylistById)
    .put(updatePlaylistDetails)
    .delete(deletePlaylist);

router.route('/:id/add-song')
    .put(addSongToPlaylist);

router.route('/:id/remove-song')
    .put(removeSongFromPlaylist);

router.route('/:id/cover')
    .put(singleImageUpload.single('coverImage'), updatePlaylistCoverImage);

module.exports = router;