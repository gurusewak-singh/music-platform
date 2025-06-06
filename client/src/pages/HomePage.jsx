// client/src/pages/HomePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getAllSongs } from '../services/songService';
import SongCard from '../components/song/SongCard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { PlayerContext } from '../context/PlayerContext';

const HomePage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // We only need setQueue from PlayerContext here, as it handles playing the song.
  const { setQueue } = useContext(PlayerContext);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllSongs(page, 12); // Fetch 12 songs per page
        if (data.success) {
          setSongs(data.songs);
          setTotalPages(data.pages);
        } else {
          setError(data.message || 'Failed to fetch songs');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching songs.');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [page]);

  const handlePlayListedSong = (songToPlay, allListedSongs) => {
    // Find the index of the song to play within the current list
    const startIndex = allListedSongs.findIndex(s => s._id === songToPlay._id);
    // Set the queue with all listed songs and start playing from the selected song
    setQueue(allListedSongs, startIndex >= 0 ? startIndex : 0, true); // playOnSet is true by default in context
  };

  if (loading && songs.length === 0) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="mt-6"><Alert message={error} type="error" /></div>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Discover Music</h1>
      {songs.length === 0 && !loading && (
        <p className="text-gray-600 text-center">No songs found. Be the first to upload!</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {songs.map((song) => (
          <SongCard key={song._id} song={song} onPlay={() => handlePlayListedSong(song, songs)} />
        ))}
      </div>

      {/* Basic Pagination (can be improved) */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50 hover:bg-indigo-600"
          >
            Previous
          </button>
          <span className="text-gray-700">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50 hover:bg-indigo-600"
          >
            Next
          </button>
        </div>
      )}
       {loading && songs.length > 0 && <div className="mt-4 flex justify-center"><Spinner /></div>}
    </div>
  );
};

export default HomePage;