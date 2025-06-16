import React from 'react';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiRepeat, FiShuffle } from 'react-icons/fi';

const PlayerControls = ({
  isPlaying,
  repeatMode,
  isShuffling,
  onPlayPause,
  onPrev,
  onNext,
  onRepeatToggle,
  onShuffleToggle
}) => (
  <div className="flex items-center space-x-4 mb-1">
    <button onClick={onShuffleToggle} title="Shuffle" className={`p-1 ${isShuffling ? 'text-indigo-400' : 'hover:text-gray-300'}`}>
      <FiShuffle size={18} />
    </button>
    <button onClick={onPrev} title="Previous" className="p-1 hover:text-gray-300">
      <FiSkipBack size={20} />
    </button>
    <button
      onClick={onPlayPause}
      title={isPlaying ? 'Pause' : 'Play'}
      className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-600"
    >
      {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} />}
    </button>
    <button onClick={onNext} title="Next" className="p-1 hover:text-gray-300">
      <FiSkipForward size={20} />
    </button>
    <button onClick={onRepeatToggle} title={`Repeat: ${repeatMode}`} className={`p-1 ${repeatMode !== 'none' ? 'text-indigo-400' : 'hover:text-gray-300'}`}>
      <FiRepeat size={18} /> {repeatMode === 'one' && <span className="text-xs absolute ml-0.5 mt-1.5">1</span>}
    </button>
  </div>
);

export default PlayerControls;
