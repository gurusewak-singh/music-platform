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
    owner: { // The user who created and owns the playlist
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    songs: [ // Array of song IDs
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song',
        },
    ],
    coverImage: { // Optional: URL from Cloudinary or a default
        type: String,
    },
    cloudinaryCoverImagePublicId: { // Public ID for Cloudinary cover image asset
        type: String,
    },
    isPublic: { // Whether the playlist is visible to others (future feature, good to have)
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Playlist', playlistSchema);