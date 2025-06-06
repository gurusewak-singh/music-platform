// client/src/pages/PlaylistPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { PlayerContext } from '../../context/PlayerContext';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { formatTime } from '../../utils/formatters'; // Correctly import formatTime
import {
  getPlaylistById,
  deletePlaylist,
  removeSongFromPlaylist,
  updatePlaylistDetails
} from '../../services/playlistService';
import {
  FiPlay, FiEdit2, FiTrash2, FiXCircle, FiMoreVertical, FiSave, FiX, FiMusic, FiUsers, FiLock, FiUnlock
} from 'react-icons/fi'; // Added more icons
const PlaylistPage = () => {
  const { id: playlistId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useContext(AuthContext);
  const { setQueue, currentSong, isPlaying, playSong, pause, audioRef } = useContext(PlayerContext); // Added playSong
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', isPublic: true });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingSong, setIsRemovingSong] = useState(null); // To show spinner on specific remove button

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

  const handlePlayPlaylist = () => {
    if (playlist && playlist.songs.length > 0) {
      // Check if the current song is the first in this playlist and is playing
      if (currentSong?._id === playlist.songs[0]._id && isPlaying) {
        pause(); // If already playing this playlist from start, pause it
      } else {
        setQueue(playlist.songs, 0, true); // Start playing from the first song, playOnSet = true
      }
    }
  };

  const handlePlaySongInPlaylist = (songToPlay, index) => {
    if (currentSong?._id === songToPlay._id && isPlaying) {
      pause();
    } else {
      // If the song is already in the current queue and it's this playlist's song
      // you could just seek to it, but for simplicity:
      setQueue(playlist.songs, index, true);
    }
  };

  const handleRemoveSong = async (songIdToRemove) => {
    if (!window.confirm("Are you sure you want to remove this song from the playlist?")) return;
    setIsRemovingSong(songIdToRemove);
    try {
      const result = await removeSongFromPlaylist(playlistId, songIdToRemove);
      if (result.success) {
        setPlaylist(result.playlist); // Update with the returned modified playlist
      } else {
        alert(result.message || 'Failed to remove song.');
      }
    } catch (err) {
      alert(err.message || 'Error removing song.');
    } finally {
      setIsRemovingSong(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deletePlaylist(playlistId);
      alert('Playlist deleted successfully.');
      navigate('/my-playlists');
    } catch (err) {
      alert(err.message || 'Error deleting playlist.');
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
      alert("Playlist name cannot be empty.");
      return;
    }
    setIsSubmittingEdit(true);
    try {
      const result = await updatePlaylistDetails(playlistId, editFormData);
      if (result.success) {
        setPlaylist(result.playlist);
        setIsEditing(false);
      } else {
        alert(result.message || "Failed to update playlist details.");
      }
    } catch (err) {
      alert(err.message || "Error updating playlist.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (loading || isAuthLoading) return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Spinner /></div>;
  if (error) return <div className="container mx-auto p-4"><Alert message={error} type="error" onClose={() => setError(null)} /></div>;
  if (!playlist) return <div className="container mx-auto p-4"><Alert message="Playlist details are unavailable." type="info" /></div>;

  const isPlaylistPlaying = playlist.songs.some(song => song._id === currentSong?._id) && isPlaying;

  return (
    <div className="py-4 md:py-8">
      {/* Playlist Header */}
      <div className="bg-gradient-to-t from-slate-900 via-slate-800 to-indigo-700 text-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold my-1 break-words leading-tight">{playlist.name}</h1>
            {playlist.description && <p className="text-indigo-200 text-sm mb-3 max-w-xl">{playlist.description}</p>}
            <div className="text-sm text-indigo-300 flex items-center justify-center md:justify-start space-x-2 mb-4">
              {playlist.isPublic ? <FiUnlock size={14} title="Public"/> : <FiLock size={14} title="Private"/>}
              <span>Created by <Link to={`/user/${playlist.owner._id}`} className="font-semibold hover:underline text-indigo-100">{playlist.owner.username}</Link></span>
              <span>·</span>
              <span>{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={handlePlayPlaylist}
                disabled={playlist.songs.length === 0}
                className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                            ${isPlaylistPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {isPlaylistPlaying ? <FiPause className="mr-2" size={22}/> : <FiPlay className="mr-2" size={22}/>}
                {isPlaylistPlaying ? 'Pause' : 'Play'}
              </button>
              {isOwner && (
                <>
                  <button onClick={() => setIsEditing(true)} title="Edit Details" className="flex items-center text-indigo-100 hover:text-white text-sm p-3 rounded-full hover:bg-white/10 transition-colors"><FiEdit2 size={18}/></button>
                  <button onClick={handleDeletePlaylist} disabled={isDeleting} title="Delete Playlist" className="flex items-center text-red-300 hover:text-red-100 text-sm p-3 rounded-full hover:bg-red-500/20 transition-colors disabled:opacity-50">
                    {isDeleting ? <Spinner/> : <FiTrash2 size={18}/>}
                  </button>
                </>
              )}
               <button title="More options" className="text-indigo-100 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"><FiMoreVertical size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal (simplified inline display) */}
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
      <div className="bg-white rounded-lg shadow-xl p-2 sm:p-4">
        {playlist.songs.length > 0 ? playlist.songs.map((song, index) => {
          const isThisSongPlaying = currentSong?._id === song._id && isPlaying;
          return (
            <div key={song._id} className={`flex items-center justify-between p-3 rounded-lg group transition-colors duration-150 ${isThisSongPlaying ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>
              <div className="flex items-center flex-grow truncate mr-4">
                <button onClick={() => handlePlaySongInPlaylist(song, index)} className="w-8 text-center mr-3 text-gray-500 hover:text-indigo-600 group-hover:opacity-100 transition-opacity">
                    {isThisSongPlaying ? <FiPause size={18} className="text-indigo-600"/> : <span className="opacity-50 group-hover:opacity-100">{index + 1}</span>}
                </button>
                <img src={song.coverArtPath || `https://via.placeholder.com/40/E2E8F0/4A5568?Text=${index+1}`} alt={song.title} className="w-10 h-10 object-cover rounded mr-4 shadow-sm"/>
                <div className="truncate">
                  <button onClick={() => handlePlaySongInPlaylist(song, index)} className={`font-semibold text-left truncate hover:text-indigo-600 focus:outline-none ${isThisSongPlaying ? 'text-indigo-600' : 'text-gray-800'}`}>
                    {song.title}
                  </button>
                  <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-sm text-gray-500 hidden sm:inline">{formatTime(song.duration)}</span>
                {isOwner && (
                  <button onClick={() => handleRemoveSong(song._id)} disabled={isRemovingSong === song._id} title="Remove from playlist"
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50">
                    {isRemovingSong === song._id ? <Spinner/> : <FiXCircle size={18}/>}
                  </button>
                )}
                {/* <button title="More options" className="text-gray-400 hover:text-indigo-600 p-1"><FiMoreVertical size={18}/></button> */}
              </div>
            </div>
          )
        }) : (
          <p className="text-gray-600 text-center py-10">This playlist is empty. <Link to="/" className="text-indigo-600 hover:underline">Discover songs</Link> to add!</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;