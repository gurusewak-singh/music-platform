// client/src/components/playlist/PlaylistCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMusic, FiList } from 'react-icons/fi'; // Example icons
import { xor } from 'lodash';

const PlaylistCard = ({ playlist }) => {
  const name = playlist ? playlist.name : 'Untitled Playlist';
  const coverImage = playlist && playlist.coverImage ? playlist.coverImage : null;
  const songCount = playlist && playlist.songs ? playlist.songs.length : 0;
  const ownerUsername = playlist && playlist.owner && playlist.owner.username ? playlist.owner.username : null;

  return (
    <Link to={`/playlist/${playlist?._id || '#'}`} className="block group">
      <div className="bg-slate-800 p-4 rounded-lg shadow-lg hover:bg-slate-700 transition-colors duration-200">
        <div className="aspect-square w-full overflow-hidden rounded-md mb-3 relative bg-slate-700">
          {coverImage ? (
           <img
              src={coverImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiList size={48} className="text-slate-500" />
            </div>
          )}
           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
              <FiMusic size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
        <h3 className="text-md font-semibold truncate text-slate-50 group-hover:text-white">{name}</h3>
        <p className="text-xs text-slate-400 truncate">
          {songCount} {songCount === 1 ? 'song' : 'songs'}
          {ownerUsername && <span className="text-slate-500"> · by {ownerUsername}</span>}
        </p>
      </div>
    </Link>
  );
};

export default PlaylistCard;