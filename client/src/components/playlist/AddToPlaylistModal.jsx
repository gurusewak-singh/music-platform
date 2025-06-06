// client/src/components/playlist/AddToPlaylistModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getMyPlaylists, addSongToPlaylist } from '../../services/playlistService';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';

const AddToPlaylistModal = ({ isOpen, onClose, songToAdd, onSongAdded }) => {
  const { user, isLoading: isAuthLoading } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoadingPlaylists(true);
      setError(null);
      getMyPlaylists()
        .then(data => {
          if (data.success) setPlaylists(data.playlists);
          else setError(data.message || 'Failed to load playlists');
        })
        .catch(err => setError(err.message || 'Error loading playlists'))
        .finally(() => setLoadingPlaylists(false));
    }
  }, [isOpen, user]);

  if (!isOpen || !songToAdd) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlaylistId) {
      setError('Please select a playlist.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await addSongToPlaylist(selectedPlaylistId, songToAdd._id);
      if (result.success) {
        onSongAdded(selectedPlaylistId, songToAdd); // Callback to parent
        onClose();
      } else {
        setError(result.message || 'Failed to add song.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const processing = isAuthLoading || isSubmitting || loadingPlaylists;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add "{songToAdd.title}" to Playlist</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

        {loadingPlaylists ? <div className="py-4"><Spinner /></div> : (
          playlists.length === 0 ? (
            <p className="text-gray-600 text-center py-4">You don't have any playlists yet. <button className="text-indigo-600 hover:underline" onClick={() => { /* TODO: Open CreatePlaylistModal */ }}>Create one?</button></p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="playlistSelect" className="block text-sm font-medium text-gray-700">Select Playlist</label>
                <select id="playlistSelect" value={selectedPlaylistId} onChange={(e) => setSelectedPlaylistId(e.target.value)} required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  disabled={processing}>
                  <option value="" disabled>-- Select a playlist --</option>
                  {playlists.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onClose} disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={processing || !selectedPlaylistId}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-75">
                  {isSubmitting ? 'Adding...' : 'Add to Playlist'}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};
export default AddToPlaylistModal;