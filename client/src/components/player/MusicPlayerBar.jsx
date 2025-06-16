// client/src/components/player/MusicPlayerBar.jsx
import React, { useContext, useState } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { formatTime } from '../../utils/formatters'; // Import from utils
import {
  FiVolume2, FiVolumeX, FiVolume1, FiRepeat, FiShuffle,
  FiX // Import the X icon
} from 'react-icons/fi';
import PlayerControls from './PlayerControls';

// Helper to format time (e.g., 0:00)


const MusicPlayerBar = () => {
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted, repeatMode, isShuffling,
    pause, resume, seekTime, setVolume, toggleMute, nextSong, prevSong, setRepeatMode, toggleShuffle,
    clearQueue // Assuming you have clearQueue to stop and clear everything
  } = useContext(PlayerContext);

  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  // Reset visibility when a new song is played after closing
  React.useEffect(() => {
    if (currentSong && !isVisible) {
      setIsVisible(true);
    }
    // eslint-disable-next-line
  }, [currentSong]);

  // If not visible OR no current song, don't render
  if (!isVisible || !currentSong) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleSeek = (e) => {
    seekTime(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleRepeatToggle = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleClosePlayer = () => {
    if (clearQueue) {
      clearQueue();
    }
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-3 shadow-lg z-40 flex items-center justify-between">
      {/* Left Side: Song Info */}
      <div className="flex items-center w-1/4">
        <img
          src={currentSong.coverArtPath || 'https://via.placeholder.com/60?text=No+Art'}
          alt={currentSong.title}
          className="w-12 h-12 object-cover rounded mr-3"
        />
        <div>
          <p className="text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate max-w-[100px] sm:max-w-[160px] md:max-w-[200px]">{currentSong.artist}</p>
        </div>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center w-1/2">
        <PlayerControls
          isPlaying={isPlaying}
          repeatMode={repeatMode}
          isShuffling={isShuffling}
          onPlayPause={handlePlayPause}
          onPrev={prevSong}
          onNext={nextSong}
          onRepeatToggle={handleRepeatToggle}
          onShuffleToggle={toggleShuffle}
        />
        <div className="flex items-center w-full max-w-md">
          <span className="text-xs mr-2">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer accent-indigo-500"
          />
          <span className="text-xs ml-2">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Side: Volume Control & Close Button */}
      <div className="hidden sm:flex items-center w-1/4 justify-end space-x-2">
        <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"} className="p-1 hover:text-gray-300">
          {isMuted ? <FiVolumeX size={18} /> : volume > 0.5 ? <FiVolume2 size={18} /> : <FiVolume1 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 h-1.5 bg-gray-600 rounded-lg cursor-pointer accent-indigo-500"
        />
        <button 
          onClick={handleClosePlayer} 
          title="Close Player" 
          className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded-full transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>
      {/* Volume/Mute/Close for xs screens: only show mute and close */}
      <div className="flex sm:hidden items-center w-1/4 justify-end space-x-2">
        <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"} className="p-1 hover:text-gray-300">
          {isMuted ? <FiVolumeX size={16} /> : volume > 0.5 ? <FiVolume2 size={16} /> : <FiVolume1 size={16} />}
        </button>
        <button 
          onClick={handleClosePlayer} 
          title="Close Player" 
          className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded-full transition-colors"
        >
          <FiX size={14} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayerBar;