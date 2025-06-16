// client/src/pages/MyPlaylistsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getMyPlaylists } from '../services/playlistService';
import PlaylistCard from '../components/playlist/PlaylistCard';
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { AuthContext } from '../context/AuthContext';
import { FiPlusCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom'; // For "Discover songs" link if needed

const MyPlaylistsPage = () => {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Theme colors
  const theme = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    buttonText: '#ffffff',
    headingText: '#1f2937', // Default dark gray for heading
    subtleText: '#6b7280', // Default gray-500 for placeholder text
  };

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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
        <Spinner spinnerColor={theme.primary} />
    </div>
  );
  if (error) return <Alert message={error} type="error" />;
  if (!user && !loading) return <Alert message="Please login to view your playlists." type="info" />;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ color: theme.headingText }}>
          My <span style={{ color: theme.primary }}>Playlists</span>
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 text-sm font-medium rounded-lg shadow-md focus:outline-none focus:ring-4 transition-colors"
          style={{ 
            backgroundColor: theme.primary, 
            color: theme.buttonText,
            borderColor: theme.primary,
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = theme.secondary}
          onMouseOut={e => e.currentTarget.style.backgroundColor = theme.primary}
        >
          <FiPlusCircle className="mr-2" /> Create Playlist
        </button>
      </div>

      {playlists.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-xl mb-4" style={{ color: theme.subtleText }}>
            You haven't created any playlists yet.
          </p>
          <button
             onClick={() => setIsModalOpen(true)}
             className="px-6 py-3 text-base font-medium rounded-lg shadow-md focus:outline-none focus:ring-4 transition-colors"
             style={{ 
                backgroundColor: theme.secondary, 
                color: theme.buttonText,
                borderColor: theme.secondary,
             }}
             onMouseOver={e => e.currentTarget.style.backgroundColor = theme.primary}
             onMouseOut={e => e.currentTarget.style.backgroundColor = theme.secondary}
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-2 sm:px-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
        // primaryColor={theme.primary} 
        // secondaryColor={theme.secondary}
      />
    </div>
  );
};

export default MyPlaylistsPage;