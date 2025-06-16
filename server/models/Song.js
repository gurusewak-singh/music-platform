// server/models/Song.js
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a song title'],
        trim: true,
    },
    artist: {
        type: String,
        required: [true, 'Please add an artist name'],
        trim: true,
    },
    album: {
        type: String,
        trim: true,
    },
    genre: {
        type: String,
        trim: true,
    },
    duration: { // in seconds
        type: Number,
    },
    filePath: {
        type: String,
        required: true,
    },
    cloudinaryAudioPublicId: {
        type: String,
        required: true,
    },
    coverArtPath: {
        type: String,
    },
    cloudinaryCoverArtPublicId: {
        type: String,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileHash: {
        type: String,
        index: true,
    },
    plays: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for regex-based search (important for performance)
songSchema.index({ title: 1 });
songSchema.index({ artist: 1 });
songSchema.index({ album: 1 });
songSchema.index({ genre: 1 });

// Optional: Keep $text index if you plan to use it for different types of full-text search.
// If you primarily use regex for search, the individual field indexes above are more critical.
// songSchema.index({ title: 'text', artist: 'text', genre: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);