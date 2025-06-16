// client/src/pages/SearchPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchSongs } from '../services/songService';
import { searchPlaylists } from '../services/playlistService';
import SongListItem from '../components/song/SongListItem'; // Import new component
import PlaylistListItem from '../components/playlist/PlaylistListItem'; // Import new component
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal'; // For SongListItem
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal'; // For SongListItem
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import AuthPromptModal from '../components/ui/AuthPromptModal';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext'; // For AddToPlaylistModal
import SkeletonSongListItem from '../components/song/SkeletonSongListItem';
import SkeletonPlaylistListItem from '../components/playlist/SkeletonPlaylistListItem';
import Pagination from '../components/ui/Pagination';

const SEARCH_RESULTS_LIMIT = 8; // Show top 8 results initially

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [songResults, setSongResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('songs');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { setQueue, currentSong, isPlaying } = useContext(PlayerContext);
  const { isAuthenticated } = useContext(AuthContext); // For modals

  // For AddToPlaylistModal and CreatePlaylistModal logic within SearchPage context
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isAuthModalOpenForSearch, setIsAuthModalOpenForSearch] = useState(false);

  // Move these up so they're defined before use
  const handleSongAddedToPlaylist = useCallback((playlistId, addedSong) => {
    // Maybe a success toast
  }, []);
  const openCreatePlaylistModalFromSearch = useCallback(() => {
    setSelectedSongForPlaylist(null); // Close add modal if open
    setIsCreatePlaylistModalOpen(true);
  }, [setSelectedSongForPlaylist, setIsCreatePlaylistModalOpen]);

  const fetchResults = useCallback(async (currentQuery, currentPage) => {
    if (!currentQuery.trim()) {
      setSongResults([]);
      setPlaylistResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        searchSongs(currentQuery, currentPage, SEARCH_RESULTS_LIMIT), // Fetch limited results
        searchPlaylists(currentQuery, currentPage, SEARCH_RESULTS_LIMIT) // Fetch limited results
      ]);
       const songsData = results[0].status === 'fulfilled' ? results[0].value : null;
       const playlistsData = results[1].status === 'fulfilled' ? results[1].value : null;

       if (songsData && songsData.success) {
         setSongResults(songsData.songs || []);
         setTotalPages(Math.ceil(songsData.totalResults / SEARCH_RESULTS_LIMIT));
       } else {
         setSongResults([]);
         if (results[0].status === 'rejected') console.error("Song search failed:", results[0].reason);
       }

       if (playlistsData && playlistsData.success) {
         setPlaylistResults(playlistsData.playlists || []);
         setTotalPages(Math.ceil(playlistsData.totalResults / SEARCH_RESULTS_LIMIT));
       } else {
         setPlaylistResults([]);
         if (results[1].status === 'rejected') console.error("Playlist search failed:", results[1].reason);
       }

       if (results.every(r => r.status === 'rejected')) {
           setError('Failed to fetch any search results.');
       }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during search.');
      setSongResults([]);
      setPlaylistResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query, page);
  }, [query, page, fetchResults]);

 const handlePlaylistCreatedFromSearch = () => {
     setIsCreatePlaylistModalOpen(false);
     // Optionally, if selectedSongForPlaylist was set, reopen AddToPlaylistModal
     // if (selectedSongForPlaylist) handleOpenAddToPlaylistForAuthenticatedUser(selectedSongForPlaylist);
 };

 // This is the function that SongListItem will eventually call via its onPlay prop
 // AFTER SongListItem's own handlePlayAttempt has verified authentication.
 const handlePlaySongFromSearch = (songToPlay, allSearchedSongs) => {
    const startIndex = allSearchedSongs.findIndex(s => s._id === songToPlay._id);
    setQueue(allSearchedSongs, startIndex >= 0 ? startIndex : 0, true);
 };

 // This function is called by SongListItem's onAddToPlaylist IF user is authenticated
 const handleOpenAddToPlaylistForAuthenticatedUser = (song) => {
    setSelectedSongForPlaylist(song);
 };

  const renderContent = () => {
     if (loading) {
       if (activeTab === 'songs') {
         return (
           <div className="bg-white shadow rounded-lg p-2 md:p-4 space-y-1">
             {Array.from({ length: 5 }).map((_, idx) => (
               <SkeletonSongListItem key={idx} />
             ))}
           </div>
         );
       } else if (activeTab === 'playlists') {
         return (
           <div className="bg-white shadow rounded-lg p-2 md:p-4 space-y-1">
             {Array.from({ length: 4 }).map((_, idx) => (
               <SkeletonPlaylistListItem key={idx} />
             ))}
           </div>
         );
       } else {
         return <div className="flex justify-center py-10"><Spinner /></div>;
       }
     }
     if (!query.trim() && !error) return <p className="text-center text-gray-500 py-10">Enter a search term above to find music.</p>;

    if (activeTab === 'songs') {
      if (songResults.length === 0 && !loading && query.trim() && !error) {
          return <p className="text-center text-gray-500 py-10">No songs found for "<span className="font-semibold">{query}</span>".</p>;
      }
      return (
        <div className="space-y-1 bg-white shadow rounded-lg p-2 md:p-4 px-2 sm:px-4">
          {songResults.map(song => (
            <SongListItem
              key={song._id}
              song={song}
              onPlay={() => handlePlaySongFromSearch(song, songResults)}
              // This will be called by SongListItem's handleAddToPlaylistAttempt if user is authenticated
              onAddToPlaylist={() => handleOpenAddToPlaylistForAuthenticatedUser(song)}
              isPlayingThisSong={currentSong?._id === song._id && isPlaying}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'playlists') {
      if (playlistResults.length === 0 && !loading && query.trim() && !error) {
          return <p className="text-center text-gray-500 py-10">No playlists found for "<span className="font-semibold">{query}</span>".</p>;
      }
      return (
        <div className="space-y-1 bg-white shadow rounded-lg p-2 md:p-4 px-2 sm:px-4">
          {playlistResults.map(playlist => (
            <PlaylistListItem key={playlist._id} playlist={playlist} />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Search</h1>
          {query.trim() && <p className="text-gray-600 mt-1">Results for: <span className="font-semibold">"{query}"</span></p>}
        </div>

        <div className="mb-6 border-b border-gray-300">
          <nav className="-mb-px flex space-x-6 justify-center" aria-label="Tabs">
            <button onClick={() => setActiveTab('songs')} /* ... */ >
              Songs {songResults.length > 0 && `(${songResults.length})`}
            </button>
            <button onClick={() => setActiveTab('playlists')} /* ... */ >
              Playlists {playlistResults.length > 0 && `(${playlistResults.length})`}
            </button>
          </nav>
        </div>

        {error && <div className="my-6"><Alert message={error} type="error" onClose={() => setError(null)} /></div>}
        <div>{renderContent()}</div>

        {/* Pagination component for paginated search results */}
        {activeTab === 'songs' && totalPages > 1 && (
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
        {activeTab === 'playlists' && totalPages > 1 && (
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* Auth Prompt Modal controlled by SongListItem's internal state, or if SearchPage needs its own */}
        <AuthPromptModal
            isOpen={isAuthModalOpenForSearch}
            onClose={() => {
                setIsAuthModalOpenForSearch(false);
                setSelectedSongForPlaylist(null);
            }}
            message="Please log in to add songs to playlists."
        />
        {/* This AddToPlaylistModal is shown AFTER user is authenticated and selectedSongForPlaylist is set */}
        {selectedSongForPlaylist && isAuthenticated && !isAuthModalOpenForSearch && (
             <AddToPlaylistModal
                isOpen={!!selectedSongForPlaylist}
                onClose={() => setSelectedSongForPlaylist(null)}
                songToAdd={selectedSongForPlaylist}
                onSongAdded={handleSongAddedToPlaylist}
                onOpenCreatePlaylist={openCreatePlaylistModalFromSearch}
            />
        )}
        {isCreatePlaylistModalOpen && (
            <CreatePlaylistModal
                isOpen={isCreatePlaylistModalOpen}
                onClose={() => setIsCreatePlaylistModalOpen(false)}
                onPlaylistCreated={handlePlaylistCreatedFromSearch}
            />
        )}
      </div>
    </>
  );
};

export default SearchPage;