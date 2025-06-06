// client/src/components/playlist/CreatePlaylistModal.jsx
import React, { useState, useContext } from 'react';
import { createPlaylist } from '../../services/playlistService';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../ui/Alert';

const CreatePlaylistModal = ({ isOpen, onClose, onPlaylistCreated }) => {
  const { isLoading: isAuthLoading } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist name is required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const newPlaylistData = await createPlaylist({ name, description, isPublic });
      if (newPlaylistData.success) {
        onPlaylistCreated(newPlaylistData.playlist); // Callback to parent
        setName('');
        setDescription('');
        setIsPublic(true);
        onClose(); // Close modal
      } else {
        setError(newPlaylistData.message || 'Failed to create playlist.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const processing = isAuthLoading || isSubmitting;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Create New Playlist</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playlistName" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <input type="text" id="playlistName" value={name} onChange={(e) => setName(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={processing} />
          </div>
          <div>
            <label htmlFor="playlistDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea id="playlistDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={processing}></textarea>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="playlistIsPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={processing} />
            <label htmlFor="playlistIsPublic" className="ml-2 block text-sm text-gray-900">Public Playlist</label>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} disabled={processing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" disabled={processing || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed">
              {isSubmitting ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;