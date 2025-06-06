// client/src/pages/MyPlaylistsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getMyPlaylists } from '../../services/playlistService';
import PlaylistCard from '../components/playlist/PlaylistCard';
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { AuthContext } from '../../context/AuthContext';
import { FiPlusCircle } from 'react-icons/fi';

const MyPlaylistsPage = () => {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) { // Only fetch if user is logged in
      setLoading(true);
      getMyPlaylists()
        .then(data => {
          if (data.success) setPlaylists(data.playlists);
          else setError(data.message || 'Failed to load playlists');
        })
        .catch(err => setError(err.message || 'Error loading playlists'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // Not logged in, so not loading playlists
    }
  }, [user]); // Re-fetch if user changes (login/logout)

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists(prevPlaylists => [newPlaylist, ...prevPlaylists]); // Add to start of list
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <Alert message={error} type="error" />;
  if (!user) return <Alert message="Please login to view your playlists." type="info" />;


  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Playlists</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlusCircle className="mr-2" /> Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <p className="text-gray-600 text-center">You haven't created any playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={{...playlist, owner: {username: user.username}}} /> // Pass user.username as owner for card display
          ))}
        </div>
      )}

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  );
};

export default MyPlaylistsPage;