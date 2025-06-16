// client/src/components/playlist/AddToPlaylistModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getMyPlaylists, addSongToPlaylist } from '../../services/playlistService';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import SelectablePlaylistCard from './SelectablePlaylistCard'; // Import new component
import { FiPlusCircle } from 'react-icons/fi';
import { notifySuccess, notifyError } from '../../utils/notifications';

const AddToPlaylistModal = ({ isOpen, onClose, songToAdd, onSongAdded, onOpenCreatePlaylist }) => {
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
      setSelectedPlaylistId(''); // Reset selection
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
        notifySuccess(`Song "${songToAdd.title}" added.`);
        onSongAdded(selectedPlaylistId, songToAdd);
        onClose();
      } else {
        notifyError(result.message || 'Failed to add song.');
      }
    } catch (err) {
      notifyError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlaylistClick = () => {
    onClose();
    if (onOpenCreatePlaylist) {
      onOpenCreatePlaylist();
    }
  };

  const processing = isAuthLoading || isSubmitting || loadingPlaylists;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add "{songToAdd.title}" to Playlist</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

        {loadingPlaylists ? (
          <div className="py-4"><Spinner /></div>
        ) : (
          <>
            <button
              onClick={handleCreatePlaylistClick}
              className="w-full flex items-center justify-center p-3 mb-4 rounded-lg border-2 border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-colors"
              disabled={processing}
            >
              <FiPlusCircle className="mr-2" /> Create New Playlist
            </button>

            {playlists.length === 0 && !loadingPlaylists && (
              <p className="text-gray-500 text-center py-2">You don't have any playlists yet. Use the button above to create one.</p>
            )}

            {playlists.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-1">
                {playlists.map(p => (
                  <SelectablePlaylistCard
                    key={p._id}
                    playlist={p}
                    onClick={() => setSelectedPlaylistId(p._id)}
                    isSelected={selectedPlaylistId === p._id}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 mt-2">
              <button type="button" onClick={onClose} disabled={processing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={processing || !selectedPlaylistId}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-75">
                {isSubmitting ? 'Adding...' : 'Add to Playlist'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default AddToPlaylistModal;