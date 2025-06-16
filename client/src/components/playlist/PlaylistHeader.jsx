import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiPause, FiEdit2, FiTrash2, FiMoreVertical, FiMusic, FiLock, FiUnlock, FiSave, FiX } from 'react-icons/fi';
import Spinner from '../ui/Spinner';

const PlaylistHeader = ({
  playlist,
  isOwner,
  isPlaylistCurrentlyPlaying,
  isDeleting,
  handlePlayPlaylistAttempt,
  setIsEditing,
  handleDeletePlaylist,
  currentUserId,
}) => {
  return (
    <div className="bg-gradient-to-t from-slate-900 via-slate800 to-indigo-700 text-white p-4 sm:p-8 rounded-xl shadow-2xl mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
        <div className="relative mb-6 md:mb-0 flex-shrink-0">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-lg shadow-xl"
            />
          ) : (
            <div className="w-40 h-40 md:w-52 md:h-52 bg-slate-700 rounded-lg shadow-xl flex items-center justify-center">
              <FiMusic size={64} className="text-slate-500" />
            </div>
          )}
        </div>
        <div className="flex-grow text-center md:text-left">
          <p className="text-xs uppercase tracking-wider text-indigo-300 mb-1">Playlist</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold my-1 break-words leading-tight">{playlist.name}</h1>
          {playlist.description && <p className="text-indigo-200 text-sm mb-3 max-w-xl">{playlist.description}</p>}
          <div className="text-xs sm:text-sm text-indigo-300 flex items-center justify-center md:justify-start space-x-2 mb-4">
            {playlist.isPublic ? <FiUnlock size={14} title="Public" /> : <FiLock size={14} title="Private" />}
            <span>Created by <Link to={`/profile/${playlist.owner._id}`} className="font-semibold hover:underline text-indigo-100">{playlist.owner.username}</Link></span>
            <span>·</span>
            <span>{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
            <button
              onClick={handlePlayPlaylistAttempt}
              disabled={playlist.songs.length === 0}
              className={`flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isPlaylistCurrentlyPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isPlaylistCurrentlyPlaying ? <FiPause className="mr-2" size={20} /> : <FiPlay className="mr-2" size={20} />}
              {isPlaylistCurrentlyPlaying ? 'Pause' : 'Play'}
            </button>
            {isOwner && (
              <>
                <button onClick={() => setIsEditing(true)} title="Edit Details" className="flex items-center text-indigo-100 hover:text-white text-xs sm:text-sm p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"><FiEdit2 size={16} /></button>
                <button onClick={handleDeletePlaylist} disabled={isDeleting} title="Delete Playlist" className="flex items-center text-red-300 hover:text-red-100 text-xs sm:text-sm p-2 sm:p-3 rounded-full hover:bg-red-500/20 transition-colors disabled:opacity-50">
                  {isDeleting ? <Spinner /> : <FiTrash2 size={16} />}
                </button>
              </>
            )}
            <button title="More options" className="text-indigo-100 hover:text-white p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"><FiMoreVertical size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
