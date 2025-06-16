// client/src/pages/PlaylistPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { formatTime } from '../utils/formatters';
import {
  getPlaylistById,
  deletePlaylist,
  removeSongFromPlaylist,
  updatePlaylistDetails
} from '../services/playlistService';
import {
  FiPlay,
  FiEdit2,
  FiTrash2,
  FiXCircle,
  FiMoreVertical,
  FiSave,
  FiX,
  FiMusic,
  FiUsers,
  FiLock,
  FiUnlock,
  FiPause // Ensured FiPause is imported
} from 'react-icons/fi';
import AuthPromptModal from '../components/ui/AuthPromptModal';
import { notifySuccess, notifyError } from '../utils/notifications';
import SongList from '../components/playlist/SongList';

const PlaylistPage = () => {
  const { id: playlistId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useContext(AuthContext);
  
  // Destructure state from PlayerContext as 'playerState' to avoid naming conflicts with local state.
  const {
    currentSong,
    isPlaying,
    queue: playerQueue, // Renamed to avoid conflict with local 'setQueue' function if any
    setQueue, // This is the action from PlayerContext
    pause: playerPause, // Action from PlayerContext
  } = useContext(PlayerContext);

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', isPublic: true });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingSong, setIsRemovingSong] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchPlaylist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaylistById(playlistId);
      if (data.success) {
        setPlaylist(data.playlist);
        setEditFormData({
          name: data.playlist.name,
          description: data.playlist.description || '',
          isPublic: data.playlist.isPublic
        });
      } else {
        setError(data.message || 'Playlist not found or access denied.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading playlist.');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const isOwner = user && playlist && playlist.owner._id === user._id;

  const handlePlayPlaylistAttempt = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (playlist && playlist.songs.length > 0) {
      // Check if the current song is the first in this playlist, the playlist is the current queue, AND it's playing
      const isCurrentlyPlayingThisPlaylistFromStart =
        currentSong?._id === playlist.songs[0]._id &&
        isPlaying &&
        playerQueue.length === playlist.songs.length &&
        playerQueue.every((qSong, index) => qSong._id === playlist.songs[index]._id);

      if (isCurrentlyPlayingThisPlaylistFromStart) {
        playerPause(); // If already playing this playlist from start, pause it
      } else {
        setQueue(playlist.songs, 0, true); // Start playing from the first song
      }
    }
  };

  const handlePlaySongInPlaylistAttempt = (songToPlay, index) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (currentSong?._id === songToPlay._id && isPlaying) {
      playerPause();
    } else {
      setQueue(playlist.songs, index, true);
    }
  };

  const handleRemoveSong = async (songIdToRemove) => {
    if (!window.confirm("Are you sure you want to remove this song from the playlist?")) return;
    setIsRemovingSong(songIdToRemove);
    try {
      const result = await removeSongFromPlaylist(playlistId, songIdToRemove);
      if (result.success) {
        // Update local playlist state directly for immediate UI feedback
        setPlaylist(prevPlaylist => ({
          ...prevPlaylist,
          songs: prevPlaylist.songs.filter(song => song._id !== songIdToRemove)
        }));
        notifySuccess("Song removed from playlist.");
      } else {
        notifyError(result.message || 'Failed to remove song.');
      }
    } catch (err) {
      notifyError(err.message || 'Error removing song.');
    } finally {
      setIsRemovingSong(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deletePlaylist(playlistId);
      notifySuccess('Playlist deleted successfully.');
      navigate('/my-playlists');
    } catch (err) {
      notifyError(err.message || 'Error deleting playlist.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      notifyError("Playlist name cannot be empty.");
      return;
    }
    setIsSubmittingEdit(true);
    try {
      const result = await updatePlaylistDetails(playlistId, editFormData);
      if (result.success) {
        setPlaylist(result.playlist); // Update with the full playlist object from response
        setIsEditing(false);
        notifySuccess("Playlist details updated.");
      } else {
        notifyError(result.message || "Failed to update playlist details.");
      }
    } catch (err) {
      notifyError(err.message || "Error updating playlist.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };


  if (loading || isAuthLoading) return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  if (error) return <div className="container mx-auto p-4"><Alert message={error} type="error" onClose={() => setError(null)} /></div>;
  if (!playlist) return <div className="container mx-auto p-4"><Alert message="Playlist details are unavailable." type="info" /></div>;

  // More accurate check: is the current playing queue exactly this playlist?
  const isThisPlaylistTheCurrentQueue =
    playlist.songs.length > 0 &&
    playerQueue.length === playlist.songs.length &&
    playerQueue.every((qSong, index) => qSong._id === playlist.songs[index]._id);

  const isPlaylistCurrentlyPlaying = isThisPlaylistTheCurrentQueue && isPlaying;


  return (
    <>
      <div className="py-4 md:py-8">
        {/* Playlist Header */}
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
                  <FiMusic size={64} className="text-slate-500"/>
                </div>
              )}
            </div>

            <div className="flex-grow text-center md:text-left">
              <p className="text-xs uppercase tracking-wider text-indigo-300 mb-1">Playlist</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold my-1 break-words leading-tight">{playlist.name}</h1>
              {playlist.description && <p className="text-indigo-200 text-sm mb-3 max-w-xl">{playlist.description}</p>}
              <div className="text-xs sm:text-sm text-indigo-300 flex items-center justify-center md:justify-start space-x-2 mb-4">
                {playlist.isPublic ? <FiUnlock size={14} title="Public"/> : <FiLock size={14} title="Private"/>}
                <span>Created by <Link to={`/profile/${playlist.owner._id}`} className="font-semibold hover:underline text-indigo-100">{playlist.owner.username}</Link></span>
                <span>·</span>
                <span>{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                <button
                  onClick={handlePlayPlaylistAttempt}
                  disabled={playlist.songs.length === 0}
                  className={`flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                              ${isPlaylistCurrentlyPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {isPlaylistCurrentlyPlaying ? <FiPause className="mr-2" size={20}/> : <FiPlay className="mr-2" size={20}/>}
                  {isPlaylistCurrentlyPlaying ? 'Pause' : 'Play'}
                </button>
                {isOwner && (
                  <>
                    <button onClick={() => setIsEditing(true)} title="Edit Details" className="flex items-center text-indigo-100 hover:text-white text-xs sm:text-sm p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"><FiEdit2 size={16}/></button>
                    <button onClick={handleDeletePlaylist} disabled={isDeleting} title="Delete Playlist" className="flex items-center text-red-300 hover:text-red-100 text-xs sm:text-sm p-2 sm:p-3 rounded-full hover:bg-red-500/20 transition-colors disabled:opacity-50">
                      {isDeleting ? <Spinner/> : <FiTrash2 size={16}/>}
                    </button>
                  </>
                )}
                 <button title="More options" className="text-indigo-100 hover:text-white p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors"><FiMoreVertical size={16}/></button>
              </div>
            </div>
          </div>
        </div>

        {isEditing && isOwner && (
          <div className="my-6 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Edit Playlist Details</h3>
                  <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20}/></button>
              </div>
              <form onSubmit={handleUpdatePlaylist} className="space-y-4">
                  <div>
                      <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" id="editName" value={editFormData.name} onChange={handleEditFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                  </div>
                  <div>
                      <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea name="description" id="editDescription" value={editFormData.description} onChange={handleEditFormChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                  </div>
                  <div className="flex items-center">
                      <input type="checkbox" name="isPublic" id="editIsPublic" checked={editFormData.isPublic} onChange={handleEditFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                      <label htmlFor="editIsPublic" className="ml-2 block text-sm text-gray-900">Public Playlist</label>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} disabled={isSubmittingEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                      <button type="submit" disabled={isSubmittingEdit || !editFormData.name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75">
                          {isSubmittingEdit ? 'Saving...' : <><FiSave className="inline mr-1"/> Save Changes</>}
                      </button>
                  </div>
              </form>
          </div>
        )}

        {/* Song List */}
        <SongList
          songs={playlist.songs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={handlePlaySongInPlaylistAttempt}
          isOwner={isOwner}
          onRemoveSong={handleRemoveSong}
          isRemovingSong={isRemovingSong}
        />
      </div>
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Please log in or register to play music."
      />
    </>
  );
};

export default PlaylistPage;