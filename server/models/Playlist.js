// server/models/Playlist.js
const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a playlist name'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song',
        },
    ],
    coverImage: {
        type: String,
    },
    cloudinaryCoverImagePublicId: {
        type: String,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for regex-based search on playlist name
playlistSchema.index({ name: 1 });

// Optional: Text index if used
// playlistSchema.index({ name: 'text' });

module.exports = mongoose.model('Playlist', playlistSchema);