// client/src/routes/AppRouter.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MusicPlayerBar from '../components/player/MusicPlayerBar';
import Spinner from '../components/ui/Spinner';

const HomePage = React.lazy(() => import('../pages/HomePage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const RegisterArtistPage = React.lazy(() => import('../pages/RegisterArtistPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const ProtectedRoute = React.lazy(() => import('./ProtectedRoutes'));
const UploadSongPage = React.lazy(() => import('../pages/UploadSongPage'));
const MyPlaylistsPage = React.lazy(() => import('../pages/MyPlaylistsPage'));
const PlaylistPage = React.lazy(() => import('../pages/PlaylistPage'));
const SearchPage = React.lazy(() => import('../pages/SearchPage'));
const AdminDashboardPage = React.lazy(() => import('../pages/AdminDashboardPage'));
const ArtistProfilePage = React.lazy(() => import('../pages/ArtistProfilePage'));
const UserProfilePage = React.lazy(() => import('../pages/UserProfilePage'));

const AppRouter = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="pb-24 md:pb-28">
            <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Spinner size="xl" /></div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register-artist" element={<RegisterArtistPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/artist/:artistId" element={<ArtistProfilePage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />

                {/* Protected Routes for regular authenticated users (e.g., My Playlists) */}
                <Route element={<ProtectedRoute />}>
                   <Route path="/my-playlists" element={<MyPlaylistsPage />} />
                   <Route path="/playlist/:id" element={<PlaylistPage />} />
                </Route>

                {/* Protected Routes for verified artists/admin (e.g., Upload Song) */}
                <Route element={<ProtectedRoute allowedRoles={['artist', 'admin']} requiresVerifiedArtist={true} />}>
                  <Route path="/upload-song" element={<UploadSongPage />} />
                </Route>

                {/* Admin Only Route */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </main>
        <MusicPlayerBar />
      </div>
    </Router>
  );
};

export default AppRouter;