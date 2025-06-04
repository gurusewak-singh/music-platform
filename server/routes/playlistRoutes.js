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
    updatePlaylistCoverImage // Optional
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');
const { singleImageUpload } = require('../middleware/uploadMiddleware'); // For cover image

const router = express.Router();

router.get('/search', searchPlaylists); // GET /api/playlists/search?q=MySearchTerm
router.get('/:id', getPlaylistById); // GET /api/playlists/:id (controller handles public/private logic)

// All playlist routes require authentication
router.use(protect);

router.route('/')
    .post(createPlaylist); // POST /api/playlists

router.route('/me')
    .get(getMyPlaylists); // GET /api/playlists/me

router.route('/:id')
    .get(getPlaylistById)       // GET /api/playlists/:id
    .put(updatePlaylistDetails) // PUT /api/playlists/:id
    .delete(deletePlaylist);    // DELETE /api/playlists/:id

router.route('/:id/add-song')
    .put(addSongToPlaylist);    // PUT /api/playlists/:id/add-song

router.route('/:id/remove-song')
    .put(removeSongFromPlaylist); // PUT /api/playlists/:id/remove-song

// Optional: Route for playlist cover image
router.route('/:id/cover')
    .put(singleImageUpload.single('coverImage'), updatePlaylistCoverImage); // PUT /api/playlists/:id/cover


module.exports = router;