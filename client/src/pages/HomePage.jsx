// client/src/pages/HomePage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getAllSongs } from '../services/songService';
import SongListItem from '../components/song/SongListItem';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { PlayerContext } from '../context/PlayerContext';
import AuthPromptModal from '../components/ui/AuthPromptModal';
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal';
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal';
import { AuthContext } from '../context/AuthContext';
import SkeletonSongListItem from '../components/song/SkeletonSongListItem';
import Pagination from '../components/ui/Pagination';

const HomePage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { setQueue, currentSong, isPlaying } = useContext(PlayerContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isAuthModalOpenForHomepage, setIsAuthModalOpenForHomepage] = useState(false);

  // Theme colors (can be moved to a config or used directly)
  const themeColors = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    lightAccent: '#a0a8da',
    lightest: '#c4c9e9',
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllSongs(page, 10);
        if (data.success) {
          setSongs(data.songs);
          setTotalPages(data.pages);
        } else {
          setError(data.message || 'Failed to fetch songs');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching songs.');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [page]);

  const handlePlaySongFromHome = useCallback((songToPlay, allListedSongs) => {
    const startIndex = allListedSongs.findIndex(s => s._id === songToPlay._id);
    setQueue(allListedSongs, startIndex >= 0 ? startIndex : 0, true);
  }, [setQueue]);

  const handleOpenAddToPlaylistModal = useCallback((song) => {
    if (!isAuthenticated) {
      setIsAuthModalOpenForHomepage(true);
      setSelectedSongForPlaylist(song);
      return;
    }
    setSelectedSongForPlaylist(song);
  }, [isAuthenticated, setSelectedSongForPlaylist]);

  const handleSongAddedToPlaylist = (playlistId, addedSong) => {
    // You might want to show a success toast here using a toast library
  };

  const openCreatePlaylistModalFromHome = () => {
    setIsAuthModalOpenForHomepage(false);
    setSelectedSongForPlaylist(null);
    setIsCreatePlaylistModalOpen(true);
  };

  const handlePlaylistCreatedFromHome = () => {
    setIsCreatePlaylistModalOpen(false);
    // Optionally, if a song was selected to be added, you could re-open AddToPlaylistModal
    // if (selectedSongForPlaylist) {
    //   handleOpenAddToPlaylistModal(selectedSongForPlaylist);
    // }
  };

  if (loading && songs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Discover Music</h1>
        <div className="bg-white shadow-xl rounded-lg p-2 md:p-4 space-y-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonSongListItem key={index} />
          ))}
        </div>
      </div>
    );
  }
  if (error) return (
    <div className="container mx-auto px-4 py-8">
        <Alert message={error} type="error" />
    </div>
  );

  return (
    <>
      {/* Main content area with padding */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
            Discover <span style={{ color: themeColors.primary }}>Music</span>
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Explore the latest tracks and popular hits.
          </p>
        </div>

        {songs.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500 mb-4">No songs found yet.</p>
            {/* You can add a link to upload page if user is artist/admin */}
            <p className="text-gray-400">Be the first to <Link to="/upload-song" className="hover:underline" style={{color: themeColors.secondary}}>upload a song</Link>!</p>
          </div>
        )}

        {songs.length > 0 && (
          <div className="bg-white shadow-2xl rounded-xl p-3 md:p-6 space-y-1 px-2 sm:px-4">
            {songs.map((song) => (
              <SongListItem
                key={song._id}
                song={song}
                onPlay={() => handlePlaySongFromHome(song, songs)}
                onAddToPlaylist={() => handleOpenAddToPlaylistModal(song)}
                isPlayingThisSong={currentSong?._id === song._id && isPlaying}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Spinner for loading more pages, shown below content */}
        {loading && songs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Spinner spinnerColor={themeColors.primary} /> {/* Pass color to spinner if it supports it */}
          </div>
        )}
      </div>

      {/* Modals remain at the top level of the returned JSX for proper stacking */}
      <AuthPromptModal
        isOpen={isAuthModalOpenForHomepage}
        onClose={() => {
          setIsAuthModalOpenForHomepage(false);
          setSelectedSongForPlaylist(null);
        }}
        message="Please log in or register to manage playlists."
        // You can also theme the AuthPromptModal's buttons using themeColors
      />

      {selectedSongForPlaylist && isAuthenticated && !isAuthModalOpenForHomepage && (
        <AddToPlaylistModal
          isOpen={!!selectedSongForPlaylist}
          onClose={() => setSelectedSongForPlaylist(null)}
          songToAdd={selectedSongForPlaylist}
          onSongAdded={handleSongAddedToPlaylist}
          onOpenCreatePlaylist={openCreatePlaylistModalFromHome}
          // Theme this modal too
        />
      )}

      {isCreatePlaylistModalOpen && (
        <CreatePlaylistModal
          isOpen={isCreatePlaylistModalOpen}
          onClose={() => setIsCreatePlaylistModalOpen(false)}
          onPlaylistCreated={handlePlaylistCreatedFromHome}
          // Theme this modal too
        />
      )}
    </>
  );
};

export default HomePage;