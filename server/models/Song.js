// server/models/Song.js
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a song title'],
        trim: true,
    },
    artist: { // This is the display artist name, could be from User.artistName or provided
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
    filePath: { // URL from Cloudinary for the audio file
        type: String,
        required: true,
    },
    cloudinaryAudioPublicId: { // Public ID for Cloudinary audio asset
        type: String,
        required: true,
    },
    coverArtPath: { // URL from Cloudinary for the cover art
        type: String,
    },
    cloudinaryCoverArtPublicId: { // Public ID for Cloudinary cover art asset
        type: String,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileHash: { // MD5 or SHA256 of the audio file content
        type: String,
        // unique: true, // Can cause issues if hash generation fails or is optional
        // sparse: true, // Good if unique is true and hash can be null
        index: true, // Index for faster lookups
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

// Optional: Index for searching by title and artist
songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema);