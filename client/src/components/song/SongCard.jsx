// client/src/components/song/SongCard.jsx
import React, { useContext, useState } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import AddToPlaylistModal from '../playlist/AddToPlaylistModal';
import CreatePlaylistModal from '../playlist/CreatePlaylistModal';
import { AuthContext } from '../../context/AuthContext';
import AuthPromptModal from '../ui/AuthPromptModal'; // Import the modal
import { FiPlayCircle, FiPauseCircle, FiPlusSquare, FiMusic } from 'react-icons/fi';

const SongCard = ({ song, onPlay }) => {
  const { currentSong, isPlaying: playerIsPlaying, pause: playerPause } = useContext(PlayerContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for auth modal

  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);

  const isCurrentlyPlayingThisSong = currentSong?._id === song._id && playerIsPlaying;

  const handlePlayAttempt = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true); // Open the auth modal
      return;
    }
    // Authenticated: proceed with original play logic
    if (isCurrentlyPlayingThisSong) {
      playerPause();
    } else {
      if (onPlay) onPlay();
    }
  };

  const handleOpenAddToPlaylistModalAttempt = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true); // Open the auth modal for this action too
      return;
    }
    // Authenticated: proceed to open the actual AddToPlaylistModal
    setIsAddToPlaylistModalOpen(true);
  };

  const openCreatePlaylistModalFromSongCard = () => {
    setIsAddToPlaylistModalOpen(false);
    setIsCreatePlaylistModalOpen(true);
  };

  const handlePlaylistCreated = (newPlaylist) => {
    setIsCreatePlaylistModalOpen(false);
    // After creating, user might want to add the song to this new playlist
    // So, we can reopen the AddToPlaylistModal. It will re-fetch playlists.
    if (isAuthenticated) { // Check again just in case
        setIsAddToPlaylistModalOpen(true);
    }
  };

  const placeholderImage = (
    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
      <FiMusic size={48} className="text-gray-500" />
    </div>
  );

  return (
    <>
      <div className="bg-slate-800 p-4 rounded-lg shadow-lg text-slate-100 hover:bg-slate-700 transition-colors duration-200 group flex flex-col justify-between">
        <div>
          <div className="relative mb-3">
            <div className="aspect-square w-full overflow-hidden rounded-md">
              {song.coverArtPath ? (
                <img
                  src={song.coverArtPath}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              ) : (
                placeholderImage
              )}
            </div>
            <button
              onClick={handlePlayAttempt} // Use new attempt handler
              className="absolute bottom-2 right-2 bg-green-500 text-white p-3 rounded-full shadow-xl transform transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 focus:outline-none hover:bg-green-600"
              title={isCurrentlyPlayingThisSong ? "Pause" : "Play"}
            >
              {isCurrentlyPlayingThisSong ? <FiPauseCircle size={28} /> : <FiPlayCircle size={28} />}
            </button>
          </div>
          <h3 className="text-md font-semibold truncate leading-tight text-slate-50 group-hover:text-white">{song.title}</h3>
          <p className="text-sm text-slate-400 truncate leading-tight">{song.artist}</p>
          {song.genre && (
            <p className="text-xs text-slate-500 truncate mt-1 leading-tight">{song.genre}</p>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-700 flex justify-end items-center space-x-3">
          <button
            onClick={handleOpenAddToPlaylistModalAttempt} // Use new attempt handler
            title="Add to playlist"
            className="text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <FiPlusSquare size={18}/>
          </button>
        </div>
      </div>

      {/* Regular Modals (only render if authenticated and their specific open state is true) */}
      {isAuthenticated && isAddToPlaylistModalOpen && song && (
        <AddToPlaylistModal
          isOpen={isAddToPlaylistModalOpen}
          onClose={() => setIsAddToPlaylistModalOpen(false)}
          songToAdd={song}
          onSongAdded={handleSongAddedToPlaylist}
          onOpenCreatePlaylist={openCreatePlaylistModalFromSongCard}
        />
      )}
      {isAuthenticated && isCreatePlaylistModalOpen && (
        <CreatePlaylistModal
          isOpen={isCreatePlaylistModalOpen}
          onClose={() => setIsCreatePlaylistModalOpen(false)}
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Log in or sign up to play music and manage your playlists."
      />
    </>
  );
};

export default SongCard;