// server/controllers/playlistController.js
const Playlist = require('../models/Playlist');
const Song = require('../models/Song'); // To validate song IDs
const cloudinary = require('../config/cloudinary'); // For playlist cover image (optional)

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private (Authenticated Users)
exports.createPlaylist = async (req, res) => {
    const { name, description, isPublic } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }

    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user._id, // From protect middleware
            isPublic: isPublic !== undefined ? isPublic : true,
            // coverImage and songs will be empty initially
        });

        res.status(201).json({
            success: true,
            message: 'Playlist created successfully',
            playlist,
        });
    } catch (error) {
        console.error('Create Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get playlists owned by the current user
// @route   GET /api/playlists/me
// @access  Private
exports.getMyPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user._id })
            .populate('songs', 'title artist duration coverArtPath') // Populate some song details
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: playlists.length,
            playlists,
        });
    } catch (error) {
        console.error('Get My Playlists Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get a single playlist by ID (public or owned)
// @route   GET /api/playlists/:id
// @access  Public (if playlist isPublic) or Private (if owner)
exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('owner', 'username') // Populate owner's username
            .populate({ // Populate songs with more details
                path: 'songs',
                select: 'title artist album duration filePath coverArtPath uploadedBy',
                populate: { path: 'uploadedBy', select: 'username artistName' } // Nested populate for song uploader
            });

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Access control: Allow if public or if the requester is the owner
        if (!playlist.isPublic && (!req.user || playlist.owner._id.toString() !== req.user._id.toString())) {
             return res.status(403).json({ success: false, message: 'You are not authorized to view this private playlist' });
        }


        res.status(200).json({ success: true, playlist });
    } catch (error) {
        console.error('Get Playlist By ID Error:', error);
         if (error.kind === 'ObjectId') {
             return res.status(404).json({ success: false, message: 'Playlist not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// @desc    Update playlist details (name, description, public status)
// @route   PUT /api/playlists/:id
// @access  Private (Owner only)
exports.updatePlaylistDetails = async (req, res) => {
    const { name, description, isPublic } = req.body;

    try {
        let playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Check if current user is the owner
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to update this playlist' });
        }

        playlist.name = name || playlist.name;
        playlist.description = description !== undefined ? description : playlist.description;
        playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;

        const updatedPlaylist = await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Playlist details updated',
            playlist: updatedPlaylist,
        });
    } catch (error) {
        console.error('Update Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Add a song to a playlist
// @route   PUT /api/playlists/:id/add-song
// @access  Private (Owner only)
exports.addSongToPlaylist = async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
        return res.status(400).json({ success: false, message: 'Song ID is required' });
    }

    try {
        let playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Check if current user is the owner
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to modify this playlist' });
        }

        // Check if song exists
        const songExists = await Song.findById(songId);
        if (!songExists) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }

        // Check if song is already in the playlist
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ success: false, message: 'Song already in this playlist' });
        }

        playlist.songs.push(songId);
        await playlist.save();

        // Populate the songs after adding
        const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs', 'title artist');


        res.status(200).json({
            success: true,
            message: 'Song added to playlist',
            playlist: updatedPlaylist,
        });
    } catch (error) {
        console.error('Add Song to Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Remove a song from a playlist
// @route   PUT /api/playlists/:id/remove-song
// @access  Private (Owner only)
exports.removeSongFromPlaylist = async (req, res) => {
    const { songId } = req.body; // Or req.params.songId if you prefer route param

     if (!songId) {
        return res.status(400).json({ success: false, message: 'Song ID is required' });
    }

    try {
        let playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Check if current user is the owner
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to modify this playlist' });
        }

        // Remove song from array
        playlist.songs = playlist.songs.filter(
            (id) => id.toString() !== songId.toString()
        );

        await playlist.save();
        const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs', 'title artist');


        res.status(200).json({
            success: true,
            message: 'Song removed from playlist',
            playlist: updatedPlaylist,
        });
    } catch (error) {
        console.error('Remove Song from Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private (Owner only)
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Check if current user is the owner
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this playlist' });
        }

        // Optional: Delete cover image from Cloudinary if it exists
        if (playlist.cloudinaryCoverImagePublicId) {
            await cloudinary.uploader.destroy(playlist.cloudinaryCoverImagePublicId, { resource_type: 'image' });
        }

        await playlist.deleteOne();

        res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error('Delete Playlist Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Optional: Upload/Update playlist cover image
// @desc    Update playlist cover image
// @route   PUT /api/playlists/:id/cover
// @access  Private (Owner only)
exports.updatePlaylistCoverImage = async (req, res) => {
    if (!req.file) { // Assuming multer middleware `upload.single('coverImage')` is used
        return res.status(400).json({ success: false, message: 'No cover image file uploaded' });
    }

    try {
        let playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'User not authorized to update this playlist cover' });
        }

        // Delete old cover image from Cloudinary if it exists
        if (playlist.cloudinaryCoverImagePublicId) {
            await cloudinary.uploader.destroy(playlist.cloudinaryCoverImagePublicId, { resource_type: 'image' });
        }

        // Upload new cover image to Cloudinary
        const coverUploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'playlist_covers', resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer); // Assuming multer memoryStorage
        });

        playlist.coverImage = coverUploadResult.secure_url;
        playlist.cloudinaryCoverImagePublicId = coverUploadResult.public_id;
        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Playlist cover image updated',
            playlist
        });

    } catch (error) {
        console.error('Update Playlist Cover Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Search public playlists by title
// @route   GET /api/playlists/search
// @access  Public
exports.searchPlaylists = async (req, res) => {
    const searchTerm = req.query.q || ''; // Expecting query param 'q' for search term
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    if (!searchTerm.trim()) {
        return res.status(400).json({ success: false, message: 'Search term is required' });
    }

    try {
        const query = {
            isPublic: true, // Only search public playlists
            $text: { $search: searchTerm }
        };

        const count = await Playlist.countDocuments(query);
        const playlists = await Playlist.find(query)
            .populate('owner', 'username') // Populate owner info
            .populate('songs', 'title')    // Optionally populate a few song titles
            .sort({ /* You can add sorting, e.g., by relevance or createdAt */ })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            success: true,
            playlists,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });

    } catch (error) {
        console.error('Search Playlists Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};