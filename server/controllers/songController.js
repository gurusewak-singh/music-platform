// server/controllers/songController.js
const Song = require('../models/Song');
const User = require('../models/User'); // To get artist name if needed
const cloudinary = require('../config/cloudinary');
const crypto = newFunction(); // For hashing file content
const musicMetadata = require('music-metadata'); // For audio duration
const path = require('path');
const fs = require('fs'); // For temporary file saving/reading if needed
const mongoose = require('mongoose'); // Add this if not present at the top

// Helper function to upload to Cloudinary
const uploadToCloudinary = (filePath, resourceType = 'auto', folder = 'songs') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                folder: folder,
                resource_type: resourceType, // 'video' for audio, 'image' for cover art
                // Eager transformations for audio (example - can be removed if not needed)
                // eager: [
                //   { format: 'mp3', audio_codec: 'mp3' },
                //   { format: 'ogg', audio_codec: 'vorbis' }
                // ],
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return reject(error);
                }
                resolve(result);
            }
        );
    });
};


// @desc    Upload a new song
// @route   POST /api/songs/upload
// @access  Private (Verified Artists or Admin)
exports.uploadSong = async (req, res) => {
    const { title, artist: artistString, album, genre } = req.body; // 'artist' here is the display artist name

    if (!req.files || !req.files.audioFile) {
        return res.status(400).json({ success: false, message: 'No audio file uploaded' });
    }
    if (!title) {
         return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const audioFile = req.files.audioFile[0]; // Assuming multer is configured for 'audioFile'
    const coverArtFile = req.files.coverArtFile ? req.files.coverArtFile[0] : null;

    try {
        // 1. Calculate File Hash for Duplication Check (using audioFile.buffer)
        const fileBuffer = audioFile.buffer;
        const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

        const existingSongByHash = await Song.findOne({ fileHash: hash });
        if (existingSongByHash) {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: 'This exact audio file has already been uploaded.',
                song: existingSongByHash // Optionally send existing song info
            });
        }

        // 2. (Optional) Extract metadata like duration
        let durationInSeconds;
        try {
            const metadata = await musicMetadata.parseBuffer(fileBuffer, audioFile.mimetype);
            if (metadata.format.duration) {
                durationInSeconds = Math.round(metadata.format.duration);
            }
        } catch (metaError) {
            console.warn('Could not parse audio metadata:', metaError.message);
        }


        // 3. Upload audio file to Cloudinary
        // Multer provides the file in req.files.audioFile[0].path if using diskStorage
        // If using memoryStorage (as assumed by .buffer above), we need to stream buffer to Cloudinary
        const audioUploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'songs_audio',
                    resource_type: 'video', // Cloudinary treats audio as video type
                    // transformation: [{ audio_codec: "aac", audio_frequency: 44100 }] // Example
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(audioFile.buffer);
        });


        // 4. Upload cover art to Cloudinary (if provided)
        let coverArtUploadResult;
        if (coverArtFile) {
             coverArtUploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'songs_cover_art',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(coverArtFile.buffer);
            });
        }

        // 5. Create and save song document
        const newSong = new Song({
            title,
            artist: artistString || req.user.artistName || req.user.username, // Use provided string, or uploader's artistName/username
            album,
            genre,
            duration: durationInSeconds,
            filePath: audioUploadResult.secure_url,
            cloudinaryAudioPublicId: audioUploadResult.public_id,
            coverArtPath: coverArtUploadResult ? coverArtUploadResult.secure_url : undefined,
            cloudinaryCoverArtPublicId: coverArtUploadResult ? coverArtUploadResult.public_id : undefined,
            uploadedBy: req.user._id, // from protect middleware
            fileHash: hash,
        });

        await newSong.save();

        res.status(201).json({
            success: true,
            message: 'Song uploaded successfully',
            song: newSong,
        });

    } catch (error) {
        console.error('Song Upload Error:', error);
        // Clean up Cloudinary uploads if DB save fails (more advanced error handling)
        // if (audioUploadResult && audioUploadResult.public_id) {
        //     await cloudinary.uploader.destroy(audioUploadResult.public_id, { resource_type: 'video' });
        // }
        // if (coverArtUploadResult && coverArtUploadResult.public_id) {
        //     await cloudinary.uploader.destroy(coverArtUploadResult.public_id, { resource_type: 'image' });
        // }
        res.status(500).json({ success: false, message: 'Server error during song upload', error: error.message });
    }
};

// @desc    Get all songs (with pagination)
// @route   GET /api/songs
// @access  Public
exports.getAllSongs = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.search || '';
    let query = {};

    if (searchTerm.trim()) {
        const escapedSearchTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearchTerm, 'i'); // 'i' for case-insensitive

        // Search for the term within any of the specified fields
        query = {
            $or: [
                { title: regex },
                { artist: regex },
                { album: regex },
                { genre: regex }
            ]
        };
        // Note: For "all words must match partially", the logic would be more complex,
        // involving splitting searchTerm into words and creating an $and query with $or for each term.
        // For example: if search is "dead brain", it would look for "dead" AND "brain" across fields.
        // The current simpler regex looks for the *entire phrase* "dead brain" (case-insensitive) within fields.
        // Or if search is "brai", it looks for "brai" (case-insensitive) within fields.
    }

    try {
        const count = await Song.countDocuments(query);
        const songs = await Song.find(query)
            .populate('uploadedBy', 'username artistName')
            .sort({ createdAt: -1 }) // Or by relevance if using $text search properly configured
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            success: true,
            songs,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        console.error('Get All Songs Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get a single song by ID
// @route   GET /api/songs/:id
// @access  Public
exports.getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id)
                               .populate('uploadedBy', 'username artistName');
        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }
        res.status(200).json({ success: true, song });
    } catch (error) {
        console.error('Get Song By ID Error:', error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ success: false, message: 'Song not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Stream a song (This will likely just provide the Cloudinary URL)
// @route   GET /api/songs/stream/:id
// @access  Public (or Protected if you want to track plays accurately)
exports.streamSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }

        // Increment play count (could be done more reliably if route is protected)
        song.plays = (song.plays || 0) + 1;
        await song.save();

        // Option 1: Redirect to Cloudinary URL (simplest for client handling)
        // res.redirect(song.filePath);

        // Option 2: Send the URL for the client to use in <audio src>
        res.status(200).json({
            success: true,
            streamUrl: song.filePath, // The direct Cloudinary URL
            songTitle: song.title
        });

        // Option 3 (More Complex): Proxy the stream from your server.
        // This gives more control but uses your server's bandwidth.
        // Requires handling Range requests for seeking.
        // For a student project, Option 1 or 2 is recommended with Cloudinary.

    } catch (error) {
        console.error('Stream Song Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private (Owner or Admin)
exports.deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }

        // Check if user is admin or owner of the song
        if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this song' });
        }

        // Delete from Cloudinary
        if (song.cloudinaryAudioPublicId) {
            await cloudinary.uploader.destroy(song.cloudinaryAudioPublicId, { resource_type: 'video' });
        }
        if (song.cloudinaryCoverArtPublicId) {
            await cloudinary.uploader.destroy(song.cloudinaryCoverArtPublicId, { resource_type: 'image' });
        }

        await song.deleteOne(); // Mongoose v6+

        res.status(200).json({ success: true, message: 'Song deleted successfully' });

    } catch (error) {
        console.error('Delete Song Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update song details (e.g., title, artist string - not file replacement)
// @route   PUT /api/songs/:id
// @access  Private (Owner or Admin)
exports.updateSongDetails = async (req, res) => {
    const { title, artist, album, genre } = req.body;

    try {
        let song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }

        // Authorization: Owner or Admin
        if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to update this song' });
        }

        song.title = title || song.title;
        song.artist = artist || song.artist;
        song.album = album || song.album;
        song.genre = genre || song.genre;

        const updatedSong = await song.save();

        res.status(200).json({
            success: true,
            message: 'Song details updated',
            song: updatedSong
        });

    } catch (error) {
        console.error('Update Song Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all songs by a specific artist
// @route   GET /api/songs/artist/:artistId
// @access  Public
exports.getSongsByArtist = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10, adjust as needed
    const page = parseInt(req.query.page) || 1;
    const { artistId } = req.params; // This artistId should be the User._id

    if (!mongoose.Types.ObjectId.isValid(artistId)) { // Validate if artistId is a valid ObjectId
        return res.status(400).json({ success: false, message: 'Invalid Artist ID format' });
    }

    try {
        const query = { uploadedBy: artistId };

        const count = await Song.countDocuments(query);
        const songs = await Song.find(query)
            .populate('uploadedBy', 'username artistName')
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            success: true,
            songs,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        console.error(`Error fetching songs for artist ${artistId}:`, error);
        res.status(500).json({ success: false, message: 'Server error while fetching artist songs' });
    }
};


module.exports = exports; // Ensure all exported functions are available

function newFunction() {
    return require('crypto');
}