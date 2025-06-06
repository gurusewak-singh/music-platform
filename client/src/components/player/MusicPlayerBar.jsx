// client/src/components/player/MusicPlayerBar.jsx
import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { formatTime } from '../../utils/formatters'; // Import from utils
import {
  FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiVolume1, FiRepeat, FiShuffle
} from 'react-icons/fi'; // Example icons

// Helper to format time (e.g., 0:00)


const MusicPlayerBar = () => {
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted, repeatMode, isShuffling,
    pause, resume, seekTime, setVolume, toggleMute, nextSong, prevSong, setRepeatMode, toggleShuffle,
  } = useContext(PlayerContext);

  if (!currentSong) {
    return null; // Don't render player if no song is loaded
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
          <p className="text-sm font-semibold truncate">{currentSong.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center w-1/2">
        <div className="flex items-center space-x-4 mb-1">
          <button onClick={toggleShuffle} title="Shuffle" className={`p-1 ${isShuffling ? 'text-indigo-400' : 'hover:text-gray-300'}`}>
            <FiShuffle size={18} />
          </button>
          <button onClick={prevSong} title="Previous" className="p-1 hover:text-gray-300">
            <FiSkipBack size={20} />
          </button>
          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-600"
          >
            {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} />}
          </button>
          <button onClick={nextSong} title="Next" className="p-1 hover:text-gray-300">
            <FiSkipForward size={20} />
          </button>
          <button onClick={handleRepeatToggle} title={`Repeat: ${repeatMode}`} className={`p-1 ${repeatMode !== 'none' ? 'text-indigo-400' : 'hover:text-gray-300'}`}>
            <FiRepeat size={18} /> {repeatMode === 'one' && <span className="text-xs absolute ml-0.5 mt-1.5">1</span>}
          </button>
        </div>
        <div className="flex items-center w-full max-w-md">
          <span className="text-xs mr-2">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg cursor-pointer accent-indigo-500" // `accent-indigo-500` styles the thumb and progress before thumb
          />
          <span className="text-xs ml-2">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Side: Volume Control */}
      <div className="flex items-center w-1/4 justify-end">
        <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"} className="mr-2 p-1 hover:text-gray-300">
          {isMuted ? <FiVolumeX size={20} /> : volume > 0.5 ? <FiVolume2 size={20} /> : <FiVolume1 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1.5 bg-gray-600 rounded-lg cursor-pointer accent-indigo-500"
        />
      </div>
    </div>
  );
};

export default MusicPlayerBar;