// client/src/pages/ArtistProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicUserProfile } from '../services/userService'; // Use the renamed function
import { getSongsByArtist } from '../services/songService';
import SongListItem from '../components/song/SongListItem';
import SkeletonSongListItem from '../components/song/SkeletonSongListItem';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import AuthPromptModal from '../components/ui/AuthPromptModal';
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal';
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { FiMusic, FiMic, FiCheckCircle, FiXCircle } from 'react-icons/fi';

// Theme colors (could be imported from a central theme file)
const theme = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    lightAccent: '#a0a8da',
    textOnPrimary: '#ffffff',
};

const ArtistProfilePage = () => {
    const { artistId } = useParams(); // This should be the User._id of the artist
    const [artistProfile, setArtistProfile] = useState(null);
    const [artistSongs, setArtistSongs] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingSongs, setLoadingSongs] = useState(true);
    const [error, setError] = useState(null);

    const { setQueue, currentSong, isPlaying } = useContext(PlayerContext);
    const { isAuthenticated } = useContext(AuthContext);

    // Modal States (copied from HomePage, adjust as needed for this page's context)
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
    const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);
            setError(null);
            try {
                const data = await getPublicUserProfile(artistId); // Use the renamed function
                if (data.success && data.user && data.user.role === 'artist') {
                    setArtistProfile(data.user);
                } else {
                    setError('Artist not found or user is not an artist.');
                    setArtistProfile(null);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch artist profile.');
                setArtistProfile(null);
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchSongs = async () => {
            setLoadingSongs(true);
            // setError(null); // Don't clear error from profile fetch
            try {
                const data = await getSongsByArtist(artistId, 1, 50); // Fetch up to 50 songs for now
                if (data.success) {
                    setArtistSongs(data.songs);
                } else {
                    // setError(data.message || 'Failed to fetch artist songs.');
                    console.warn("Could not fetch artist songs:", data.message);
                    setArtistSongs([]);
                }
            } catch (err) {
                // setError(err.message || 'Error fetching artist songs.');
                console.warn("Error fetching artist songs:", err.message);
                setArtistSongs([]);
            } finally {
                setLoadingSongs(false);
            }
        };
        
        if (artistId) {
            fetchProfile();
            fetchSongs();
        } else {
            setError("Artist ID is missing.");
            setLoadingProfile(false);
            setLoadingSongs(false);
        }

    }, [artistId]);

    const handlePlayArtistSong = (songToPlay) => {
        // Assumes SongListItem handles the auth prompt
        const queueToPlay = [songToPlay, ...artistSongs.filter(s => s._id !== songToPlay._id)];
        const startIndex = 0; // Start with the clicked song
        setQueue(queueToPlay, startIndex, true);
    };
    
    const handleOpenAddToPlaylistModal = (song) => { /* ... same as HomePage ... */
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            setSelectedSongForPlaylist(song); // For after login
            return;
        }
        setSelectedSongForPlaylist(song);
    };
    const handleSongAddedToPlaylist = () => { /* ... */ };
    const openCreatePlaylistModal = () => { /* ... */ };
    const handlePlaylistCreated = () => { /* ... */ };


    if (loadingProfile) return <div className="flex justify-center items-center h-screen"><Spinner spinnerColor={theme.primary} /></div>;
    if (error) return <div className="container mx-auto px-4 py-8"><Alert message={error} type="error" /></div>;
    if (!artistProfile) return <div className="container mx-auto px-4 py-8 text-center text-gray-500">Artist profile data is unavailable.</div>;

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {/* Artist Header */}
                <div className="mb-12 p-6 sm:p-8 rounded-xl shadow-2xl" style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}>
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
                        <div className="mb-4 sm:mb-0">
                            <FiMic className="text-white opacity-50" size={80} /> {/* Generic artist icon */}
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                                {artistProfile.artistName || artistProfile.username}
                            </h1>
                            {artistProfile.isVerifiedArtist && (
                                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <FiCheckCircle className="mr-1 -ml-0.5" /> Verified Artist
                                </span>
                            )}
                            {!artistProfile.isVerifiedArtist && artistProfile.role ==='artist' && (
                                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                   <FiXCircle className="mr-1 -ml-0.5" /> Unverified
                                </span>
                            )}
                            {/* Add Bio here if available: <p className="mt-2 text-indigo-100">{artistProfile.bio}</p> */}
                        </div>
                    </div>
                </div>

                {/* Artist's Songs */}
                <h2 className="text-2xl font-bold text-gray-700 mb-6">
                    Songs by {artistProfile.artistName || artistProfile.username}
                </h2>
                {loadingSongs && (
                  <div className="bg-white shadow-xl rounded-lg p-2 md:p-4 space-y-1 px-2 sm:px-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <SkeletonSongListItem key={idx} />
                    ))}
                  </div>
                )}
                {!loadingSongs && artistSongs.length === 0 && (
                    <p className="text-gray-500">This artist hasn't uploaded any songs yet.</p>
                )}
                {artistSongs.length > 0 && (
                    <div className="bg-white shadow-xl rounded-lg p-2 md:p-4 space-y-1 px-2 sm:px-4">
                        {artistSongs.map(song => (
                            <SongListItem
                                key={song._id}
                                song={song}
                                onPlay={() => handlePlayArtistSong(song)}
                                onAddToPlaylist={() => handleOpenAddToPlaylistModal(song)}
                                isPlayingThisSong={currentSong?._id === song._id && isPlaying}
                            />
                        ))}
                    </div>
                )}
                {/* TODO: Pagination for songs if many */}
            </div>

            {/* Modals */}
            <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} message="Please log in to perform this action."/>
            {selectedSongForPlaylist && isAuthenticated && !isAuthModalOpen && (
                <AddToPlaylistModal
                    isOpen={!!selectedSongForPlaylist}
                    onClose={() => setSelectedSongForPlaylist(null)}
                    songToAdd={selectedSongForPlaylist}
                    onSongAdded={handleSongAddedToPlaylist}
                    onOpenCreatePlaylist={openCreatePlaylistModal}
                />
            )}
            {isCreatePlaylistModalOpen && (
                <CreatePlaylistModal
                    isOpen={isCreatePlaylistModalOpen}
                    onClose={() => setIsCreatePlaylistModalOpen(false)}
                    onPlaylistCreated={handlePlaylistCreated}
                />
            )}
        </>
    );
};

export default ArtistProfilePage;