// server/routes/songRoutes.js
const express = require('express');
const {
    uploadSong,
    getAllSongs,
    getSongById,
    streamSong,
    deleteSong,
    updateSongDetails
} = require('../controllers/songController');
const { protect, isArtistOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { songUploadFields } = require('../middleware/uploadMiddleware'); // Multer middleware

const router = express.Router();

// Public routes
router.get('/', getAllSongs);
router.get('/:id', getSongById);
router.get('/stream/:id', streamSong); // Could be protected if strict play tracking is needed

// Protected Routes (for verified artists or admin)
router.post('/upload', protect, isArtistOrAdmin, songUploadFields, uploadSong);

// Protected Routes (for owner or admin)
router.put('/:id', protect, updateSongDetails); // We'll add owner/admin check in controller
router.delete('/:id', protect, deleteSong);     // We'll add owner/admin check in controller


module.exports = router;