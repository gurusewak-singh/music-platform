// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // We'll create this next
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes'); // Import song routes
const playlistRoutes = require('./routes/playlistRoutes'); // Import playlist routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const userRoutes = require('./routes/userRoutes'); // Import user routes

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded request bodies

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount Routers
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth
app.use('/api/users', userRoutes); // Mount user routes under /api/users
app.use('/api/songs', songRoutes); // Mount song routes under /api/songs
app.use('/api/playlists', playlistRoutes); // Mount playlist routes
app.use('/api/admin', adminRoutes); // Mount admin routes
// TODO: Define Routes (e.g., app.use('/api/auth', authRoutes);)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});