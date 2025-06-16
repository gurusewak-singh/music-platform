// server/routes/songRoutes.js
const express = require('express');
const {
    uploadSong,
    getAllSongs,
    getSongById,
    streamSong,
    deleteSong,
    updateSongDetails,
    getSongsByArtist // Import the new controller function
} = require('../controllers/songController');
const { protect, isArtistOrAdmin } = require('../middleware/authMiddleware'); // Removed isAdmin as isArtistOrAdmin covers it for upload
const { songUploadFields } = require('../middleware/uploadMiddleware'); // Multer middleware

const router = express.Router();

// Public routes
router.get('/', getAllSongs);
router.get('/artist/:artistId', getSongsByArtist); // <-- ADD THIS NEW ROUTE
router.get('/:id', getSongById);
router.get('/stream/:id', streamSong); // Could be protected if strict play tracking is needed

// Protected Routes (for verified artists or admin)
router.post('/upload', protect, isArtistOrAdmin, songUploadFields, uploadSong);

// Protected Routes (for owner or admin)
router.put('/:id', protect, updateSongDetails); // Controller handles owner/admin check
router.delete('/:id', protect, deleteSong);   // Controller handles owner/admin check


module.exports = router;