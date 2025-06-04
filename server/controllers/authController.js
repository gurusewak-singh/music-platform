// server/controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken'); // We created this

// @desc    Register a new general user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'Username is already taken' });
        }

        // Create user
        user = await User.create({
            username,
            email,
            password, // Password will be hashed by the pre-save hook in User model
            role: 'user', // Default role for general registration
        });

        // Generate token
        const token = generateToken(user._id, user.role, user.isVerifiedArtist);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { // Send some user info back, excluding password
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isVerifiedArtist: user.isVerifiedArtist
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
    }
};

// @desc    Register a new artist (application)
// @route   POST /api/auth/register-artist
// @access  Public
exports.registerArtist = async (req, res, next) => {
    const { username, email, password, artistName } = req.body;

    if (!artistName || artistName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Artist name is required' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'Username is already taken' });
        }

        user = await User.create({
            username,
            email,
            password,
            artistName,
            role: 'artist',
            isVerifiedArtist: false, // Artist needs admin verification
        });

        // We can choose to send a token immediately or make them log in after verification
        // For now, let's send a token so they are logged in, but frontend will gate features
        const token = generateToken(user._id, user.role, user.isVerifiedArtist);

        res.status(201).json({
            success: true,
            message: 'Artist registration submitted. Verification pending.',
            token, // Or null if you want them to log in after verification
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                artistName: user.artistName,
                isVerifiedArtist: user.isVerifiedArtist
            }
        });
    } catch (error) {
        console.error('Artist Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during artist registration', error: error.message });
    }
};


// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password'); // Explicitly select password

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials (email not found)' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials (password incorrect)' });
        }

        // Generate token
        const token = generateToken(user._id, user.role, user.isVerifiedArtist);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                artistName: user.artistName,
                isVerifiedArtist: user.isVerifiedArtist
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};