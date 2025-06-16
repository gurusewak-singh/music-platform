// client/src/components/playlist/PlaylistListItem.jsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiMusic, FiList, FiPlayCircle } from 'react-icons/fi';

const PlaylistListItem = memo((props) => {
  const { playlist } = props;

  const name = playlist ? playlist.name : 'Untitled Playlist';
  const coverImage = playlist && playlist.coverImage ? playlist.coverImage : null;
  const songCount = playlist && playlist.songs ? playlist.songs.length : 0;
  const ownerUsername = playlist && playlist.owner && playlist.owner.username ? playlist.owner.username : null;

  return (
    <Link
      to={`/playlist/${playlist?._id || '#'}`}
      className="flex items-center p-3 rounded-lg group hover:bg-gray-100 transition-colors duration-150"
    >
      <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center mr-4 rounded">
        {coverImage ? (
          <img src={coverImage} alt={name} className="w-full h-full object-cover rounded" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded">
            <FiList size={24} className="text-gray-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded transition-opacity">
          <FiPlayCircle size={28} className="text-white opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-800 truncate group-hover:text-indigo-600">{name}</p>
        <p className="text-sm text-gray-500 truncate">
          {ownerUsername ? `By ${ownerUsername} • ` : ''}
          {songCount} {songCount === 1 ? 'song' : 'songs'}
        </p>
      </div>
    </Link>
  );
});

export default PlaylistListItem;