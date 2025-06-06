// client/src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MusicPlayerBar from '../components/player/MusicPlayerBar';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import RegisterArtistPage from '../pages/RegisterArtistPage';
import NotFoundPage from '../pages/NotFoundPage';

import ProtectedRoute from './ProtectedRoutes'; // Import ProtectedRoute
import UploadSongPage from '../pages/UploadSongPage'; // Import UploadSongPage
import MyPlaylistsPage from '../pages/MyPlaylistsPage'; // Import
import PlaylistPage from '../pages/PlaylistPage';     // Import
// import AdminDashboardPage from '../pages/AdminDashboardPage'; // For later

const AppRouter = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="pb-24 md:pb-28">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-artist" element={<RegisterArtistPage />} />

              {/* Protected Routes */}
               <Route path="/my-playlists" element={<MyPlaylistsPage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} /> {/* :id is playlistId */}
              <Route element={<ProtectedRoute allowedRoles={['artist', 'admin']} />}>
              <Route element={<ProtectedRoute allowedRoles={['artist', 'admin']} requiresVerifiedArtist={true} />}>
                <Route path="/upload-song" element={<UploadSongPage />} />
              </Route>
                {/* 
                  Note: The requiresVerifiedArtist logic can be embedded into ProtectedRoute 
                  or checked within UploadSongPage itself if preferred.
                  For now, we allow 'artist' role. The backend will ultimately deny
                  non-verified artists if they try to upload via API.
                  A better UX would be to check user.isVerifiedArtist on the frontend too.
                */}
                <Route path="/upload-song" element={<UploadSongPage />} />
                {/* Add other artist/admin routes here */}
              </Route>

              {/* Example Admin Only Route (for later) */}
              {/*
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
              </Route>
              */}

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        <MusicPlayerBar />
      </div>
    </Router>
  );
};

export default AppRouter;