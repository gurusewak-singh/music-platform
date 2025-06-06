// client/src/components/song/SongCard.jsx
import React, { useContext, useState } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import AddToPlaylistModal from '../playlist/AddToPlaylistModal'; // Import modal
import { AuthContext } from '../../context/AuthContext'; // To check if user is logged in
import { FiPlayCircle, FiPauseCircle, FiPlusSquare, FiMoreHorizontal, FiMusic } from 'react-icons/fi';

const SongCard = ({ song, onPlay }) => {
  const { currentSong, isPlaying, pause } = useContext(PlayerContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false); // State for modal visibility

  const isCurrentlyPlayingThisSong = currentSong?._id === song._id && isPlaying;

  const handlePlayClick = () => {
    if (isCurrentlyPlayingThisSong) {
      pause();
    } else {
      onPlay();
    }
  };

  const handleOpenAddToPlaylistModal = () => {
    if (isAuthenticated) { // Double check user is authenticated before opening
      setIsAddToPlaylistModalOpen(true);
    } else {
      // Optionally, navigate to login or show a message
      alert("Please log in to add songs to a playlist.");
    }
  };

  const handleSongAddedToPlaylist = (playlistId, addedSong) => {
    // Optionally show a success notification here (e.g., using a toast library)
    console.log(`Song "${addedSong.title}" added to playlist ID ${playlistId}`);
    // You might want to refresh playlist data elsewhere if this affects other components immediately.
  };

  const placeholderImage = (
    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
      <FiMusic size={48} className="text-gray-500" />
    </div>
  );

  return (
    <> {/* Fragment to wrap card and its modal */}
      <div className="bg-slate-800 p-4 rounded-lg shadow-lg text-slate-100 hover:bg-slate-700 transition-colors duration-200 group flex flex-col justify-between">
        {/* Top part with image and text */}
        <div>
          <div className="relative mb-3"> {/* Added relative for button positioning if needed */}
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
              onClick={handlePlayClick}
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

        {/* Bottom part with action icons */}
        <div className="mt-3 pt-2 border-t border-slate-700 flex justify-end items-center space-x-3">
          {isAuthenticated && ( // Only show "Add to Playlist" if user is logged in
            <button
              onClick={handleOpenAddToPlaylistModal} // Call handler to open modal
              title="Add to playlist"
              className="text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <FiPlusSquare size={18}/>
            </button>
          )}
          {/* <button title="More options" className="text-slate-400 hover:text-indigo-400 transition-colors">
            <FiMoreHorizontal size={18}/>
          </button> */}
        </div>
      </div>

      {/* Conditionally render the AddToPlaylistModal */}
      {/* It's important that `songToAdd` is valid when the modal is open */}
      {isAddToPlaylistModalOpen && song && (
        <AddToPlaylistModal
          isOpen={isAddToPlaylistModalOpen}
          onClose={() => setIsAddToPlaylistModalOpen(false)}
          songToAdd={song} // Pass the current song object to the modal
          onSongAdded={handleSongAddedToPlaylist}
        />
      )}
    </>
  );
};

export default SongCard;