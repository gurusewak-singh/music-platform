// client/src/components/playlist/SelectablePlaylistCard.jsx
import React, { memo } from 'react';
import { FiMusic, FiCheckCircle } from 'react-icons/fi'; // Added FiCheckCircle

const SelectablePlaylistCard = memo((props) => {
  const { playlist, onClick, isSelected } = props;
  const songCount = playlist.songs?.length || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-150 ease-in-out group
                  ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-200 overflow-hidden">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiMusic size={24} />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <p className={`font-semibold truncate ${isSelected ? 'text-indigo-700' : 'text-gray-700 group-hover:text-gray-900'}`}>
            {playlist.name}
          </p>
          <p className={`text-xs truncate ${isSelected ? 'text-indigo-500' : 'text-gray-500'}`}>
            {songCount} {songCount === 1 ? 'song' : 'songs'}
          </p>
        </div>
        {isSelected && (
          <FiCheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
        )}
      </div>
    </button>
  );
});

export default SelectablePlaylistCard;